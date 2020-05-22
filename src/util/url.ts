const urlExtensions = ['.html', '.php', '.aspx'];

export const normalizeUrl = (url: string): string => {
  if (!isUrl(url))
    throw new Error(`Provided parameter ${url} is not a valid URL`);

  const { origin, pathname } = new URL(url);

  return `${origin}${pathname}`;
};

export const isUrl = (url: string): boolean => {
  try {
    return Boolean(new URL(url));
  } catch {
    return false;
  }
};

export const extractDomain = (url: string): string => new URL(url).hostname;

export const extractSlug = (url: string): string => {
  const { pathname } = new URL(url);

  return urlExtensions.some(ext => pathname.endsWith(ext))
    ? pathname.substring(pathname.lastIndexOf('/'), pathname.lastIndexOf('.'))
    : pathname.substring(pathname.lastIndexOf('/'));
};
