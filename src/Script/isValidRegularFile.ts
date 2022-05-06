export const validFileExtensions: Array<string> = [`.txt`, `.json`, `.rb`];

export function isValidRegularFile(f: string): boolean {
  return validFileExtensions.some((ext) => f.endsWith(ext));
}
