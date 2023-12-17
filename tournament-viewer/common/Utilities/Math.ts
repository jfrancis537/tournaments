export function nextPowerOf2(num: number) {
  let result = 1;
  while(result < num) {
    result *= 2;
  }
  return result;
}