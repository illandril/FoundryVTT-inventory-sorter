import {
  type FallbackAsSpecificSetting,
  FeatureFallback,
  InventoryFallback,
  type SpecificSetting,
  typeBasedSorting,
} from '../../settings';
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

describe.each(['tidy5e-sheet', 'tidy5e-kgar'])('tidy5e-kgar alpha layout > .%s', (sheetClass) => {
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
    describe.each(['renderActorSheet', 'tidy5e-sheet.renderActorSheet'] as const)('on %j', (hook) => {
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
          element.classList.add(sheetClass);
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
            element: { get: (index: number) => (index === 0 ? element : undefined) } as JQuery<HTMLElement>,
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
          element.classList.add(sheetClass);
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
            element: { get: (index: number) => (index === 0 ? element : undefined) } as JQuery<HTMLElement>,
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
});

describe('tidy5e-sheet 2.0.0-beta.4 layout > .tidy5e-sheet', () => {
  const sheetClass = 'tidy5e-sheet';
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
        <div class="expandable">
          <div class="item-table-body">
            <div class="item-table-row-container" data-item-id="mock-item-a"></div>
            <div class="item-table-row-container" data-item-id="mock-item-b"></div>
            <div class="item-table-row-container" data-item-id="mock-item-c"></div>
            <div class="item-table-row-container" data-item-id="mock-item-d"></div>
            <footer class="item-table-footer-row">
              <button type="button" class="item-list-footer-button" title="Create Feature" data-tidy-sheet-part="item-create-command"><i class="fas fa-plus-circle"></i> Add</button>
            </footer>
          </div>
        </div>
      </section>`,
    ],
    [
      'grid',
      `<section class="item-table" data-tidy-sheet-part="item-table">
        <header class="item-table-header-row">
          <div class="item-table-column">Example (4)</div>
        </header>
        <div class="expandable">
          <div class="item-table-body">
            <div class="items">
              <button class="item" data-item-id="mock-item-a"></button>
              <button class="item" data-item-id="mock-item-b"></button>
              <button class="item" data-item-id="mock-item-c"></button>
              <button class="item" data-item-id="mock-item-d"></button>
              <div class="items-footer"><button type="button" class="footer-command icon-button" title="Create Item" data-tidy-sheet-part="item-create-command" tabindex="-1"><i class="fas fa-plus-circle svelte-1hga9hx"></i></button></div>
            </div>
          </div>
        </div>
      </section>`,
    ],
  ])('Mode: %s', (mode, html) => {
    describe.each(['renderActorSheet', 'tidy5e-sheet.renderActorSheet'] as const)('on %j', (hook) => {
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
          element.classList.add(sheetClass);
          element.innerHTML = html;

          // START Sanity check test data setup
          expect(element.children).toHaveLength(1);

          const section = element.firstElementChild!;
          expect(section.children).toHaveLength(2);
          expect(section.children[0].tagName).toBe('HEADER');
          expect(section.children[1].tagName).toBe('DIV');

          const expandable = section.children[1]!;
          expect(expandable.classList).toContain('expandable');
          expect(expandable.children).toHaveLength(1);

          const list = expandable.firstElementChild!;

          if (mode === 'list') {
            expect(list.children).toHaveLength(5);
            expect(list.children[0].tagName).toBe('DIV');
            expect(list.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
            expect(list.children[1].tagName).toBe('DIV');
            expect(list.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
            expect(list.children[2].tagName).toBe('DIV');
            expect(list.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
            expect(list.children[3].tagName).toBe('DIV');
            expect(list.children[3].getAttribute('data-item-id')).toBe('mock-item-d');
            expect(list.children[4].tagName).toBe('FOOTER');
          } else {
            expect(list.children).toHaveLength(1);
            const grid = list.firstElementChild;
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
          // END Sanity check test data setup

          const sheet = {
            actor,
            element: { get: (index: number) => (index === 0 ? element : undefined) } as JQuery<HTMLElement>,
          } as ActorSheet<dnd5e.documents.Actor5e>;

          Hooks.callAll(hook, sheet, {} as JQuery<HTMLElement>);

          expect(element.children).toHaveLength(1);
          expect(section.children).toHaveLength(2);
          expect(expandable.children).toHaveLength(1);
          if (mode === 'list') {
            expect(list.children).toHaveLength(5);
            expect(list.children[0].tagName).toBe('DIV');
            expect(list.children[0].getAttribute('data-item-id')).toBe('mock-item-c');
            expect(list.children[1].tagName).toBe('DIV');
            expect(list.children[1].getAttribute('data-item-id')).toBe('mock-item-a');
            expect(list.children[2].tagName).toBe('DIV');
            expect(list.children[2].getAttribute('data-item-id')).toBe('mock-item-b');
            expect(list.children[3].tagName).toBe('DIV');
            expect(list.children[3].getAttribute('data-item-id')).toBe('mock-item-d');
            expect(list.children[4].tagName).toBe('FOOTER');
          } else {
            expect(list.children).toHaveLength(1);
            const grid = list.firstElementChild;
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
          element.classList.add(sheetClass);
          element.innerHTML = html;

          // START Sanity check test data setup
          expect(element.children).toHaveLength(1);

          const section = element.firstElementChild!;
          expect(section.children).toHaveLength(2);
          expect(section.children[0].tagName).toBe('HEADER');
          expect(section.children[1].tagName).toBe('DIV');

          const expandable = section.children[1]!;
          expect(expandable.classList).toContain('expandable');
          expect(expandable.children).toHaveLength(1);

          const list = expandable.firstElementChild!;

          if (mode === 'list') {
            expect(list.children).toHaveLength(5);
            expect(list.children[0].tagName).toBe('DIV');
            expect(list.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
            expect(list.children[1].tagName).toBe('DIV');
            expect(list.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
            expect(list.children[2].tagName).toBe('DIV');
            expect(list.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
            expect(list.children[3].tagName).toBe('DIV');
            expect(list.children[3].getAttribute('data-item-id')).toBe('mock-item-d');
            expect(list.children[4].tagName).toBe('FOOTER');
          } else {
            expect(list.children).toHaveLength(1);
            const grid = list.firstElementChild;
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
          // END Sanity check test data setup

          const sheet = {
            actor,
            element: { get: (index: number) => (index === 0 ? element : undefined) } as JQuery<HTMLElement>,
          } as ActorSheet<dnd5e.documents.Actor5e>;

          Hooks.callAll(hook, sheet, {} as JQuery<HTMLElement>);

          expect(element.children).toHaveLength(1);
          expect(section.children).toHaveLength(2);
          expect(expandable.children).toHaveLength(1);
          if (mode === 'list') {
            expect(list.children).toHaveLength(5);
            expect(list.children[0].tagName).toBe('DIV');
            expect(list.children[0].getAttribute('data-item-id')).toBe('mock-item-d');
            expect(list.children[1].tagName).toBe('DIV');
            expect(list.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
            expect(list.children[2].tagName).toBe('DIV');
            expect(list.children[2].getAttribute('data-item-id')).toBe('mock-item-a');
            expect(list.children[3].tagName).toBe('DIV');
            expect(list.children[3].getAttribute('data-item-id')).toBe('mock-item-c');
            expect(list.children[4].tagName).toBe('FOOTER');
          } else {
            expect(list.children).toHaveLength(1);
            const grid = list.firstElementChild;
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

  describe.each([
    [
      'list',
      `<section class="item-table" data-tidy-sheet-part="item-table">
        <header class="item-table-header-row">
          <div class="item-table-column">Example (0)</div>
          <div class="item-table-column" title="Weight (lbs.)"><i class="fas fa-weight-hanging"></i></div>
          <div class="item-table-column" title="Charges"><i class="fas fa-bolt"></i></div>
          <div class="item-table-column">Usage</div>
          <div class="item-table-column"></div>
        </header>
        <div class="expandable">
          <div class="item-table-body">
            <footer class="item-table-footer-row">
              <button type="button" class="item-list-footer-button" title="Create Feature" data-tidy-sheet-part="item-create-command"><i class="fas fa-plus-circle"></i> Add</button>
            </footer>
          </div>
        </div>
      </section>`,
    ],
    [
      'grid',
      `<section class="item-table" data-tidy-sheet-part="item-table">
        <header class="item-table-header-row">
          <div class="item-table-column">Example (0)</div>
        </header>
        <div class="expandable">
          <div class="item-table-body">
            <div class="items">
              <div class="items-footer"><button type="button" class="footer-command icon-button" title="Create Item" data-tidy-sheet-part="item-create-command" tabindex="-1"><i class="fas fa-plus-circle svelte-1hga9hx"></i></button></div>
            </div>
          </div>
        </div>
      </section>`,
    ],
  ])('Mode: %s (empty list)', (mode, html) => {
    describe.each(['renderActorSheet', 'tidy5e-sheet.renderActorSheet'] as const)('on %j', (hook) => {
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
          element.classList.add(sheetClass);
          element.innerHTML = html;

          // START Sanity check test data setup
          expect(element.children).toHaveLength(1);

          const section = element.firstElementChild!;
          expect(section.children).toHaveLength(2);
          expect(section.children[0].tagName).toBe('HEADER');
          expect(section.children[1].tagName).toBe('DIV');

          const expandable = section.children[1]!;
          expect(expandable.classList).toContain('expandable');
          expect(expandable.children).toHaveLength(1);

          const list = expandable.firstElementChild!;

          if (mode === 'list') {
            expect(list.children).toHaveLength(1);
            expect(list.children[0].tagName).toBe('FOOTER');
          } else {
            expect(list.children).toHaveLength(1);
            const grid = list.firstElementChild;
            expect(grid?.children).toHaveLength(1);
            expect(grid?.children[0].tagName).toBe('DIV');
          }
          // END Sanity check test data setup

          const sheet = {
            actor,
            element: { get: (index: number) => (index === 0 ? element : undefined) } as JQuery<HTMLElement>,
          } as ActorSheet<dnd5e.documents.Actor5e>;

          Hooks.callAll(hook, sheet, {} as JQuery<HTMLElement>);

          expect(element.children).toHaveLength(1);
          expect(section.children).toHaveLength(2);
          expect(expandable.children).toHaveLength(1);
          if (mode === 'list') {
            expect(list.children).toHaveLength(1);
            expect(list.children[0].tagName).toBe('FOOTER');
          } else {
            expect(list.children).toHaveLength(1);
            const grid = list.firstElementChild;
            expect(grid?.children).toHaveLength(1);
            expect(grid?.children[0].tagName).toBe('DIV');
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
          element.classList.add(sheetClass);
          element.innerHTML = html;

          // START Sanity check test data setup
          expect(element.children).toHaveLength(1);

          const section = element.firstElementChild!;
          expect(section.children).toHaveLength(2);
          expect(section.children[0].tagName).toBe('HEADER');
          expect(section.children[1].tagName).toBe('DIV');

          const expandable = section.children[1]!;
          expect(expandable.classList).toContain('expandable');
          expect(expandable.children).toHaveLength(1);

          const list = expandable.firstElementChild!;

          if (mode === 'list') {
            expect(list.children).toHaveLength(1);
            expect(list.children[0].tagName).toBe('FOOTER');
          } else {
            expect(list.children).toHaveLength(1);
            const grid = list.firstElementChild;
            expect(grid?.children).toHaveLength(1);
            expect(grid?.children[0].tagName).toBe('DIV');
          }
          // END Sanity check test data setup

          const sheet = {
            actor,
            element: { get: (index: number) => (index === 0 ? element : undefined) } as JQuery<HTMLElement>,
          } as ActorSheet<dnd5e.documents.Actor5e>;

          Hooks.callAll(hook, sheet, {} as JQuery<HTMLElement>);

          expect(element.children).toHaveLength(1);
          expect(section.children).toHaveLength(2);
          expect(expandable.children).toHaveLength(1);
          if (mode === 'list') {
            expect(list.children).toHaveLength(1);
            expect(list.children[0].tagName).toBe('FOOTER');
          } else {
            expect(list.children).toHaveLength(1);
            const grid = list.firstElementChild;
            expect(grid?.children).toHaveLength(1);
            expect(grid?.children[0].tagName).toBe('DIV');
          }
        });
      });
    });
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
        <div class="expandable">
          <div class="item-table-body">
            <div class="item-table-row-container" data-item-id="mock-item-a"></div>
            <div class="item-table-row-container" data-item-id="mock-item-b"></div>
            <div class="item-table-row-container" data-item-id="mock-item-c"></div>
            <div class="item-table-row-container" data-item-id="mock-item-d"></div>
          </div>
        </div>
      </section>`,
    ],
    [
      'grid',
      `<section class="item-table" data-tidy-sheet-part="item-table">
        <header class="item-table-header-row">
          <div class="item-table-column">Example (4)</div>
        </header>
        <div class="expandable">
          <div class="item-table-body">
            <div class="items">
              <button class="item" data-item-id="mock-item-a"></button>
              <button class="item" data-item-id="mock-item-b"></button>
              <button class="item" data-item-id="mock-item-c"></button>
              <button class="item" data-item-id="mock-item-d"></button>
            </div>
          </div>
        </div>
      </section>`,
    ],
  ])('Mode: %s (without footer)', (mode, html) => {
    describe.each(['renderActorSheet', 'tidy5e-sheet.renderActorSheet'] as const)('on %j', (hook) => {
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
          element.classList.add(sheetClass);
          element.innerHTML = html;

          // START Sanity check test data setup
          expect(element.children).toHaveLength(1);

          const section = element.firstElementChild!;
          expect(section.children).toHaveLength(2);
          expect(section.children[0].tagName).toBe('HEADER');
          expect(section.children[1].tagName).toBe('DIV');

          const expandable = section.children[1]!;
          expect(expandable.classList).toContain('expandable');
          expect(expandable.children).toHaveLength(1);

          const list = expandable.firstElementChild!;

          if (mode === 'list') {
            expect(list.children).toHaveLength(4);
            expect(list.children[0].tagName).toBe('DIV');
            expect(list.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
            expect(list.children[1].tagName).toBe('DIV');
            expect(list.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
            expect(list.children[2].tagName).toBe('DIV');
            expect(list.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
            expect(list.children[3].tagName).toBe('DIV');
            expect(list.children[3].getAttribute('data-item-id')).toBe('mock-item-d');
          } else {
            expect(list.children).toHaveLength(1);
            const grid = list.firstElementChild;
            expect(grid?.children).toHaveLength(4);
            expect(grid?.children[0].tagName).toBe('BUTTON');
            expect(grid?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
            expect(grid?.children[1].tagName).toBe('BUTTON');
            expect(grid?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
            expect(grid?.children[2].tagName).toBe('BUTTON');
            expect(grid?.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
            expect(grid?.children[3].tagName).toBe('BUTTON');
            expect(grid?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');
          }
          // END Sanity check test data setup

          const sheet = {
            actor,
            element: { get: (index: number) => (index === 0 ? element : undefined) } as JQuery<HTMLElement>,
          } as ActorSheet<dnd5e.documents.Actor5e>;

          Hooks.callAll(hook, sheet, {} as JQuery<HTMLElement>);

          expect(element.children).toHaveLength(1);
          expect(section.children).toHaveLength(2);
          expect(expandable.children).toHaveLength(1);
          if (mode === 'list') {
            expect(list.children).toHaveLength(4);
            expect(list.children[0].tagName).toBe('DIV');
            expect(list.children[0].getAttribute('data-item-id')).toBe('mock-item-c');
            expect(list.children[1].tagName).toBe('DIV');
            expect(list.children[1].getAttribute('data-item-id')).toBe('mock-item-a');
            expect(list.children[2].tagName).toBe('DIV');
            expect(list.children[2].getAttribute('data-item-id')).toBe('mock-item-b');
            expect(list.children[3].tagName).toBe('DIV');
            expect(list.children[3].getAttribute('data-item-id')).toBe('mock-item-d');
          } else {
            expect(list.children).toHaveLength(1);
            const grid = list.firstElementChild;
            expect(grid?.children).toHaveLength(4);
            expect(grid?.children[0].tagName).toBe('BUTTON');
            expect(grid?.children[0].getAttribute('data-item-id')).toBe('mock-item-c');
            expect(grid?.children[1].tagName).toBe('BUTTON');
            expect(grid?.children[1].getAttribute('data-item-id')).toBe('mock-item-a');
            expect(grid?.children[2].tagName).toBe('BUTTON');
            expect(grid?.children[2].getAttribute('data-item-id')).toBe('mock-item-b');
            expect(grid?.children[3].tagName).toBe('BUTTON');
            expect(grid?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');
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
          element.classList.add(sheetClass);
          element.innerHTML = html;

          // START Sanity check test data setup
          expect(element.children).toHaveLength(1);

          const section = element.firstElementChild!;
          expect(section.children).toHaveLength(2);
          expect(section.children[0].tagName).toBe('HEADER');
          expect(section.children[1].tagName).toBe('DIV');

          const expandable = section.children[1]!;
          expect(expandable.classList).toContain('expandable');
          expect(expandable.children).toHaveLength(1);

          const list = expandable.firstElementChild!;

          if (mode === 'list') {
            expect(list.children).toHaveLength(4);
            expect(list.children[0].tagName).toBe('DIV');
            expect(list.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
            expect(list.children[1].tagName).toBe('DIV');
            expect(list.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
            expect(list.children[2].tagName).toBe('DIV');
            expect(list.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
            expect(list.children[3].tagName).toBe('DIV');
            expect(list.children[3].getAttribute('data-item-id')).toBe('mock-item-d');
          } else {
            expect(list.children).toHaveLength(1);
            const grid = list.firstElementChild;
            expect(grid?.children).toHaveLength(4);
            expect(grid?.children[0].tagName).toBe('BUTTON');
            expect(grid?.children[0].getAttribute('data-item-id')).toBe('mock-item-a');
            expect(grid?.children[1].tagName).toBe('BUTTON');
            expect(grid?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
            expect(grid?.children[2].tagName).toBe('BUTTON');
            expect(grid?.children[2].getAttribute('data-item-id')).toBe('mock-item-c');
            expect(grid?.children[3].tagName).toBe('BUTTON');
            expect(grid?.children[3].getAttribute('data-item-id')).toBe('mock-item-d');
          }
          // END Sanity check test data setup

          const sheet = {
            actor,
            element: { get: (index: number) => (index === 0 ? element : undefined) } as JQuery<HTMLElement>,
          } as ActorSheet<dnd5e.documents.Actor5e>;

          Hooks.callAll(hook, sheet, {} as JQuery<HTMLElement>);

          expect(element.children).toHaveLength(1);
          expect(section.children).toHaveLength(2);
          expect(expandable.children).toHaveLength(1);
          if (mode === 'list') {
            expect(list.children).toHaveLength(4);
            expect(list.children[0].tagName).toBe('DIV');
            expect(list.children[0].getAttribute('data-item-id')).toBe('mock-item-d');
            expect(list.children[1].tagName).toBe('DIV');
            expect(list.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
            expect(list.children[2].tagName).toBe('DIV');
            expect(list.children[2].getAttribute('data-item-id')).toBe('mock-item-a');
            expect(list.children[3].tagName).toBe('DIV');
            expect(list.children[3].getAttribute('data-item-id')).toBe('mock-item-c');
          } else {
            expect(list.children).toHaveLength(1);
            const grid = list.firstElementChild;
            expect(grid?.children).toHaveLength(4);
            expect(grid?.children[0].tagName).toBe('BUTTON');
            expect(grid?.children[0].getAttribute('data-item-id')).toBe('mock-item-d');
            expect(grid?.children[1].tagName).toBe('BUTTON');
            expect(grid?.children[1].getAttribute('data-item-id')).toBe('mock-item-b');
            expect(grid?.children[2].tagName).toBe('BUTTON');
            expect(grid?.children[2].getAttribute('data-item-id')).toBe('mock-item-a');
            expect(grid?.children[3].tagName).toBe('BUTTON');
            expect(grid?.children[3].getAttribute('data-item-id')).toBe('mock-item-c');
          }
        });
      });
    });
  });
});
