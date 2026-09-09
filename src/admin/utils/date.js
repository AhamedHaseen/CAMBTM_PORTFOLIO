/**
 * Format UTC timestamp strings from PostgreSQL / SQLite into User's Local Timezone
 */
export function formatLocalDateTime(dateStr) {
  if (!dateStr) return '—';
  let str = String(dateStr).trim();

  // If ISO string lacks timezone offset (e.g. "2026-09-07 07:15:09"), ensure it is parsed as UTC
  if (!str.includes('Z') && !/[+-]\d{2}(:\d{2})?$/.test(str)) {
    str = str.replace(' ', 'T') + 'Z';
  }

  const date = new Date(str);
  if (isNaN(date.getTime())) return '—';

  return (
    date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) +
    ' ' +
    date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  );
}

export function formatLocalDateOnly(dateStr) {
  if (!dateStr) return '—';
  let str = String(dateStr).trim();
  if (!str.includes('Z') && !/[+-]\d{2}(:\d{2})?$/.test(str)) {
    str = str.replace(' ', 'T') + 'Z';
  }
  const date = new Date(str);
  if (isNaN(date.getTime())) return '—';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatLocalTimeOnly(dateStr) {
  if (!dateStr) return '—';
  let str = String(dateStr).trim();
  if (!str.includes('Z') && !/[+-]\d{2}(:\d{2})?$/.test(str)) {
    str = str.replace(' ', 'T') + 'Z';
  }
  const date = new Date(str);
  if (isNaN(date.getTime())) return '—';

  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}
