import dompurify from 'dompurify';
import { JSDOM } from 'jsdom';

import { HTML_ENTITIES } from '../lib/constants';

const escapeHtml = (html: string): string => {
  HTML_ENTITIES.forEach((entity, encoding) => {
    html = html.replace(entity, encoding);
  });

  return html;
};

const defaultPurifyConfig: dompurify.Config = {
  WHOLE_DOCUMENT: true,
  FORBID_TAGS: ['style', 'script'],
  FORBID_ATTR: ['style', 'id', 'class', 'data'],
  ADD_ATTR: ['property', 'content'],
};

const localSanitizer = dompurify(<any>new JSDOM('').window);

export const sanitizeHtml = (
  html: string,
  options: dompurify.Config = {}
): string => {
  html = localSanitizer.sanitize(html, {
    ...defaultPurifyConfig,
    ...options,
  }) as string;

  return escapeHtml(
    html.replace(/\s\s+/g, '').replace(/\n/g, '').replace(/\r/g, '')
  );
};
