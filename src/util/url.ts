import { JSDOM } from 'jsdom';

export const cleanUrl = (url: string): string => {
  if (!isUrl(url))
    throw new Error(`Provided parameter ${url} is not a valid URL`);

  const { origin, pathname } = new URL(url);

  return `${origin}${pathname}`;
};

export const extractAuthor = (html: string): string | null => {
  const metaTags = new JSDOM(html).window.document.querySelectorAll('meta');

  for (const tag of metaTags)
    if (tag.getAttribute('property') === 'author') return tag.content;

  return null;
};

export const extractCanonicalUrl = (html: string): string | null => {
  const linkTags = new JSDOM(html).window.document.querySelectorAll('link');

  for (const tag of linkTags) if (tag.rel === 'canonical') return tag.href;

  return null;
};

export const extractDomain = (url: string): string => new URL(url).hostname;

export const extractTitle = (html: string): string | null => {
  const titleEl = new JSDOM(html).window.document.querySelector('title');

  return titleEl ? titleEl.innerText : null;
};

export const extractPublishedTime = (html: string): Date | null => {
  const metaTags = new JSDOM(html).window.document.querySelectorAll('meta');

  let backupPublishedTime: Date | null = null;

  for (const tag of metaTags) {
    switch (tag.getAttribute('property')) {
      case 'article:published_time':
        return new Date(tag.content);
      case 'article:modified_time':
        backupPublishedTime = new Date(tag.content);
        continue;
    }
  }

  return backupPublishedTime;
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
