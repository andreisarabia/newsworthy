import { JSDOM } from 'jsdom';

export const cleanUrl = (url: string): string => {
  if (!isUrl(url))
    throw new Error(`Provided parameter ${url} is not a valid URL`);

  const { origin, pathname } = new URL(url);

  return `${origin}${pathname}`;
};

export const extractCanonicalUrl = (html: string): string | null => {
  const linkTags = new JSDOM(html).window.document.querySelectorAll('link');

  for (const { rel, href } of linkTags) if (rel === 'canonical') return href;

  return null;
};

export const extractDomain = (url: string): string => new URL(url).hostname;

export const extractTitle = (html: string): string | null => {
  const titleEl = new JSDOM(html).window.document.querySelector('title');

  return titleEl ? titleEl.innerText : null;
};

export const extractSlug = (url: string): string => {
  const { pathname } = new URL(url); // easier to parse URLs with queries

  return pathname.substring(pathname.lastIndexOf('/'));
};

export const isUrl = (url: string): boolean => {
  try {
    return Boolean(new URL(url));
  } catch {
    return false;
  }
};
