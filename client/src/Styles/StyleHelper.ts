
export function classes(...args: string[] | string[][]) {
  return args.flat().join(' ');
}