import collator from '../collator';
import getUsage from './getUsage';

it('sorts empty system and empty activation equally', () => {
  expect(
    collator.compare(
      getUsage({ system: {} } as dnd5e.documents.Item5e),
      getUsage({ system: { activation: {} } } as dnd5e.documents.Item5e),
    ),
  ).toBe(0);
});

it('sorts empty activation before none activation', () => {
  expect(
    collator.compare(
      getUsage({ system: { activation: {} } } as dnd5e.documents.Item5e),
      getUsage({ system: { activation: { type: 'none' } } } as dnd5e.documents.Item5e),
    ),
  ).toBe(-1);
});

it('sorts none activation before special activation', () => {
  expect(
    collator.compare(
      getUsage({ system: { activation: { type: 'none' } } } as dnd5e.documents.Item5e),
      getUsage({ system: { activation: { type: 'special' } } } as dnd5e.documents.Item5e),
    ),
  ).toBe(-1);
});

it('sorts minute with no cost before 1 minute', () => {
  expect(
    collator.compare(
      getUsage({ system: { activation: { type: 'minute' } } } as dnd5e.documents.Item5e),
      getUsage({ system: { activation: { type: 'minute', cost: 1 } } } as dnd5e.documents.Item5e),
    ),
  ).toBe(-1);
});

it('sorts 5 minute before 10 minute', () => {
  expect(
    collator.compare(
      getUsage({ system: { activation: { type: 'minute', cost: 5 } } } as dnd5e.documents.Item5e),
      getUsage({ system: { activation: { type: 'minute', cost: 10 } } } as dnd5e.documents.Item5e),
    ),
  ).toBe(-1);
});
