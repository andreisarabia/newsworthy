export const properCase = (name: string): string => {
  let normalized = '';

  name.split(' ').forEach(word => {
    const [firstLetter, ...restOfWord] = word;

    normalized += firstLetter.toUpperCase();
    normalized += restOfWord.join().toLowerCase();
    normalized += ' ';
  });

  return normalized.trim();
};
