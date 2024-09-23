function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function convertToSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => convertToSnakeCase(item));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeCaseKey = toSnakeCase(key);
      acc[snakeCaseKey] = convertToSnakeCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}
