import collator from './collator';

it.each([
  // Alphabetic
  [-1, 'a', 'b'],
  [-1, 'A', 'b'],
  [-1, 'a', 'B'],
  [-1, 'A', 'B'],
  [0, 'a', 'a'],
  [0, 'A', 'A'],
  [0, 'a', 'A'],

  // Accents
  [0, 'a', 'á'],
  [0, 'ábc', 'abc'],
  [0, 'bác', 'bac'],
  [-1, 'ábc', 'bac'],
  [1, 'bác', 'abc'],

  // Numeric sorts
  [0, '0', '0'],
  [0, '1', '1'],
  [-1, '0', '1'],
  [1, '1', '0'],
  [-1, '2', '10'],
  [1, '20', '10'],


  // Alpha + Numeric sorts
  [0, 'Bard 1', 'Bard 1'],
  [-1, 'Bard 1', 'Bard 2'],
  [1, 'Bard 2', 'Bard 1'],
  [-1, 'Bard 2', 'Bard 10'],
  [-1, 'Barbarian 2', 'Bard 1'],
])('returns %j for %j, %j', (expected, a, b) => {
  const actual = collator.compare(a, b);
  expect(actual).toBe(expected);
});
