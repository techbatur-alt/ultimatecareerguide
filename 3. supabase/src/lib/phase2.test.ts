import { describe, expect, it } from 'vitest';
import { calculateProgress, formatCurrency, getProgressLabel, getDeliveryStatusTone, safeCount } from './phase2';

describe('phase2 helpers', () => {
  it('returns zero when a count is unavailable', () => {
    expect(safeCount(undefined)).toBe(0);
    expect(safeCount({ count: null })).toBe(0);
  });

  it('returns the count when present', () => {
    expect(safeCount({ count: 5 })).toBe(5);
  });

  it('formats progress and currency values', () => {
    expect(calculateProgress(12, 24)).toBe(50);
    expect(formatCurrency(1250)).toContain('R');
  });

  it('labels statuses for milestone visibility', () => {
    expect(getProgressLabel('completed')).toBe('Completed');
    expect(getProgressLabel('in_progress')).toBe('On track');
    expect(getProgressLabel('delayed')).toBe('At risk');
  });

  it('maps delivery states to badge tones', () => {
    expect(getDeliveryStatusTone('delivered')).toContain('emerald');
    expect(getDeliveryStatusTone('pending')).toContain('amber');
    expect(getDeliveryStatusTone('planned')).toContain('muted');
  });
});
