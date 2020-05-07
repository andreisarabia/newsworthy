export const timestamp = () =>
  new Date().toString().replace('Pacific Daylight Time', 'PDT');

export const isoTimestamp = () => new Date().toISOString();
