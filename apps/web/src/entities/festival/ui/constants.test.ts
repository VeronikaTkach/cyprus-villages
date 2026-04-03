import { describe, it, expect } from 'vitest';
import { formatDate, formatDateRange } from './constants';

// ── formatDate ────────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('returns a non-empty string for a valid ISO date', () => {
    expect(formatDate('2025-07-15')).toBeTruthy();
  });

  it('includes the 4-digit year in the output', () => {
    expect(formatDate('2025-07-15')).toContain('2025');
  });
});

// ── formatDateRange ───────────────────────────────────────────────────────────

describe('formatDateRange', () => {
  it('returns an empty string when both dates are null', () => {
    expect(formatDateRange(null, null)).toBe('');
  });

  it('returns a single formatted date when end is null', () => {
    const result = formatDateRange('2025-07-15', null);
    expect(result).toContain('2025');
    expect(result).not.toContain('–');
  });

  it('returns a single formatted date when start equals end', () => {
    // same date on both sides → not a range
    const result = formatDateRange('2025-07-15', '2025-07-15');
    expect(result).not.toContain('–');
  });

  it('returns a range string with an em-dash when start and end differ', () => {
    const result = formatDateRange('2025-07-15', '2025-07-20');
    expect(result).toContain('–');
    expect(result).toContain('2025');
  });
});
