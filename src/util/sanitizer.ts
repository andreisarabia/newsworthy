import dompurify from 'dompurify';
import { JSDOM } from 'jsdom';

const htmlEntities = new Map([
  ['&', '&amp;'],
  ['<', '&lt;'],
  ['>', '&gt;'],
  ['"', '&quot;'],
  ["'", '&#x27;'],
  ['/', '&#x2F;'],
]);
const defaultPurifyConfig: dompurify.Config = {
  WHOLE_DOCUMENT: true,
  FORBID_TAGS: ['style', 'script'],
  FORBID_ATTR: ['style'],
};

const localSanitizer = dompurify(<any>new JSDOM('').window);

const removeExtraWhitespace = (str: string) => str.replace(/\s\s+/, '');

const escapeHtml = (html: string): string => {
  let escaped = '';

  htmlEntities.forEach((entity, encoding) => {
    escaped = html.replace(entity, encoding);
  });

  return escaped;
};

export const sanitizeHtml = (
  html: string,
  options: dompurify.Config = {}
): string => {
  html = escapeHtml(removeExtraWhitespace(html));
  options = { ...defaultPurifyConfig, ...options };

  return localSanitizer.sanitize(html, options) as string;
};
