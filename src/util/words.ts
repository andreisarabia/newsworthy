const isAllCaps = (str: string) => /^[A-Z]+$/.test(str);

export const properCase = (name: string): string => {
  if (name.trim() === '') return '';
  else if (!isAllCaps(name)) return name;

  let normalized = '';

  name
    .replace(/\s\s+/g, '')
    .split(' ')
    .forEach(word => {
      normalized += word.slice(0, 1).toUpperCase();
      normalized += word.slice(1).toLowerCase();
      normalized += ' ';
    });

  return normalized.trim();
};

export const countWords = (str: string) => str.trim().split(/\s\s+/).length;
