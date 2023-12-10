import { test, expect } from 'vitest'

test('Seeding sort is correct', () => {
  const sampleMatchups = [
    1, 16,
    8, 9,
    4, 13,
    5, 12,
    2, 15,
    7, 10,
    3, 14,
    6, 11,
  ];

  let expected = []
  for(let i = 1; i <= 16; i++)
  {
    expected.push(i);
  }
});