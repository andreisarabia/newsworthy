import dompurify from 'dompurify';
import { JSDOM } from 'jsdom';

import { htmlEntityMap } from '../constants';

const sanitizer = dompurify(<any>new JSDOM('').window);

sanitizer.setConfig({
  WHOLE_DOCUMENT: true,
  FORBID_TAGS: ['style', 'script', 'aside'],
  FORBID_ATTR: ['style', 'id', 'class'],
  ADD_ATTR: ['property', 'content', 'data', 'name'],
  ADD_TAGS: ['link', 'title', 'meta'],
} as dompurify.Config);

export const sanitizeHtml = (html: string): string => sanitizer.sanitize(html);

// ty, https://github.com/janl/mustache.js/blob/master/mustache.js#L67
export const escapeHtml = (html: string): string =>
  html.replace(/[&<>"'`=\/]/g, s => htmlEntityMap[s]);

export const unescapeHtml = (html: string): string => {
  let unescaped = '';

  Object.entries(htmlEntityMap).forEach(([entity, encoding]) => {
    unescaped = html.replace(new RegExp(encoding, 'g'), entity);
  });

  return unescaped;
};
