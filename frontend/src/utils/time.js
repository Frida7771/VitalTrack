export const timeAgo = dateString => {
  if (!dateString) return '';
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffSeconds = Math.floor((now - date) / 1000);
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  const days = Math.floor(diffSeconds / 86400);
  return days === 1 ? '1 day ago' : `${days} days ago`;
};

export const formatDateTime = value => {
  if (!value) return '';
  return new Date(value).toLocaleString();
};

export const buildDateRangePayload = range => {
  if (!range || range.length !== 2) return { startTime: null, endTime: null };
  const [start, end] = range;
  const startStr = `${start.format('YYYY-MM-DD')}T00:00:00`;
  const endStr = `${end.format('YYYY-MM-DD')}T23:59:59`;
  return { startTime: startStr, endTime: endStr };
};
