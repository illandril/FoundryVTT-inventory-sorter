import forEachOpenSheet from '../forEachOpenSheet';
import { FallbackAsSpecificSetting, FeatureFallback, InventoryFallback, SpecificSetting, typeBasedSorting } from '../settings';
import { mockActor, mockItem } from '../tests/mockHelpers';
import './sortOnRender';

jest.mock('../forEachOpenSheet');

beforeAll(() => {
  SIMULATE.mockSavedSetting('illandril-inventory-sorter', 'enableLegacySorter', false);
  Hooks.callAll('init');
});

beforeEach(() => {
  // Reset to no open sheets
  jest.mocked(forEachOpenSheet).mockImplementation(() => undefined);

  // Reset all settings to defaults
  InventoryFallback.setPrimary('name_asc');
  InventoryFallback.setSecondary('none');
  FeatureFallback.setPrimary('name_asc');
  FeatureFallback.setSecondary('none');
  for (const entry of Object.entries(typeBasedSorting)) {
    if (!entry[1]) {
      continue;
    }
    if (entry[0] === 'spell') {
      const setting = entry[1] as FallbackAsSpecificSetting<never>;
      setting.setPrimary('name_asc');
      setting.setSecondary('none');
    } else {
      const setting = entry[1] as SpecificSetting<never>;
      setting.setPrimary('default');
      setting.setSecondary('default');
    }
  }
});

it('attempts to sort when sheet is rendered (sheet without item-lists)', () => {
  const element = document.createElement('div');
  jest.spyOn(element, 'querySelectorAll');

  const sheet = {
    actor: {},
    element: { get: (index: number) => index === 0 ? element : undefined } as JQuery<HTMLElement>,
  } as ActorSheet<dnd5e.documents.Actor5e>;

  Hooks.call('renderActorSheet', sheet, {} as JQuery<HTMLElement>);

  expect(element.querySelectorAll).toHaveBeenCalledTimes(1);
  expect(element.querySelectorAll).toHaveBeenCalledWith('.item-list');
});

it('attempts to sort when settings are changed (sheet without item-lists)', () => {
  const element = document.createElement('div');
  jest.spyOn(element, 'querySelectorAll');

  const sheet = {
    actor: {},
    element: { get: (index: number) => index === 0 ? element : undefined } as JQuery<HTMLElement>,
  } as ActorSheet<dnd5e.documents.Actor5e>;
  jest.mocked(forEachOpenSheet).mockImplementation((callback) => {
    callback(sheet);
  });

  InventoryFallback.setPrimary('none');

  expect(element.querySelectorAll).toHaveBeenCalledTimes(1);
  expect(element.querySelectorAll).toHaveBeenCalledWith('.item-list');

  InventoryFallback.setPrimary('name_asc');

  expect(element.querySelectorAll).toHaveBeenCalledTimes(2);
  expect(element.querySelectorAll).toHaveBeenLastCalledWith('.item-list');
});

it('does not attempt to sort when sheet has no actor', () => {
  const element = document.createElement('div');
  jest.spyOn(element, 'querySelectorAll');

  const sheet = {
    element: { get: (index: number) => index === 0 ? element : undefined } as JQuery<HTMLElement>,
  } as ActorSheet<dnd5e.documents.Actor5e>;
  jest.mocked(forEachOpenSheet).mockImplementation((callback) => {
    callback(sheet);
  });

  Hooks.call('renderActorSheet', sheet, {} as JQuery<HTMLElement>);

  expect(element.querySelectorAll).not.toHaveBeenCalled();
});

it('does not attempt to sort when sheet has no element', () => {
  const element = document.createElement('div');
  jest.spyOn(element, 'querySelectorAll');

  const sheet = {
    actor: {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    element: { get: (index: number) => undefined } as JQuery<HTMLElement>,
  } as ActorSheet<dnd5e.documents.Actor5e>;
  jest.mocked(forEachOpenSheet).mockImplementation((callback) => {
    callback(sheet);
  });

  Hooks.call('renderActorSheet', sheet, {} as JQuery<HTMLElement>);

  expect(element.querySelectorAll).not.toHaveBeenCalled();
});

it('gracefully handles items w/o id', () => {
  const actor = mockActor([
    mockItem({
      id: 'mock-item-a',
      name: 'bravo',
      type: 'weapon',
      sort: 1000,
      system: {},
    }),
    mockItem({
      id: 'mock-item-b',
      name: 'Charlie',
      type: 'weapon',
      sort: 2000,
      system: {},
    }),
    mockItem({
      id: 'mock-item-d',
      name: 'Delta',
      type: 'weapon',
      sort: 4000,
      system: {},
    }),
  ]);

  const element = document.createElement('div');
  element.innerHTML = `<div class="item-list">
    <div class="item" data-item-id="mock-item-a"></div>
    <div class="item" data-item-id="mock-item-b"></div>
    <div class="item"></div>
    <div class="item" data-item-id="mock-item-d"></div>
  </div>`;

  // Sanity check test data setup
  expect(element.children).toHaveLength(1);
  expect(element.firstElementChild?.children).toHaveLength(4);
  expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
  expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
  expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe(null);
  expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');

  const sheet = {
    actor,
    element: { get: (index: number) => index === 0 ? element : undefined } as JQuery<HTMLElement>,
  } as ActorSheet<dnd5e.documents.Actor5e>;

  Hooks.call('renderActorSheet', sheet, {} as JQuery<HTMLElement>);

  expect(element.children).toHaveLength(1);
  expect(element.firstElementChild?.children).toHaveLength(4);
  expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe(null);
  expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-a');
  expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-b');
  expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');
});


it('gracefully handles items w/o associated data', () => {
  const actor = mockActor([
    mockItem({
      id: 'mock-item-a',
      name: 'bravo',
      type: 'weapon',
      sort: 1000,
      system: {},
    }),
    mockItem({
      id: 'mock-item-b',
      name: 'Charlie',
      type: 'weapon',
      sort: 2000,
      system: {},
    }),
    mockItem({
      id: 'mock-item-d',
      name: 'Delta',
      type: 'weapon',
      sort: 4000,
      system: {},
    }),
  ]);

  const element = document.createElement('div');
  element.innerHTML = `<div class="item-list">
    <div class="item" data-item-id="mock-item-a"></div>
    <div class="item" data-item-id="mock-item-b"></div>
    <div class="item" data-item-id="mock-item-c"></div>
    <div class="item" data-item-id="mock-item-d"></div>
  </div>`;

  // Sanity check test data setup
  expect(element.children).toHaveLength(1);
  expect(element.firstElementChild?.children).toHaveLength(4);
  expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
  expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
  expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
  expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');

  const sheet = {
    actor,
    element: { get: (index: number) => index === 0 ? element : undefined } as JQuery<HTMLElement>,
  } as ActorSheet<dnd5e.documents.Actor5e>;

  Hooks.call('renderActorSheet', sheet, {} as JQuery<HTMLElement>);

  expect(element.children).toHaveLength(1);
  expect(element.firstElementChild?.children).toHaveLength(4);
  expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-c');
  expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-a');
  expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-b');
  expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');
});

describe.each([
  'weapon',
  'equipment',
  'consumable',
  'tool',
  'backpack',
  'loot',

  'race',
  'background',
  'class',
  'subclass',
  'feat',

  'spell',
] as const)('type=%s', (type) => {
  it('defaults sorts alphabetically by name, case-insensitive', () => {
    const actor = mockActor([
      mockItem({
        id: 'mock-item-a',
        name: 'bravo',
        type,
        sort: 1000,
        system: {},
      }),
      mockItem({
        id: 'mock-item-b',
        name: 'Charlie',
        type,
        sort: 2000,
        system: {},
      }),
      mockItem({
        id: 'mock-item-c',
        name: 'Alfa',
        type,
        sort: 3000,
        system: {},
      }),
      mockItem({
        id: 'mock-item-d',
        name: 'Delta',
        type,
        sort: 4000,
        system: {},
      }),
    ]);

    const element = document.createElement('div');
    element.innerHTML = `<div class="item-list">
      <div class="item" data-item-id="mock-item-a"></div>
      <div class="item" data-item-id="mock-item-b"></div>
      <div class="item" data-item-id="mock-item-c"></div>
      <div class="item" data-item-id="mock-item-d"></div>
    </div>`;

    // Sanity check test data setup
    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');

    const sheet = {
      actor,
      element: { get: (index: number) => index === 0 ? element : undefined } as JQuery<HTMLElement>,
    } as ActorSheet<dnd5e.documents.Actor5e>;

    Hooks.call('renderActorSheet', sheet, {} as JQuery<HTMLElement>);

    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');
  });

  it('supports name_asc sort', () => {
    typeBasedSorting[type].setPrimary('name_asc');
    const actor = mockActor([
      mockItem({
        id: 'mock-item-a',
        name: 'bravo',
        type,
        sort: 1000,
        system: {},
      }),
      mockItem({
        id: 'mock-item-b',
        name: 'Charlie',
        type,
        sort: 2000,
        system: {},
      }),
      mockItem({
        id: 'mock-item-c',
        name: 'Alfa',
        type,
        sort: 3000,
        system: {},
      }),
      mockItem({
        id: 'mock-item-d',
        name: 'Delta',
        type,
        sort: 4000,
        system: {},
      }),
    ]);

    const element = document.createElement('div');
    element.innerHTML = `<div class="item-list">
      <div class="item" data-item-id="mock-item-a"></div>
      <div class="item" data-item-id="mock-item-b"></div>
      <div class="item" data-item-id="mock-item-c"></div>
      <div class="item" data-item-id="mock-item-d"></div>
    </div>`;

    // Sanity check test data setup
    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');

    const sheet = {
      actor,
      element: { get: (index: number) => index === 0 ? element : undefined } as JQuery<HTMLElement>,
    } as ActorSheet<dnd5e.documents.Actor5e>;

    Hooks.call('renderActorSheet', sheet, {} as JQuery<HTMLElement>);

    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');
  });

  it('supports name_desc sort', () => {
    typeBasedSorting[type].setPrimary('name_desc');
    const actor = mockActor([
      mockItem({
        id: 'mock-item-a',
        name: 'bravo',
        type,
        sort: 1000,
        system: {},
      }),
      mockItem({
        id: 'mock-item-b',
        name: 'Charlie',
        type,
        sort: 2000,
        system: {},
      }),
      mockItem({
        id: 'mock-item-c',
        name: 'Alfa',
        type,
        sort: 3000,
        system: {},
      }),
      mockItem({
        id: 'mock-item-d',
        name: 'Delta',
        type,
        sort: 4000,
        system: {},
      }),
    ]);

    const element = document.createElement('div');
    element.innerHTML = `<div class="item-list">
      <div class="item" data-item-id="mock-item-a"></div>
      <div class="item" data-item-id="mock-item-b"></div>
      <div class="item" data-item-id="mock-item-c"></div>
      <div class="item" data-item-id="mock-item-d"></div>
    </div>`;

    // Sanity check test data setup
    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');

    const sheet = {
      actor,
      element: { get: (index: number) => index === 0 ? element : undefined } as JQuery<HTMLElement>,
    } as ActorSheet<dnd5e.documents.Actor5e>;

    Hooks.call('renderActorSheet', sheet, {} as JQuery<HTMLElement>);

    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-d');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-c');
  });

  it('supports none sort (manual sorting)', () => {
    typeBasedSorting[type].setPrimary('none');
    const actor = mockActor([
      mockItem({
        id: 'mock-item-a',
        name: 'bravo',
        type,
        sort: 1000,
        system: {},
      }),
      mockItem({
        id: 'mock-item-b',
        name: 'Charlie',
        type,
        sort: 2000,
        system: {},
      }),
      mockItem({
        id: 'mock-item-c',
        name: 'Alfa',
        type,
        sort: 3000,
        system: {},
      }),
      mockItem({
        id: 'mock-item-d',
        name: 'Delta',
        type,
        sort: 4000,
        system: {},
      }),
    ]);

    const element = document.createElement('div');
    element.innerHTML = `<div class="item-list">
      <div class="item" data-item-id="mock-item-a"></div>
      <div class="item" data-item-id="mock-item-b"></div>
      <div class="item" data-item-id="mock-item-c"></div>
      <div class="item" data-item-id="mock-item-d"></div>
    </div>`;

    // Sanity check test data setup
    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');

    const sheet = {
      actor,
      element: { get: (index: number) => index === 0 ? element : undefined } as JQuery<HTMLElement>,
    } as ActorSheet<dnd5e.documents.Actor5e>;

    Hooks.call('renderActorSheet', sheet, {} as JQuery<HTMLElement>);

    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');
  });

  it('falls back to manual sort if names are identical', () => {
    const actor = mockActor([
      mockItem({
        id: 'mock-item-a',
        name: 'bravo',
        type,
        sort: 1000,
        system: {},
      }),
      mockItem({
        id: 'mock-item-b',
        name: 'bravo',
        type,
        sort: 2000,
        system: {},
      }),
      mockItem({
        id: 'mock-item-c',
        name: 'Alfa',
        type,
        sort: 3000,
        system: {},
      }),
      mockItem({
        id: 'mock-item-d',
        name: 'Delta',
        type,
        sort: 4000,
        system: {},
      }),
    ]);

    const element = document.createElement('div');
    element.innerHTML = `<div class="item-list">
      <div class="item" data-item-id="mock-item-a"></div>
      <div class="item" data-item-id="mock-item-b"></div>
      <div class="item" data-item-id="mock-item-c"></div>
      <div class="item" data-item-id="mock-item-d"></div>
    </div>`;

    // Sanity check test data setup
    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');

    const sheet = {
      actor,
      element: { get: (index: number) => index === 0 ? element : undefined } as JQuery<HTMLElement>,
    } as ActorSheet<dnd5e.documents.Actor5e>;

    Hooks.call('renderActorSheet', sheet, {} as JQuery<HTMLElement>);

    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');
  });
});

describe.each([
  'weapon',
  'equipment',
  'consumable',
  'tool',
  'backpack',
  'loot',
] as const)('type=%s', (type) => {
  it('supports weight_asc sorting', () => {
    typeBasedSorting[type].setPrimary('weight_asc');
    const actor = mockActor([
      mockItem({
        id: 'mock-item-a',
        name: 'bravo',
        type,
        sort: 1000,
        system: {
          weight: 10,
        },
      }),
      mockItem({
        id: 'mock-item-b',
        name: 'Charlie',
        type,
        sort: 2000,
        system: {
          weight: 5,
        },
      }),
      mockItem({
        id: 'mock-item-c',
        name: 'Alfa',
        type,
        sort: 3000,
        system: {
          // Intentionally omitted
        },
      }),
      mockItem({
        id: 'mock-item-d',
        name: 'Delta',
        type,
        sort: 4000,
        system: {
          weight: 2,
        },
      }),
    ]);

    const element = document.createElement('div');
    element.innerHTML = `<div class="item-list">
      <div class="item" data-item-id="mock-item-a"></div>
      <div class="item" data-item-id="mock-item-b"></div>
      <div class="item" data-item-id="mock-item-c"></div>
      <div class="item" data-item-id="mock-item-d"></div>
    </div>`;

    // Sanity check test data setup
    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');

    const sheet = {
      actor,
      element: { get: (index: number) => index === 0 ? element : undefined } as JQuery<HTMLElement>,
    } as ActorSheet<dnd5e.documents.Actor5e>;

    Hooks.call('renderActorSheet', sheet, {} as JQuery<HTMLElement>);

    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-d');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-a');
  });

  it('supports weight_desc sorting', () => {
    typeBasedSorting[type].setPrimary('weight_desc');
    const actor = mockActor([
      mockItem({
        id: 'mock-item-a',
        name: 'bravo',
        type,
        sort: 1000,
        system: {
          weight: 10,
        },
      }),
      mockItem({
        id: 'mock-item-b',
        name: 'Charlie',
        type,
        sort: 2000,
        system: {
          weight: 5,
        },
      }),
      mockItem({
        id: 'mock-item-c',
        name: 'Alfa',
        type,
        sort: 3000,
        system: {
          // Intentionally omitted
        },
      }),
      mockItem({
        id: 'mock-item-d',
        name: 'Delta',
        type,
        sort: 4000,
        system: {
          weight: 2,
        },
      }),
    ]);

    const element = document.createElement('div');
    element.innerHTML = `<div class="item-list">
      <div class="item" data-item-id="mock-item-a"></div>
      <div class="item" data-item-id="mock-item-b"></div>
      <div class="item" data-item-id="mock-item-c"></div>
      <div class="item" data-item-id="mock-item-d"></div>
    </div>`;

    // Sanity check test data setup
    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');

    const sheet = {
      actor,
      element: { get: (index: number) => index === 0 ? element : undefined } as JQuery<HTMLElement>,
    } as ActorSheet<dnd5e.documents.Actor5e>;

    Hooks.call('renderActorSheet', sheet, {} as JQuery<HTMLElement>);

    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-d');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-c');
  });

  it('supports quantity_asc sorting', () => {
    typeBasedSorting[type].setPrimary('quantity_asc');
    const actor = mockActor([
      mockItem({
        id: 'mock-item-a',
        name: 'bravo',
        type,
        sort: 1000,
        system: {
          quantity: 10,
        },
      }),
      mockItem({
        id: 'mock-item-b',
        name: 'Charlie',
        type,
        sort: 2000,
        system: {
          quantity: 5,
        },
      }),
      mockItem({
        id: 'mock-item-c',
        name: 'Alfa',
        type,
        sort: 3000,
        system: {
          // Intentionally omitted
        },
      }),
      mockItem({
        id: 'mock-item-d',
        name: 'Delta',
        type,
        sort: 4000,
        system: {
          quantity: 2,
        },
      }),
    ]);

    const element = document.createElement('div');
    element.innerHTML = `<div class="item-list">
      <div class="item" data-item-id="mock-item-a"></div>
      <div class="item" data-item-id="mock-item-b"></div>
      <div class="item" data-item-id="mock-item-c"></div>
      <div class="item" data-item-id="mock-item-d"></div>
    </div>`;

    // Sanity check test data setup
    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');

    const sheet = {
      actor,
      element: { get: (index: number) => index === 0 ? element : undefined } as JQuery<HTMLElement>,
    } as ActorSheet<dnd5e.documents.Actor5e>;

    Hooks.call('renderActorSheet', sheet, {} as JQuery<HTMLElement>);

    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-d');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-a');
  });

  it('supports quantity_desc sorting', () => {
    typeBasedSorting[type].setPrimary('quantity_desc');
    const actor = mockActor([
      mockItem({
        id: 'mock-item-a',
        name: 'bravo',
        type,
        sort: 1000,
        system: {
          quantity: 10,
        },
      }),
      mockItem({
        id: 'mock-item-b',
        name: 'Charlie',
        type,
        sort: 2000,
        system: {
          quantity: 5,
        },
      }),
      mockItem({
        id: 'mock-item-c',
        name: 'Alfa',
        type,
        sort: 3000,
        system: {
          // Intentionally omitted
        },
      }),
      mockItem({
        id: 'mock-item-d',
        name: 'Delta',
        type,
        sort: 4000,
        system: {
          quantity: 2,
        },
      }),
    ]);

    const element = document.createElement('div');
    element.innerHTML = `<div class="item-list">
      <div class="item" data-item-id="mock-item-a"></div>
      <div class="item" data-item-id="mock-item-b"></div>
      <div class="item" data-item-id="mock-item-c"></div>
      <div class="item" data-item-id="mock-item-d"></div>
    </div>`;

    // Sanity check test data setup
    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');

    const sheet = {
      actor,
      element: { get: (index: number) => index === 0 ? element : undefined } as JQuery<HTMLElement>,
    } as ActorSheet<dnd5e.documents.Actor5e>;

    Hooks.call('renderActorSheet', sheet, {} as JQuery<HTMLElement>);

    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-d');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-c');
  });

  it('supports usage_asc sorting', () => {
    typeBasedSorting[type].setPrimary('usage_asc');
    const actor = mockActor([
      mockItem({
        id: 'mock-item-a',
        name: 'bravo',
        type,
        sort: 1000,
        system: {
          activation: {
            type: 'minute',
            cost: 10,
          },
        },
      }),
      mockItem({
        id: 'mock-item-b',
        name: 'Charlie',
        type,
        sort: 2000,
        system: {
          activation: {
            type: 'minute',
            cost: 1,
          },
        },
      }),
      mockItem({
        id: 'mock-item-c',
        name: 'Alfa',
        type,
        sort: 3000,
        system: {
          // Intentionally omitted
        },
      }),
      mockItem({
        id: 'mock-item-d',
        name: 'Delta',
        type,
        sort: 4000,
        system: {
          activation: {
            type: 'bonus',
            cost: 1,
          },
        },
      }),
    ]);

    const element = document.createElement('div');
    element.innerHTML = `<div class="item-list">
      <div class="item" data-item-id="mock-item-a"></div>
      <div class="item" data-item-id="mock-item-b"></div>
      <div class="item" data-item-id="mock-item-c"></div>
      <div class="item" data-item-id="mock-item-d"></div>
    </div>`;

    // Sanity check test data setup
    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');

    const sheet = {
      actor,
      element: { get: (index: number) => index === 0 ? element : undefined } as JQuery<HTMLElement>,
    } as ActorSheet<dnd5e.documents.Actor5e>;

    Hooks.call('renderActorSheet', sheet, {} as JQuery<HTMLElement>);

    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-d');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-a');
  });

  it('supports usage_desc sorting', () => {
    typeBasedSorting[type].setPrimary('usage_desc');
    const actor = mockActor([
      mockItem({
        id: 'mock-item-a',
        name: 'bravo',
        type,
        sort: 1000,
        system: {
          activation: {
            type: 'minute',
            cost: 10,
          },
        },
      }),
      mockItem({
        id: 'mock-item-b',
        name: 'Charlie',
        type,
        sort: 2000,
        system: {
          activation: {
            type: 'minute',
            cost: 1,
          },
        },
      }),
      mockItem({
        id: 'mock-item-c',
        name: 'Alfa',
        type,
        sort: 3000,
        system: {
          // Intentionally omitted
        },
      }),
      mockItem({
        id: 'mock-item-d',
        name: 'Delta',
        type,
        sort: 4000,
        system: {
          activation: {
            type: 'bonus',
            cost: 1,
          },
        },
      }),
    ]);

    const element = document.createElement('div');
    element.innerHTML = `<div class="item-list">
      <div class="item" data-item-id="mock-item-a"></div>
      <div class="item" data-item-id="mock-item-b"></div>
      <div class="item" data-item-id="mock-item-c"></div>
      <div class="item" data-item-id="mock-item-d"></div>
    </div>`;

    // Sanity check test data setup
    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');

    const sheet = {
      actor,
      element: { get: (index: number) => index === 0 ? element : undefined } as JQuery<HTMLElement>,
    } as ActorSheet<dnd5e.documents.Actor5e>;

    Hooks.call('renderActorSheet', sheet, {} as JQuery<HTMLElement>);

    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-d');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-c');
  });
});

describe.each([
  'feat',
] as const)('type=%s', (type) => {
  it('supports requirements_asc sorting', () => {
    typeBasedSorting[type].setPrimary('requirements_asc');
    const actor = mockActor([
      mockItem({
        id: 'mock-item-a',
        name: 'bravo',
        type,
        sort: 1000,
        system: {
          requirements: 'Monk 2',
        },
      }),
      mockItem({
        id: 'mock-item-b',
        name: 'Charlie',
        type,
        sort: 2000,
        system: {
          requirements: 'Monk 1',
        },
      }),
      mockItem({
        id: 'mock-item-c',
        name: 'Alfa',
        type,
        sort: 3000,
        system: {
          // Intentionally omitted
        },
      }),
      mockItem({
        id: 'mock-item-d',
        name: 'Delta',
        type,
        sort: 4000,
        system: {
          requirements: 'Barbarian 1',
        },
      }),
    ]);

    const element = document.createElement('div');
    element.innerHTML = `<div class="item-list">
      <div class="item" data-item-id="mock-item-a"></div>
      <div class="item" data-item-id="mock-item-b"></div>
      <div class="item" data-item-id="mock-item-c"></div>
      <div class="item" data-item-id="mock-item-d"></div>
    </div>`;

    // Sanity check test data setup
    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');

    const sheet = {
      actor,
      element: { get: (index: number) => index === 0 ? element : undefined } as JQuery<HTMLElement>,
    } as ActorSheet<dnd5e.documents.Actor5e>;

    Hooks.call('renderActorSheet', sheet, {} as JQuery<HTMLElement>);

    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-d');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-a');
  });

  it('supports requirements_desc sorting', () => {
    typeBasedSorting[type].setPrimary('requirements_desc');
    const actor = mockActor([
      mockItem({
        id: 'mock-item-a',
        name: 'bravo',
        type,
        sort: 1000,
        system: {
          requirements: 'Monk 2',
        },
      }),
      mockItem({
        id: 'mock-item-b',
        name: 'Charlie',
        type,
        sort: 2000,
        system: {
          requirements: 'Monk 1',
        },
      }),
      mockItem({
        id: 'mock-item-c',
        name: 'Alfa',
        type,
        sort: 3000,
        system: {
          // Intentionally omitted
        },
      }),
      mockItem({
        id: 'mock-item-d',
        name: 'Delta',
        type,
        sort: 4000,
        system: {
          requirements: 'Barbarian 1',
        },
      }),
    ]);

    const element = document.createElement('div');
    element.innerHTML = `<div class="item-list">
      <div class="item" data-item-id="mock-item-a"></div>
      <div class="item" data-item-id="mock-item-b"></div>
      <div class="item" data-item-id="mock-item-c"></div>
      <div class="item" data-item-id="mock-item-d"></div>
    </div>`;

    // Sanity check test data setup
    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');

    const sheet = {
      actor,
      element: { get: (index: number) => index === 0 ? element : undefined } as JQuery<HTMLElement>,
    } as ActorSheet<dnd5e.documents.Actor5e>;

    Hooks.call('renderActorSheet', sheet, {} as JQuery<HTMLElement>);

    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-d');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-c');
  });

  it('supports usage_asc sorting', () => {
    typeBasedSorting[type].setPrimary('usage_asc');
    const actor = mockActor([
      mockItem({
        id: 'mock-item-a',
        name: 'bravo',
        type,
        sort: 1000,
        system: {
          activation: {
            type: 'minute',
            cost: 10,
          },
        },
      }),
      mockItem({
        id: 'mock-item-b',
        name: 'Charlie',
        type,
        sort: 2000,
        system: {
          activation: {
            type: 'minute',
            cost: 1,
          },
        },
      }),
      mockItem({
        id: 'mock-item-c',
        name: 'Alfa',
        type,
        sort: 3000,
        system: {
          activation: {
            type: 'action',
            cost: 1,
          },
        },
      }),
      mockItem({
        id: 'mock-item-d',
        name: 'Delta',
        type,
        sort: 4000,
        system: {
          activation: {
            type: 'bonus',
            cost: 1,
          },
        },
      }),
    ]);

    const element = document.createElement('div');
    element.innerHTML = `<div class="item-list">
      <div class="item" data-item-id="mock-item-a"></div>
      <div class="item" data-item-id="mock-item-b"></div>
      <div class="item" data-item-id="mock-item-c"></div>
      <div class="item" data-item-id="mock-item-d"></div>
    </div>`;

    // Sanity check test data setup
    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');

    const sheet = {
      actor,
      element: { get: (index: number) => index === 0 ? element : undefined } as JQuery<HTMLElement>,
    } as ActorSheet<dnd5e.documents.Actor5e>;

    Hooks.call('renderActorSheet', sheet, {} as JQuery<HTMLElement>);

    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-d');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-a');
  });

  it('supports usage_desc sorting', () => {
    typeBasedSorting[type].setPrimary('usage_desc');
    const actor = mockActor([
      mockItem({
        id: 'mock-item-a',
        name: 'bravo',
        type,
        sort: 1000,
        system: {
          activation: {
            type: 'minute',
            cost: 10,
          },
        },
      }),
      mockItem({
        id: 'mock-item-b',
        name: 'Charlie',
        type,
        sort: 2000,
        system: {
          activation: {
            type: 'minute',
            cost: 1,
          },
        },
      }),
      mockItem({
        id: 'mock-item-c',
        name: 'Alfa',
        type,
        sort: 3000,
        system: {
          activation: {
            type: 'action',
            cost: 1,
          },
        },
      }),
      mockItem({
        id: 'mock-item-d',
        name: 'Delta',
        type,
        sort: 4000,
        system: {
          activation: {
            type: 'bonus',
            cost: 1,
          },
        },
      }),
    ]);

    const element = document.createElement('div');
    element.innerHTML = `<div class="item-list">
      <div class="item" data-item-id="mock-item-a"></div>
      <div class="item" data-item-id="mock-item-b"></div>
      <div class="item" data-item-id="mock-item-c"></div>
      <div class="item" data-item-id="mock-item-d"></div>
    </div>`;

    // Sanity check test data setup
    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');

    const sheet = {
      actor,
      element: { get: (index: number) => index === 0 ? element : undefined } as JQuery<HTMLElement>,
    } as ActorSheet<dnd5e.documents.Actor5e>;

    Hooks.call('renderActorSheet', sheet, {} as JQuery<HTMLElement>);

    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-d');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-c');
  });
});

describe.each([
  'spell',
] as const)('type=%s', (type) => {
  it('supports school_asc sorting', () => {
    typeBasedSorting[type].setPrimary('school_asc');
    const actor = mockActor([
      mockItem({
        id: 'mock-item-a',
        name: 'bravo',
        type,
        sort: 1000,
        system: {
          school: 'evo',
        },
      }),
      mockItem({
        id: 'mock-item-b',
        name: 'Charlie',
        type,
        sort: 2000,
        system: {
          school: 'enc',
        },
      }),
      mockItem({
        id: 'mock-item-c',
        name: 'Alfa',
        type,
        sort: 3000,
        system: {
          // Intentionally omitted
        },
      }),
      mockItem({
        id: 'mock-item-d',
        name: 'Delta',
        type,
        sort: 4000,
        system: {
          school: 'div',
        },
      }),
    ]);

    const element = document.createElement('div');
    element.innerHTML = `<div class="item-list">
      <div class="item" data-item-id="mock-item-a"></div>
      <div class="item" data-item-id="mock-item-b"></div>
      <div class="item" data-item-id="mock-item-c"></div>
      <div class="item" data-item-id="mock-item-d"></div>
    </div>`;

    // Sanity check test data setup
    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');

    const sheet = {
      actor,
      element: { get: (index: number) => index === 0 ? element : undefined } as JQuery<HTMLElement>,
    } as ActorSheet<dnd5e.documents.Actor5e>;

    Hooks.call('renderActorSheet', sheet, {} as JQuery<HTMLElement>);

    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-d');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-a');
  });

  it('supports school_desc sorting', () => {
    typeBasedSorting[type].setPrimary('school_desc');
    const actor = mockActor([
      mockItem({
        id: 'mock-item-a',
        name: 'bravo',
        type,
        sort: 1000,
        system: {
          school: 'evo',
        },
      }),
      mockItem({
        id: 'mock-item-b',
        name: 'Charlie',
        type,
        sort: 2000,
        system: {
          school: 'enc',
        },
      }),
      mockItem({
        id: 'mock-item-c',
        name: 'Alfa',
        type,
        sort: 3000,
        system: {
          // Intentionally omitted
        },
      }),
      mockItem({
        id: 'mock-item-d',
        name: 'Delta',
        type,
        sort: 4000,
        system: {
          school: 'div',
        },
      }),
    ]);

    const element = document.createElement('div');
    element.innerHTML = `<div class="item-list">
      <div class="item" data-item-id="mock-item-a"></div>
      <div class="item" data-item-id="mock-item-b"></div>
      <div class="item" data-item-id="mock-item-c"></div>
      <div class="item" data-item-id="mock-item-d"></div>
    </div>`;

    // Sanity check test data setup
    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');

    const sheet = {
      actor,
      element: { get: (index: number) => index === 0 ? element : undefined } as JQuery<HTMLElement>,
    } as ActorSheet<dnd5e.documents.Actor5e>;

    Hooks.call('renderActorSheet', sheet, {} as JQuery<HTMLElement>);

    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-d');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-c');
  });

  it('supports target_asc sorting', () => {
    typeBasedSorting[type].setPrimary('target_asc');
    const actor = mockActor([
      mockItem({
        id: 'mock-item-a',
        name: 'bravo',
        type,
        sort: 1000,
        system: {
          target: {
            type: 'sphere',
            value: 30,
          },
        },
      }),
      mockItem({
        id: 'mock-item-b',
        name: 'Charlie',
        type,
        sort: 2000,
        system: {
          target: {
            type: 'sphere',
            value: 10,
          },
        },
      }),
      mockItem({
        id: 'mock-item-c',
        name: 'Alfa',
        type,
        sort: 3000,
        system: {
          // Intentionally omitted
        },
      }),
      mockItem({
        id: 'mock-item-d',
        name: 'Delta',
        type,
        sort: 4000,
        system: {
          target: {
            type: 'ally',
          },
        },
      }),
    ]);

    const element = document.createElement('div');
    element.innerHTML = `<div class="item-list">
      <div class="item" data-item-id="mock-item-a"></div>
      <div class="item" data-item-id="mock-item-b"></div>
      <div class="item" data-item-id="mock-item-c"></div>
      <div class="item" data-item-id="mock-item-d"></div>
    </div>`;

    // Sanity check test data setup
    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');

    const sheet = {
      actor,
      element: { get: (index: number) => index === 0 ? element : undefined } as JQuery<HTMLElement>,
    } as ActorSheet<dnd5e.documents.Actor5e>;

    Hooks.call('renderActorSheet', sheet, {} as JQuery<HTMLElement>);

    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-d');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-a');
  });

  it('supports target_desc sorting', () => {
    typeBasedSorting[type].setPrimary('target_desc');
    const actor = mockActor([
      mockItem({
        id: 'mock-item-a',
        name: 'bravo',
        type,
        sort: 1000,
        system: {
          target: {
            type: 'sphere',
            value: 30,
          },
        },
      }),
      mockItem({
        id: 'mock-item-b',
        name: 'Charlie',
        type,
        sort: 2000,
        system: {
          target: {
            type: 'sphere',
            value: 10,
          },
        },
      }),
      mockItem({
        id: 'mock-item-c',
        name: 'Alfa',
        type,
        sort: 3000,
        system: {
          // Intentionally omitted
        },
      }),
      mockItem({
        id: 'mock-item-d',
        name: 'Delta',
        type,
        sort: 4000,
        system: {
          target: {
            type: 'ally',
          },
        },
      }),
    ]);

    const element = document.createElement('div');
    element.innerHTML = `<div class="item-list">
      <div class="item" data-item-id="mock-item-a"></div>
      <div class="item" data-item-id="mock-item-b"></div>
      <div class="item" data-item-id="mock-item-c"></div>
      <div class="item" data-item-id="mock-item-d"></div>
    </div>`;

    // Sanity check test data setup
    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');

    const sheet = {
      actor,
      element: { get: (index: number) => index === 0 ? element : undefined } as JQuery<HTMLElement>,
    } as ActorSheet<dnd5e.documents.Actor5e>;

    Hooks.call('renderActorSheet', sheet, {} as JQuery<HTMLElement>);

    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-d');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-c');
  });

  it('supports usage_asc sorting', () => {
    typeBasedSorting[type].setPrimary('usage_asc');
    const actor = mockActor([
      mockItem({
        id: 'mock-item-a',
        name: 'bravo',
        type,
        sort: 1000,
        system: {
          activation: {
            type: 'minute',
            cost: 10,
          },
        },
      }),
      mockItem({
        id: 'mock-item-b',
        name: 'Charlie',
        type,
        sort: 2000,
        system: {
          activation: {
            type: 'minute',
            cost: 1,
          },
        },
      }),
      mockItem({
        id: 'mock-item-c',
        name: 'Alfa',
        type,
        sort: 3000,
        system: {
          activation: {
            type: 'action',
            cost: 1,
          },
        },
      }),
      mockItem({
        id: 'mock-item-d',
        name: 'Delta',
        type,
        sort: 4000,
        system: {
          activation: {
            type: 'bonus',
            cost: 1,
          },
        },
      }),
    ]);

    const element = document.createElement('div');
    element.innerHTML = `<div class="item-list">
      <div class="item" data-item-id="mock-item-a"></div>
      <div class="item" data-item-id="mock-item-b"></div>
      <div class="item" data-item-id="mock-item-c"></div>
      <div class="item" data-item-id="mock-item-d"></div>
    </div>`;

    // Sanity check test data setup
    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');

    const sheet = {
      actor,
      element: { get: (index: number) => index === 0 ? element : undefined } as JQuery<HTMLElement>,
    } as ActorSheet<dnd5e.documents.Actor5e>;

    Hooks.call('renderActorSheet', sheet, {} as JQuery<HTMLElement>);

    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-d');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-a');
  });

  it('supports usage_desc sorting', () => {
    typeBasedSorting[type].setPrimary('usage_desc');
    const actor = mockActor([
      mockItem({
        id: 'mock-item-a',
        name: 'bravo',
        type,
        sort: 1000,
        system: {
          activation: {
            type: 'minute',
            cost: 10,
          },
        },
      }),
      mockItem({
        id: 'mock-item-b',
        name: 'Charlie',
        type,
        sort: 2000,
        system: {
          activation: {
            type: 'minute',
            cost: 1,
          },
        },
      }),
      mockItem({
        id: 'mock-item-c',
        name: 'Alfa',
        type,
        sort: 3000,
        system: {
          activation: {
            type: 'action',
            cost: 1,
          },
        },
      }),
      mockItem({
        id: 'mock-item-d',
        name: 'Delta',
        type,
        sort: 4000,
        system: {
          activation: {
            type: 'bonus',
            cost: 1,
          },
        },
      }),
    ]);

    const element = document.createElement('div');
    element.innerHTML = `<div class="item-list">
      <div class="item" data-item-id="mock-item-a"></div>
      <div class="item" data-item-id="mock-item-b"></div>
      <div class="item" data-item-id="mock-item-c"></div>
      <div class="item" data-item-id="mock-item-d"></div>
    </div>`;

    // Sanity check test data setup
    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');

    const sheet = {
      actor,
      element: { get: (index: number) => index === 0 ? element : undefined } as JQuery<HTMLElement>,
    } as ActorSheet<dnd5e.documents.Actor5e>;

    Hooks.call('renderActorSheet', sheet, {} as JQuery<HTMLElement>);

    expect(element.children).toHaveLength(1);
    expect(element.firstElementChild?.children).toHaveLength(4);
    expect(element.firstElementChild?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
    expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
    expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-d');
    expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-c');
  });
});
