import dompurify from 'dompurify';
import { JSDOM } from 'jsdom';

import { HTML_ENTITIES } from '../constants';
import { removeExtraLines, removeExtraSpaces } from './words';

export const escapeHtml = (html: string): string => {
  HTML_ENTITIES.forEach(([entity, encoding]) => {
    html = html.replace(new RegExp(entity, 'g'), encoding);
  });

  return html;
};

export const unescapeHtml = (html: string): string => {
  HTML_ENTITIES.forEach(([entity, encoding]) => {
    html = html.replace(new RegExp(encoding, 'g'), entity);
  });

  return html;
};

const sanitizerOptions: dompurify.Config & {
  RETURN_DOM_FRAGMENT: false;
  RETURN_DOM: false;
} = {
  WHOLE_DOCUMENT: true,
  RETURN_DOM_FRAGMENT: false, // don't return a DOM DocumentFragment instead of an HTML string
  RETURN_DOM: false, // don't return a DOM HTMLBodyElement instead of an HTML string
  FORBID_TAGS: ['style', 'script'],
  FORBID_ATTR: ['style', 'id', 'class', 'data'],
  ADD_ATTR: ['property', 'content'],
  ADD_TAGS: ['link', 'title', 'meta'],
};

const sanitizer = dompurify(<any>new JSDOM('').window);

export const sanitizeHtml = (html: string): string => {
  const sanitized = sanitizer.sanitize(html, sanitizerOptions);

  return removeExtraSpaces(removeExtraLines(sanitized));
};
