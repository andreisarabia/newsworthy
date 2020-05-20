import dompurify from 'dompurify';
import { JSDOM } from 'jsdom';

import { HTML_ENTITIES } from '../constants';
import { removeExtraLines, removeExtraSpaces } from './words';

export const escapeHtml = (html: string): string => {
  const encoded = HTML_ENTITIES.reduce(
    (acc, [entity, encoding]) => acc.replace(entity, encoding),
    html
  );

  return encoded;
};

export const unescapeHtml = (html: string): string =>
  HTML_ENTITIES.reduce(
    (acc, [entity, encoding]) => acc.replace(encoding, entity),
    html
  );

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

export const sanitizeHtml = (html: string): string =>
  removeExtraLines(
    removeExtraSpaces(sanitizer.sanitize(html, sanitizerOptions))
  );
