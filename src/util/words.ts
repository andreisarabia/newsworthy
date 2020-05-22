const isAllCaps = (str: string) => /^[A-Z]+$/.test(str);

export const removeExtraLines = (str: string) =>
  str.replace(/\n/g, '').replace(/\r/g, '');

export const removeExtraSpaces = (str: string) =>
  str.replace(/\s\s+/g, ' ').trim();

export const properCase = (name: string): string => {
  if (name.trim() === '') return '';

  const nameParts = name.split(' ');

  if (nameParts.every(isAllCaps)) return removeExtraSpaces(name);

  return nameParts
    .map(
      name => `${name.slice(0, 1).toUpperCase()}${name.slice(1).toLowerCase()}`
    )
    .join(' ');
};

export const countWords = (str: string) =>
  removeExtraSpaces(str).replace(/\n /, '\n').split(' ').length;
