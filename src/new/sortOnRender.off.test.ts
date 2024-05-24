import forEachOpenSheet from '../forEachOpenSheet';
import { InventoryFallback } from '../settings';
import './sortOnRender';

jest.mock('../forEachOpenSheet');

beforeAll(() => {
  SIMULATE.mockSavedSetting('illandril-inventory-sorter', 'enableLegacySorter', true);
  Hooks.callAll('init');
});

it('does not attempt to sort when sheet is rendered', () => {
  const element = document.createElement('div');
  jest.spyOn(element, 'querySelectorAll');

  const sheet = {
    actor: {},
    element: { get: (index: number) => (index === 0 ? element : undefined) } as JQuery<HTMLElement>,
  } as ActorSheet<dnd5e.documents.Actor5e>;

  Hooks.callAll('renderActorSheet', sheet, {} as JQuery<HTMLElement>);

  expect(element.querySelectorAll).not.toHaveBeenCalled();
});

it('does not attempt to sort when settings are changed', () => {
  const element = document.createElement('div');
  jest.spyOn(element, 'querySelectorAll');

  const sheet = {
    actor: {},
    element: { get: (index: number) => (index === 0 ? element : undefined) } as JQuery<HTMLElement>,
  } as ActorSheet<dnd5e.documents.Actor5e>;
  jest.mocked(forEachOpenSheet).mockImplementation((callback) => {
    callback(sheet);
  });

  InventoryFallback.setPrimary('none');
  InventoryFallback.setPrimary('name_asc');
  InventoryFallback.setPrimary('name_desc');

  expect(element.querySelectorAll).not.toHaveBeenCalled();
});
