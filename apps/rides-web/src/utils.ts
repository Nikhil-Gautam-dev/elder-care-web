export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export const formatPhone = (phone: string) => phone.replace(/^\+91(\d{5})(\d{5})$/, '+91 $1 $2');

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });

export const timeAgo = (iso: string): string => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.round(hrs / 24)} d ago`;
};

export const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

/** The last `n` days (oldest first) with a short weekday label. */
export const lastDays = (n: number) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return { date: d, label: d.toLocaleDateString('en-IN', { weekday: 'short' }) };
  });
