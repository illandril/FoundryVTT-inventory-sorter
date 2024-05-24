import collator from '../collator';
import getTarget from './getTarget';

it('sorts empty system and empty target equally', () => {
  expect(
    collator.compare(
      getTarget({ system: {} } as dnd5e.documents.Item5e),
      getTarget({ system: { target: {} } } as dnd5e.documents.Item5e),
    ),
  ).toBe(0);
});

it('sorts empty target before ally target', () => {
  expect(
    collator.compare(
      getTarget({ system: { target: {} } } as dnd5e.documents.Item5e),
      getTarget({ system: { target: { type: 'ally' } } } as dnd5e.documents.Item5e),
    ),
  ).toBe(-1);
});

it('sorts ally target before cone target', () => {
  expect(
    collator.compare(
      getTarget({ system: { target: { type: 'ally' } } } as dnd5e.documents.Item5e),
      getTarget({ system: { target: { type: 'cone' } } } as dnd5e.documents.Item5e),
    ),
  ).toBe(-1);
});

it('sorts radius with no value  before 5 radius', () => {
  expect(
    collator.compare(
      getTarget({ system: { target: { type: 'radius' } } } as dnd5e.documents.Item5e),
      getTarget({ system: { target: { type: 'radius', value: 5 } } } as dnd5e.documents.Item5e),
    ),
  ).toBe(-1);
});

it('sorts 5 radius before 10 radius', () => {
  expect(
    collator.compare(
      getTarget({ system: { target: { type: 'radius', value: 5 } } } as dnd5e.documents.Item5e),
      getTarget({ system: { target: { type: 'radius', value: 10 } } } as dnd5e.documents.Item5e),
    ),
  ).toBe(-1);
});
