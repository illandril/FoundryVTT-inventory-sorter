import sortItems from './sortItems';

it('should return a sorted copy without modifying the input', () => {
  const input = [
    { id: '1', name: 'Charlie', group: 'Group', alternateSort: '' },
    { id: '2', name: 'Alpha', group: 'Group', alternateSort: '' },
    { id: '3', name: 'Bravo', group: 'Group', alternateSort: '' },
  ];
  const expected = [
    { id: '2', group: 'Group' },
    { id: '3', group: 'Group' },
    { id: '1', group: 'Group' },
  ];

  const actual = sortItems(input);

  expect(input).toEqual([
    { id: '1', name: 'Charlie', group: 'Group', alternateSort: '' },
    { id: '2', name: 'Alpha', group: 'Group', alternateSort: '' },
    { id: '3', name: 'Bravo', group: 'Group', alternateSort: '' },
  ]);
  expect(actual).toEqual(expected);
});

it.each(['name', 'group', 'alternateSort', 'id'])('sorts by %s when all other values are the same', (key) => {
  const uniqueValues = ['Bravo', 'Charlie', 'Alpha'];
  const input = [
    {
      id: '1',
      name: 'Name',
      group: 'Group',
      alternateSort: 'Alternate',
    },
    {
      id: '2',
      name: 'Name',
      group: 'Group',
      alternateSort: 'Alternate',
    },
    {
      id: '3',
      name: 'Name',
      group: 'Group',
      alternateSort: 'Alternate',
    },
  ].map((value, i) => ({
    ...value,
    [key]: uniqueValues[i],
  }));
  const expected = [
    { id: input[2].id, group: input[2].group },
    { id: input[0].id, group: input[0].group },
    { id: input[1].id, group: input[1].group },
  ];

  const actual = sortItems(input);
  expect(actual).toEqual(expected);
});

it('should sort by group before alternateSort', () => {
  const input = [
    { id: '1', name: 'Name', group: 'B', alternateSort: 'C' },
    { id: '2', name: 'Name', group: 'A', alternateSort: 'E' },
    { id: '3', name: 'Name', group: 'C', alternateSort: 'F' },
    { id: '4', name: 'Name', group: 'C', alternateSort: 'B' },
    { id: '5', name: 'Name', group: 'B', alternateSort: 'A' },
    { id: '6', name: 'Name', group: 'A', alternateSort: 'D' },
    { id: '7', name: 'Name', group: 'A', alternateSort: 'E0' },
    { id: '8', name: 'Name', group: 'AE', alternateSort: '2' },
    { id: '9', name: 'Name', group: 'A', alternateSort: 'E2' },
    { id: '10', name: 'Name', group: 'AE', alternateSort: '0' },
    { id: '11', name: 'Name', group: 'AE', alternateSort: '1' },
    { id: '12', name: 'Name', group: 'A', alternateSort: 'E1' },
  ];
  const expected = [
    { id: '6', group: 'A' },
    { id: '2', group: 'A' },
    { id: '7', group: 'A' },
    { id: '12', group: 'A' },
    { id: '9', group: 'A' },
    { id: '10', group: 'AE' },
    { id: '11', group: 'AE' },
    { id: '8', group: 'AE' },
    { id: '5', group: 'B' },
    { id: '1', group: 'B' },
    { id: '4', group: 'C' },
    { id: '3', group: 'C' },
  ];

  const actual = sortItems(input);
  expect(actual).toEqual(expected);
});

it('should sort by group before name', () => {
  const input = [
    { id: '1', name: 'C', group: 'B', alternateSort: '' },
    { id: '2', name: 'E', group: 'A', alternateSort: '' },
    { id: '3', name: 'F', group: 'C', alternateSort: '' },
    { id: '4', name: 'B', group: 'C', alternateSort: '' },
    { id: '5', name: 'A', group: 'B', alternateSort: '' },
    { id: '6', name: 'D', group: 'A', alternateSort: '' },
    { id: '7', name: 'E0', group: 'A', alternateSort: '' },
    { id: '8', name: '2', group: 'AE', alternateSort: '' },
    { id: '9', name: 'E2', group: 'A', alternateSort: '' },
    { id: '10', name: '0', group: 'AE', alternateSort: '' },
    { id: '11', name: '1', group: 'AE', alternateSort: '' },
    { id: '12', name: 'E1', group: 'A', alternateSort: '' },
  ];
  const expected = [
    { id: '6', group: 'A' },
    { id: '2', group: 'A' },
    { id: '7', group: 'A' },
    { id: '12', group: 'A' },
    { id: '9', group: 'A' },
    { id: '10', group: 'AE' },
    { id: '11', group: 'AE' },
    { id: '8', group: 'AE' },
    { id: '5', group: 'B' },
    { id: '1', group: 'B' },
    { id: '4', group: 'C' },
    { id: '3', group: 'C' },
  ];

  const actual = sortItems(input);
  expect(actual).toEqual(expected);
});

it('should sort by alternateSort before name', () => {
  const input = [
    { id: '1', name: 'C', group: 'Group', alternateSort: 'B' },
    { id: '2', name: 'E', group: 'Group', alternateSort: 'A' },
    { id: '3', name: 'F', group: 'Group', alternateSort: 'C' },
    { id: '4', name: 'B', group: 'Group', alternateSort: 'C' },
    { id: '5', name: 'A', group: 'Group', alternateSort: 'B' },
    { id: '6', name: 'D', group: 'Group', alternateSort: 'A' },
    { id: '7', name: 'E0', group: 'Group', alternateSort: 'A' },
    { id: '8', name: '2', group: 'Group', alternateSort: 'AE' },
    { id: '9', name: 'E2', group: 'Group', alternateSort: 'A' },
    { id: '10', name: '0', group: 'Group', alternateSort: 'AE' },
    { id: '11', name: '1', group: 'Group', alternateSort: 'AE' },
    { id: '12', name: 'E1', group: 'Group', alternateSort: 'A' },
  ];
  const expected = [
    { id: '6', group: 'Group' },
    { id: '2', group: 'Group' },
    { id: '7', group: 'Group' },
    { id: '12', group: 'Group' },
    { id: '9', group: 'Group' },
    { id: '10', group: 'Group' },
    { id: '11', group: 'Group' },
    { id: '8', group: 'Group' },
    { id: '5', group: 'Group' },
    { id: '1', group: 'Group' },
    { id: '4', group: 'Group' },
    { id: '3', group: 'Group' },
  ];

  const actual = sortItems(input);
  expect(actual).toEqual(expected);
});

it('should sort case insensitive', () => {
  const input = [
    { id: '1', name: 'AAE', group: 'Group', alternateSort: '' },
    { id: '2', name: 'aab', group: 'Group', alternateSort: '' },
    { id: '3', name: 'aaD', group: 'Group', alternateSort: '' },
    { id: '4', name: 'Aac', group: 'Group', alternateSort: '' },
    { id: '5', name: 'AAA', group: 'Group', alternateSort: '' },
  ];
  const expected = [
    { id: '5', group: 'Group' },
    { id: '2', group: 'Group' },
    { id: '4', group: 'Group' },
    { id: '3', group: 'Group' },
    { id: '1', group: 'Group' },
  ];

  const actual = sortItems(input);
  expect(actual).toEqual(expected);
});

it('should sort without regard to accents', () => {
  const input = [
    { id: '1', name: 'ááe', group: 'Group', alternateSort: '' },
    { id: '2', name: 'aác', group: 'Group', alternateSort: '' },
    { id: '3', name: 'áab', group: 'Group', alternateSort: '' },
    { id: '4', name: 'aaa', group: 'Group', alternateSort: '' },
    { id: '5', name: 'aad', group: 'Group', alternateSort: '' },
  ];
  const expected = [
    { id: '4', group: 'Group' },
    { id: '3', group: 'Group' },
    { id: '2', group: 'Group' },
    { id: '5', group: 'Group' },
    { id: '1', group: 'Group' },
  ];

  const actual = sortItems(input);
  expect(actual).toEqual(expected);
});

it('should sort without regard to punctuation', () => {
  const input = [
    { id: '1', name: 'a - ae', group: 'Group', alternateSort: '' },
    { id: '2', name: 'aa.c', group: 'Group', alternateSort: '' },
    { id: '3', name: 'aa_b', group: 'Group', alternateSort: '' },
    { id: '4', name: 'a - aa', group: 'Group', alternateSort: '' },
    { id: '5', name: 'aa\td', group: 'Group', alternateSort: '' },
  ];
  const expected = [
    { id: '4', group: 'Group' },
    { id: '3', group: 'Group' },
    { id: '2', group: 'Group' },
    { id: '5', group: 'Group' },
    { id: '1', group: 'Group' },
  ];

  const actual = sortItems(input);
  expect(actual).toEqual(expected);
});
