export function appendMessageToError(e: Error, message: string) {
  e.message = [ e.message, message ].join(' ');
  e.stack = `${e.name}: ${e.message}\n${(e.stack || '').split('\n').slice(1).join('\n')}`;
  return e;
}

/**
 * Get common and unique elements of two arrays.
 */
export function compareArrays<T>(arr1: T[], arr2: T[]) {
  const uniqueInArr1: T[] = [];
  const common: T[] = [];
  const uniqueInArr2: T[] = [];
  arr1.forEach(item => arr2.includes(item) ? common.push(item) : uniqueInArr1.push(item));
  arr2.forEach(item => common.includes(item) ? null : uniqueInArr2.push(item));
  return [ uniqueInArr1, common, uniqueInArr2 ];
}
