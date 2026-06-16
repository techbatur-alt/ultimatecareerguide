import { useEffect, useRef, useState } from "react";
import { Loader2, Save, StickyNote } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AgentNotesBoxProps {
  /** Table to update — e.g. "orders" or "support_tickets" */
  table: "orders" | "support_tickets";
  /** Row id to update */
  rowId: string;
  /** Initial value loaded from the row */
  initialValue: string;
  /** Optional label override */
  label?: string;
  /** Auto-save delay in ms (default 1500) */
  debounceMs?: number;
  /** If true, hide the manual save button (auto-save only) */
  hideSaveButton?: boolean;
}

/**
 * Inline agent notes box with auto-save (debounced) plus an explicit Save button.
 * Saves to a `agent_notes` column on the target table.
 */
const AgentNotesBox = ({
  table,
  rowId,
  initialValue,
  label = "Agent notes",
  debounceMs = 1500,
  hideSaveButton = false,
}: AgentNotesBoxProps) => {
  const [value, setValue] = useState(initialValue ?? "");
  const [savedValue, setSavedValue] = useState(initialValue ?? "");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dirty = value !== savedValue;

  const persist = async (next: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from(table)
        .update({ agent_notes: next, updated_at: new Date().toISOString() })
        .eq("id", rowId);
      if (error) throw error;
      setSavedValue(next);
      setSavedAt(new Date());
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save note";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // Debounced auto-save
  useEffect(() => {
    if (value === savedValue) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => persist(value), debounceMs);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground inline-flex items-center gap-1">
          <StickyNote className="h-3.5 w-3.5" /> {label}
        </span>
        <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
          {saving ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" /> Saving…
            </>
          ) : dirty ? (
            "Unsaved changes"
          ) : savedAt ? (
            `Saved ${savedAt.toLocaleTimeString()}`
          ) : null}
        </span>
      </div>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add internal notes here — auto-saves while you type."
        rows={2}
        className="text-xs resize-y min-h-[60px]"
      />
      {!hideSaveButton && (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="ghost"
            disabled={!dirty || saving}
            onClick={() => persist(value)}
            className="h-7 px-2 text-xs"
          >
            <Save className="h-3 w-3 mr-1" /> Save now
          </Button>
        </div>
      )}
    </div>
  );
};

export default AgentNotesBox;
