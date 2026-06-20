import { describe, expect, it } from 'vitest';
import { isRoleAtLeast, resolveEffectiveRole } from './roleUtils';

describe('role access helpers', () => {
  it('treats legacy admin role as executive access', () => {
    expect(isRoleAtLeast('admin', 'service')).toBe(true);
    expect(isRoleAtLeast('admin', 'executive')).toBe(true);
  });

  it('treats legacy account holder role as subscriber access', () => {
    expect(isRoleAtLeast('account_holder', 'subscriber')).toBe(true);
    expect(isRoleAtLeast('account_holder', 'stakeholder')).toBe(false);
  });

  it('uses user metadata role when profile role is missing', () => {
    expect(resolveEffectiveRole('', 'executive')).toBe('executive');
    expect(resolveEffectiveRole(undefined, 'support')).toBe('support');
  });
});
