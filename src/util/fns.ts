export const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj)); // extremely expensive to use; don't use casually...

export const toUniqueArray = <T>(arr: T[]): T[] => [...new Set(arr)];

export const parallelize = async <T>(
  chunks: T[],
  numChunks: number,
  fn: (chunk: T) => Promise<void>
): Promise<void> => {
  numChunks = numChunks > chunks.length ? chunks.length : numChunks;

  for (let i = 0; i < chunks.length; i += numChunks)
    await Promise.all(chunks.slice(i, i + numChunks).map(fn));
};

export const isEmptyObject = (obj: object): boolean =>
  Object.keys(obj).length === 0;
