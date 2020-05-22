import dompurify from 'dompurify';
import { JSDOM } from 'jsdom';

const sanitizer = dompurify(<any>new JSDOM('').window);

sanitizer.setConfig({
  WHOLE_DOCUMENT: true,
  FORBID_TAGS: ['style', 'script', 'aside'],
  FORBID_ATTR: ['style', 'id', 'class'],
  ADD_ATTR: ['property', 'content', 'data', 'name'],
  ADD_TAGS: ['link', 'title', 'meta'],
} as dompurify.Config);

export const sanitizeHtml = (html: string): string => sanitizer.sanitize(html);
