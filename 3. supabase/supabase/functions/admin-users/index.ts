import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const STAFF_ROLES = ['service', 'support', 'sales_agent', 'executive'];
const ASSIGNABLE_ROLES = ['subscriber', 'stakeholder', 'service', 'support', 'sales_agent', 'executive'];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const ANON_KEY = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY');

    if (!SUPABASE_URL || !SERVICE_KEY || !ANON_KEY) {
      return json({ error: 'Missing Supabase server environment variables' }, 500);
    }

    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) return json({ error: 'Missing auth token' }, 401);

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: 'Invalid session' }, 401);

    const callerId = userData.user.id;
    const callerEmail = userData.user.email ?? '';

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: callerProfile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', callerId)
      .maybeSingle();

    if (!callerProfile || !STAFF_ROLES.includes(callerProfile.role)) {
      return json({ error: 'Insufficient permissions' }, 403);
    }
    const callerRole = callerProfile.role;

    const body = await req.json().catch(() => ({}));
    const action = body?.action as string;

    const writeAudit = async (logAction: string, targetUserId: string | null, metadata: Record<string, unknown> = {}) => {
      await admin.from('audit_logs').insert({
        actor_id: callerId,
        actor_email: callerEmail,
        action: logAction,
        resource_type: 'user',
        resource_id: targetUserId ?? '',
        target_user_id: targetUserId,
        metadata,
      });
    };

    if (action === 'create_user') {
      const {
        email,
        first_name = '',
        last_name = '',
        role = 'subscriber',
      } = body;
      if (!email || typeof email !== 'string') return json({ error: 'Email required' }, 400);
      if (!ASSIGNABLE_ROLES.includes(role)) return json({ error: 'Invalid role' }, 400);
      if (role === 'executive' && callerRole !== 'executive') {
        return json({ error: 'Only executives can create executive users' }, 403);
      }

      const redirectTo = `${req.headers.get('origin') ?? ''}/create-password`;
      let newId: string | undefined;
      let inviteSent = false;
      let tempPassword: string | undefined;

      const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo,
        data: { first_name, last_name },
      });

      if (inviteErr) {
        tempPassword = crypto.randomUUID().replace(/-/g, '') + 'Aa1!';
        const { data: createdDirect, error: createErr } = await admin.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: { first_name, last_name },
        });
        if (createErr) {
          return json({ error: createErr.message }, 400);
        }
        newId = createdDirect.user?.id;
      } else {
        newId = invited.user?.id;
        inviteSent = true;
      }

      if (newId) {
        const { error: profileErr } = await admin.from('profiles').upsert({
          id: newId,
          email,
          role,
          first_name,
          last_name,
          is_active: true,
        }, { onConflict: 'id' });

        if (profileErr) {
          return json({ error: profileErr.message }, 400);
        }
      }
      await writeAudit('user.create', newId ?? null, { email, role, inviteSent });
      return json({
        ok: true,
        user_id: newId,
        invite_sent: inviteSent,
        message: inviteSent ? 'Invite email sent.' : 'User created. The user can set a password through the password setup flow.',
      });
    }

    if (action === 'reset_password') {
      const { user_id } = body;
      if (!user_id) return json({ error: 'user_id required' }, 400);
      const { data: target, error: getErr } = await admin.auth.admin.getUserById(user_id);
      if (getErr || !target?.user?.email) return json({ error: 'User not found' }, 404);

      const redirectTo = `${req.headers.get('origin') ?? ''}/create-password`;
      const { error: linkErr } = await admin.auth.resetPasswordForEmail(target.user.email, { redirectTo });
      if (linkErr) return json({ error: linkErr.message }, 400);
      await writeAudit('user.password_reset_sent', user_id, { email: target.user.email });
      return json({ ok: true });
    }

    if (action === 'update_role') {
      const { user_id, role } = body;
      if (!user_id || !role) return json({ error: 'user_id and role required' }, 400);
      if (!ASSIGNABLE_ROLES.includes(role)) return json({ error: 'Invalid role' }, 400);
      if (role === 'executive' && callerRole !== 'executive') {
        return json({ error: 'Only executives can grant executive role' }, 403);
      }
      if (user_id === callerId && role !== callerRole) {
        return json({ error: 'You cannot change your own role' }, 403);
      }
      const { error: upErr } = await admin.from('profiles').update({ role }).eq('id', user_id);
      if (upErr) return json({ error: upErr.message }, 400);
      await writeAudit('user.role_change', user_id, { role });
      return json({ ok: true });
    }

    if (action === 'toggle_active') {
      const { user_id, is_active } = body;
      if (!user_id || typeof is_active !== 'boolean') return json({ error: 'user_id and is_active required' }, 400);
      if (user_id === callerId) return json({ error: 'You cannot deactivate your own account' }, 403);
      const { error: upErr } = await admin.from('profiles').update({ is_active }).eq('id', user_id);
      if (upErr) return json({ error: upErr.message }, 400);
      await admin.auth.admin.updateUserById(user_id, { ban_duration: is_active ? 'none' : '876000h' });
      await writeAudit(is_active ? 'user.activate' : 'user.deactivate', user_id, {});
      return json({ ok: true });
    }

    if (action === 'delete_user') {
      if (callerRole !== 'executive') return json({ error: 'Only executives can delete users' }, 403);
      const { user_id } = body;
      if (!user_id) return json({ error: 'user_id required' }, 400);
      if (user_id === callerId) return json({ error: 'Cannot delete your own account' }, 403);
      const { error: delErr } = await admin.auth.admin.deleteUser(user_id);
      if (delErr) return json({ error: delErr.message }, 400);
      await writeAudit('user.delete', user_id, {});
      return json({ ok: true });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (e) {
    console.error('admin-users error:', e);
    return json({ error: (e as Error).message ?? 'Internal error' }, 500);
  }
});
