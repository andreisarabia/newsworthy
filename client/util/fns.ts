export const toUniqueArray = <T>(arr: T[]): T[] => [...new Set(arr)];
