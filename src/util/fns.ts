export const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const toUniqueArray = <T>(arr: T[]): T[] => [...new Set(arr)];
