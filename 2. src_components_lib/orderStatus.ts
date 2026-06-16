/**
 * Centralised colour map for order statuses so Orders, Billing (Product Sales),
 * Dashboards etc. all show the same badge for a given status.
 *
 * Each status gets a clearly distinct hue using HSL design tokens where possible,
 * with explicit Tailwind colour classes only for status hues that don't have a
 * dedicated semantic token (blue, amber, emerald, indigo, slate).
 */
export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "bg-slate-500/15 text-slate-700 border-slate-500/40 dark:text-slate-300",
  paid: "bg-emerald-500/20 text-emerald-700 border-emerald-500/50 dark:text-emerald-300",
  processing: "bg-primary/15 text-primary border-primary/40",
  dispatched: "bg-blue-500/20 text-blue-700 border-blue-500/50 dark:text-blue-300",
  in_transit: "bg-indigo-500/20 text-indigo-700 border-indigo-500/50 dark:text-indigo-300",
  delivered: "bg-emerald-600/25 text-emerald-800 border-emerald-600/60 dark:text-emerald-200 font-semibold",
  delayed: "bg-amber-500/25 text-amber-800 border-amber-500/60 dark:text-amber-200",
  cancelled: "bg-destructive/15 text-destructive border-destructive/40",
  refunded: "bg-purple-500/20 text-purple-700 border-purple-500/50 dark:text-purple-300",
};

export const orderStatusBadgeClass = (status: string) =>
  ORDER_STATUS_COLORS[status] ?? "bg-muted text-muted-foreground border-border";

export const ORDER_STATUSES = [
  "pending",
  "paid",
  "processing",
  "dispatched",
  "in_transit",
  "delivered",
  "delayed",
  "cancelled",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
