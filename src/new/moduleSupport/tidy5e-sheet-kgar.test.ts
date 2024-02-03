import { FallbackAsSpecificSetting, FeatureFallback, InventoryFallback, SpecificSetting, typeBasedSorting } from '../../settings';
import { mockActor, mockItem } from '../../tests/mockHelpers';
import '../sortOnRender';

beforeAll(() => {
  SIMULATE.mockSavedSetting('illandril-inventory-sorter', 'enableLegacySorter', false);
  Hooks.callAll('init');
});

beforeEach(() => {
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


describe.each([
  [
    'list',
    `<section class="item-table" data-tidy-sheet-part="item-table">
      <header class="item-table-header-row">
        <div class="item-table-column">Example (4)</div>
        <div class="item-table-column" title="Weight (lbs.)"><i class="fas fa-weight-hanging"></i></div>
        <div class="item-table-column" title="Charges"><i class="fas fa-bolt"></i></div>
        <div class="item-table-column">Usage</div>
        <div class="item-table-column"></div>
      </header>
      <div class="item-table-row-container" data-item-id="mock-item-a"></div>
      <div class="item-table-row-container" data-item-id="mock-item-b"></div>
      <div class="item-table-row-container" data-item-id="mock-item-c"></div>
      <div class="item-table-row-container" data-item-id="mock-item-d"></div>
      <footer class="item-table-footer-row">
        <button type="button" class="item-list-footer-button" title="Create Feature" data-tidy-sheet-part="item-create-command"><i class="fas fa-plus-circle"></i> Add</button>
      </footer>
    </section>`,
  ],
  [
    'grid',
    `<section class="item-table" data-tidy-sheet-part="item-table">
      <header class="item-table-header-row">
        <div class="item-table-column">Example (4)</div>
      </header>
      <div class="items">
        <button class="item" data-item-id="mock-item-a"></button>
        <button class="item" data-item-id="mock-item-b"></button>
        <button class="item" data-item-id="mock-item-c"></button>
        <button class="item" data-item-id="mock-item-d"></button>
        <div class="items-footer"><button type="button" class="footer-command icon-button" title="Create Item" data-tidy-sheet-part="item-create-command" tabindex="-1"><i class="fas fa-plus-circle svelte-1hga9hx"></i></button></div>
      </div>
    </section>`,
  ],
])('Mode: %s', (mode, html) => {
  describe.each([
    'renderActorSheet',
    'tidy5e-sheet.renderActorSheet',
  ] as const)('on %j', (hook) => {
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
        element.classList.add('tidy5e-kgar');
        element.innerHTML = html;

        // Sanity check test data setup
        if (mode === 'list') {
          expect(element.children).toHaveLength(1);
          expect(element.firstElementChild?.children).toHaveLength(6);
          expect(element.firstElementChild?.children[0].tagName).toBe('HEADER');
          expect(element.firstElementChild?.children[1].tagName).toBe('DIV');
          expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-a');
          expect(element.firstElementChild?.children[2].tagName).toBe('DIV');
          expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-b');
          expect(element.firstElementChild?.children[3].tagName).toBe('DIV');
          expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-c');
          expect(element.firstElementChild?.children[4].tagName).toBe('DIV');
          expect(element.firstElementChild?.children[4].getAttribute('data-item-id')).toBe('mock-item-d');
          expect(element.firstElementChild?.children[5].tagName).toBe('FOOTER');
        } else {
          expect(element.children).toHaveLength(1);
          expect(element.firstElementChild?.children).toHaveLength(2);
          expect(element.firstElementChild?.children[0].tagName).toBe('HEADER');
          expect(element.firstElementChild?.children[1].tagName).toBe('DIV');

          const grid = element.firstElementChild?.children[1];
          expect(grid?.children).toHaveLength(5);
          expect(grid?.children[0].tagName).toBe('BUTTON');
          expect(grid?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
          expect(grid?.children[1].tagName).toBe('BUTTON');
          expect(grid?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
          expect(grid?.children[2].tagName).toBe('BUTTON');
          expect(grid?.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
          expect(grid?.children[3].tagName).toBe('BUTTON');
          expect(grid?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');
          expect(grid?.children[4].tagName).toBe('DIV');
        }

        const sheet = {
          actor,
          element: { get: (index: number) => index === 0 ? element : undefined } as JQuery<HTMLElement>,
        } as ActorSheet<dnd5e.documents.Actor5e>;

        Hooks.callAll(hook, sheet, {} as JQuery<HTMLElement>);

        if (mode === 'list') {
          expect(element.children).toHaveLength(1);
          expect(element.firstElementChild?.children).toHaveLength(6);
          expect(element.firstElementChild?.children[0].tagName).toBe('HEADER');
          expect(element.firstElementChild?.children[1].tagName).toBe('DIV');
          expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-c');
          expect(element.firstElementChild?.children[2].tagName).toBe('DIV');
          expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-a');
          expect(element.firstElementChild?.children[3].tagName).toBe('DIV');
          expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-b');
          expect(element.firstElementChild?.children[4].tagName).toBe('DIV');
          expect(element.firstElementChild?.children[4].getAttribute('data-item-id')).toBe('mock-item-d');
          expect(element.firstElementChild?.children[5].tagName).toBe('FOOTER');
        } else {
          expect(element.children).toHaveLength(1);
          expect(element.firstElementChild?.children).toHaveLength(2);
          expect(element.firstElementChild?.children[0].tagName).toBe('HEADER');
          expect(element.firstElementChild?.children[1].tagName).toBe('DIV');

          const grid = element.firstElementChild?.children[1];
          expect(grid?.children).toHaveLength(5);
          expect(grid?.children[0].tagName).toBe('BUTTON');
          expect(grid?.children[0].getAttribute('data-item-id')).toBe('mock-item-c');
          expect(grid?.children[1].tagName).toBe('BUTTON');
          expect(grid?.children[1].getAttribute('data-item-id')).toBe('mock-item-a');
          expect(grid?.children[2].tagName).toBe('BUTTON');
          expect(grid?.children[2].getAttribute('data-item-id')).toBe('mock-item-b');
          expect(grid?.children[3].tagName).toBe('BUTTON');
          expect(grid?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');
          expect(grid?.children[4].tagName).toBe('DIV');
        }
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
        element.classList.add('tidy5e-kgar');
        element.innerHTML = html;

        // Sanity check test data setup
        if (mode === 'list') {
          expect(element.children).toHaveLength(1);
          expect(element.firstElementChild?.children).toHaveLength(6);
          expect(element.firstElementChild?.children[0].tagName).toBe('HEADER');
          expect(element.firstElementChild?.children[1].tagName).toBe('DIV');
          expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-a');
          expect(element.firstElementChild?.children[2].tagName).toBe('DIV');
          expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-b');
          expect(element.firstElementChild?.children[3].tagName).toBe('DIV');
          expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-c');
          expect(element.firstElementChild?.children[4].tagName).toBe('DIV');
          expect(element.firstElementChild?.children[4].getAttribute('data-item-id')).toBe('mock-item-d');
          expect(element.firstElementChild?.children[5].tagName).toBe('FOOTER');
        } else {
          expect(element.children).toHaveLength(1);
          expect(element.firstElementChild?.children).toHaveLength(2);
          expect(element.firstElementChild?.children[0].tagName).toBe('HEADER');
          expect(element.firstElementChild?.children[1].tagName).toBe('DIV');

          const grid = element.firstElementChild?.children[1];
          expect(grid?.children).toHaveLength(5);
          expect(grid?.children[0].tagName).toBe('BUTTON');
          expect(grid?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
          expect(grid?.children[1].tagName).toBe('BUTTON');
          expect(grid?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
          expect(grid?.children[2].tagName).toBe('BUTTON');
          expect(grid?.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
          expect(grid?.children[3].tagName).toBe('BUTTON');
          expect(grid?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');
          expect(grid?.children[4].tagName).toBe('DIV');
        }

        const sheet = {
          actor,
          element: { get: (index: number) => index === 0 ? element : undefined } as JQuery<HTMLElement>,
        } as ActorSheet<dnd5e.documents.Actor5e>;

        Hooks.callAll(hook, sheet, {} as JQuery<HTMLElement>);

        if (mode === 'list') {
          expect(element.children).toHaveLength(1);
          expect(element.firstElementChild?.children).toHaveLength(6);
          expect(element.firstElementChild?.children[0].tagName).toBe('HEADER');
          expect(element.firstElementChild?.children[1].tagName).toBe('DIV');
          expect(element.firstElementChild?.children[1].getAttribute('data-item-id')).toBe('mock-item-d');
          expect(element.firstElementChild?.children[2].tagName).toBe('DIV');
          expect(element.firstElementChild?.children[2].getAttribute('data-item-id')).toBe('mock-item-b');
          expect(element.firstElementChild?.children[3].tagName).toBe('DIV');
          expect(element.firstElementChild?.children[3].getAttribute('data-item-id')).toBe('mock-item-a');
          expect(element.firstElementChild?.children[4].tagName).toBe('DIV');
          expect(element.firstElementChild?.children[4].getAttribute('data-item-id')).toBe('mock-item-c');
          expect(element.firstElementChild?.children[5].tagName).toBe('FOOTER');
        } else {
          expect(element.children).toHaveLength(1);
          expect(element.firstElementChild?.children).toHaveLength(2);
          expect(element.firstElementChild?.children[0].tagName).toBe('HEADER');
          expect(element.firstElementChild?.children[1].tagName).toBe('DIV');

          const grid = element.firstElementChild?.children[1];
          expect(grid?.children).toHaveLength(5);
          expect(grid?.children[0].tagName).toBe('BUTTON');
          expect(grid?.children[0].getAttribute('data-item-id')).toBe('mock-item-d');
          expect(grid?.children[1].tagName).toBe('BUTTON');
          expect(grid?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
          expect(grid?.children[2].tagName).toBe('BUTTON');
          expect(grid?.children[2].getAttribute('data-item-id')).toBe('mock-item-a');
          expect(grid?.children[3].tagName).toBe('BUTTON');
          expect(grid?.children[3].getAttribute('data-item-id')).toBe('mock-item-c');
          expect(grid?.children[4].tagName).toBe('DIV');
        }
      });
    });
  });
});