import { JSDOM } from 'jsdom';

type MetaTagProperties =
  | 'author'
  | 'description'
  | 'og:title'
  | 'og:description'
  | 'twitter:title'
  | 'twitter:description'
  | 'og:image'
  | 'twitter:image'
  | 'article:published_time'
  | 'article:modified_time';

export const extractMetaPropertyContent = <K extends MetaTagProperties>(
  html: string,
  ...properties: K[]
): Partial<{ [key in K]: string | null }> => {
  const extractedContent: Partial<{ [key in K]: string | undefined }> = {};
  const metaTags = new JSDOM(html).window.document.head.querySelectorAll(
    'meta'
  );

  for (const tag of metaTags) {
    const tagProp = tag.getAttribute('property');

    if (!tagProp) continue;
    else if (!(properties as string[]).includes(tagProp)) continue;

    const content = tag.content.trim();

    if (content !== '') extractedContent[tagProp as K] = content;
  }

  return extractedContent;
};

export const extractCanonicalUrl = (html: string): string | null => {
  const linkTags = new JSDOM(html).window.document.querySelectorAll('link');

  for (const tag of linkTags) if (tag.rel === 'canonical') return tag.href;

  return null;
};
