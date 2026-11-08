import { AS_OF } from '../data/tenants';

export const NA = 'Not available';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const fmtInt = (v: number | null | undefined) => (v == null ? NA : Math.round(v).toLocaleString('en-US'));
export const fmtPct = (v: number | null | undefined) => (v == null ? NA : `${Math.round(v * 100)}%`);
export const fmtUsd = (v: number | null | undefined) => (v == null ? NA : `$${Math.round(v).toLocaleString('en-US')}`);
export const fmtBool = (v: boolean | null | undefined) => (v == null ? NA : v ? 'Yes' : 'No');
export const fmtText = (v: string | null | undefined) => (v == null || v === '' ? NA : v);

/** "2027-04" → "April 2027" */
export function fmtMonth(v: string | null | undefined): string {
  if (!v) return NA;
  const [y, m] = v.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}
/** "2027-04" → "Apr 2027" (chart axes) */
export function fmtMonthShort(v: string): string {
  const [y, m] = v.split('-').map(Number);
  return `${SHORT[m - 1]} ${y}`;
}

/** "As of 11/06/2026, 05:06 p.m." */
export function asOfLabel(d: Date = AS_OF): string {
  const p = (n: number) => String(n).padStart(2, '0');
  const h = d.getHours();
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `As of ${p(d.getMonth() + 1)}/${p(d.getDate())}/${d.getFullYear()}, ${p(h12)}:${p(d.getMinutes())} ${h < 12 ? 'a.m.' : 'p.m.'}`;
}
