import compareStringCaseInsensitive from './compareStringCaseInsensitive';

it.each([
  ['test', 'test', 0],
  ['TEST', 'test', 0],
  ['a', 'a', 0],
  ['a', 'A', 0],
  ['a', 'B', -1],
  ['b', 'A', 1],
  ['abc', 'ab', 1],

  ['1', '2', -1],
  ['0', '1', -1],
  ['10', '2', -1],

  ['a', '0', 1],
  ['z', '9', 1],

  ['', '', 0],
  ['', '0', -1],
  ['', 'A', -1],
  ['', 'Z', -1],
])('compareStringCaseInsensitive(%j, %j) returns %j', (a, b, expected) => {
  const actual = compareStringCaseInsensitive(a, b);
  const reverse = compareStringCaseInsensitive(b, a);

  expect(actual).toBe(expected);
  expect(reverse).toBe(expected === 0 ? 0 : -1 * expected);
});

it('sorts as expected', () => {
  const input = [
    'abc',
    'Cleric',
    'mnop',
    'a',
    '11',
    'uvwxyz',
    'jkl',
    'f',
    '1',
    'D',
    '10',
    '9',
    'qrst',
    '7',
    'c',
    'a',
    'aeiou',
    'a',
    'GHI',
    'zebra',
    '8',
    '',
    '4',
    '5',
    'AAA',
    '0',
    '',
    'E',
    '6',
    '3',
    '2',
    'b',
    '',
  ];

  expect(input.sort(compareStringCaseInsensitive)).toEqual([
    '',
    '',
    '',
    '0',
    '1',
    '10',
    '11',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'a',
    'a',
    'a',
    'AAA',
    'abc',
    'aeiou',
    'b',
    'c',
    'Cleric',
    'D',
    'E',
    'f',
    'GHI',
    'jkl',
    'mnop',
    'qrst',
    'uvwxyz',
    'zebra',
  ]);
});
