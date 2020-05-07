import createPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const DEFAULT_PURIFY_CONFIG = { WHOLE_DOCUMENT: true };
const EXTRA_WHITESPACE_REGEX = /\s\s+/g;
const localPurifier = createPurify(<any>new JSDOM('').window);
const htmlEntities = new Map([
  ['&', '&amp;'],
  ['<', '&lt;'],
  ['>', '&gt;'],
  ['"', '&quot;'],
  ["'", '&#x27;'],
  ['/', '&#x2F;'],
]);

const removeExtraWhitespace = (str: string) =>
  str.replace(EXTRA_WHITESPACE_REGEX, '');

const escapeHtml = (html: string): string => {
  let escaped = '';

  htmlEntities.forEach((entity, encoding) => {
    escaped = html.replace(entity, encoding);
  });

  return escaped;
};

export const sanitizeHtml = (
  html: string,
  options: createPurify.Config = {}
): string => {
  html = escapeHtml(removeExtraWhitespace(html));
  options = { ...DEFAULT_PURIFY_CONFIG, ...options };

  return localPurifier.sanitize(html, options) as string;
};
