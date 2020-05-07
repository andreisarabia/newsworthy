export const objSize = <T>(obj: T): number => Object.keys(obj).length;

export const toUniqueArray = <T>(arr: T[]): T[] => [...new Set(arr)];

export const isNullish = (obj: unknown) => obj === undefined || obj === null;
