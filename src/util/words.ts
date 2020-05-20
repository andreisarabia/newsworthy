const isAllCaps = (str: string) => /^[A-Z]+$/.test(str);

export const removeExtraLines = (str: string) =>
  str.replace(/\n/g, '').replace(/\r/g, '');

export const removeExtraSpaces = (str: string) =>
  str.replace(/\s\s+/g, ' ').trim();

export const properCase = (name: string): string => {
  if (name.trim() === '') return '';
  else if (!isAllCaps(name)) return removeExtraSpaces(name);

  return removeExtraSpaces(name)
    .split(' ')
    .map(
      word => `${word.slice(0, 1).toUpperCase()} ${word.slice(1).toLowerCase()}`
    )
    .join(' ');
};

export const countWords = (str: string) =>
  removeExtraSpaces(str).replace(/\n /, '\n').split(' ').length;
