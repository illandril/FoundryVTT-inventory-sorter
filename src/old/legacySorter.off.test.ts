import { ItemSort } from './calculateItemSorts';

let delayedActorSort: jest.SpiedFunction<typeof import('./delayedActorSort').default>;
let calculateItemSorts: jest.SpiedFunction<typeof import('./calculateItemSorts').default>;
let hasActorBeenSorted: jest.SpiedFunction<typeof import('./sortActorItems').hasActorBeenSorted>;

beforeAll(async () => {
  delayedActorSort = jest.spyOn(
    await import('./delayedActorSort'),
    'default',
  ).mockReturnValue();

  calculateItemSorts = jest.spyOn(
    await import('./calculateItemSorts'),
    'default',
  ).mockReturnValue(new Map());

  hasActorBeenSorted = jest.spyOn(
    await import('./sortActorItems'),
    'hasActorBeenSorted',
  ).mockReturnValue(false);

  SIMULATE.mockSavedSetting('illandril-inventory-sorter', 'enableLegacySorter', false);

  await import('./legacySorter');

  Hooks.callAll('init');
});

describe('renderActorSheet', () => {
  it('does not call delayedActorSort even if the actor has not been sorted', () => {
    hasActorBeenSorted.mockReturnValue(false);
    const actor = {};
    const actorSheet = {
      isEditable: true,
      actor,
    } as ActorSheet;
    const element = {} as JQuery;

    expect(delayedActorSort).not.toHaveBeenCalled();
    expect(hasActorBeenSorted).not.toHaveBeenCalled();

    Hooks.callAll('renderActorSheet', actorSheet, element);

    expect(delayedActorSort).not.toHaveBeenCalled();
    expect(hasActorBeenSorted).not.toHaveBeenCalled();
  });
});

describe.each(['createItem', 'deleteItem'] as const)('%s', (hookName) => {
  it('does not call delayedActorSort when changes are made by the current user', () => {
    const actor = {};
    const item = {
      actor,
    } as dnd5e.documents.Item5e;

    expect(delayedActorSort).not.toHaveBeenCalled();

    Hooks.callAll(hookName, item, {}, 'mock-user-id');

    expect(delayedActorSort).not.toHaveBeenCalled();
  });
});

describe('updateItem', () => {
  it('does not calls delayedActorSort when changes are made by the current user', () => {
    const actor = {};
    const item = {
      actor,
    } as dnd5e.documents.Item5e;

    expect(delayedActorSort).not.toHaveBeenCalled();

    Hooks.callAll('updateItem', item, {}, {}, 'mock-user-id');

    expect(delayedActorSort).not.toHaveBeenCalled();
  });
});

describe('preUpdateItem', () => {
  it('returns true without making changes even if the sort would be updated if legacy settings were on', () => {
    const actor = {};
    const item = {
      id: '1CtCRdorXj0Wv58v',
      actor,
      name: 'Alfa',
      sort: 20000,
    } as dnd5e.documents.Item5e;

    const changes = {
      _id: item.id,
      sort: 50000,
    };

    const mockCalculatedSorts = new Map<string, ItemSort>();
    mockCalculatedSorts.set('NQ2gQNYnrBrAx2qr', { _id: 'NQ2gQNYnrBrAx2qr', sort: 10000 });
    mockCalculatedSorts.set('h3g91xAHkTiYzW8T', { _id: 'h3g91xAHkTiYzW8T', sort: 20000 });
    mockCalculatedSorts.set(item.id, { _id: item.id, sort: 30000 });
    calculateItemSorts.mockReturnValue(mockCalculatedSorts);

    const value = Hooks.call('preUpdateItem', item, changes, {});

    expect(value).toBe(true);
    expect(calculateItemSorts).not.toHaveBeenCalled();
    expect(changes).toEqual({
      _id: '1CtCRdorXj0Wv58v',
      sort: 50000,
    });
  });

  it('returns true without making changes even if only sort changed and the fixed sort would have been the current sort and there are no other changes', () => {
    const actor = {};
    const item = {
      id: '1CtCRdorXj0Wv58v',
      actor,
      name: 'Alfa',
      sort: 30000,
    } as dnd5e.documents.Item5e;

    const changes = {
      _id: item.id,
      sort: 50000,
    };

    const mockCalculatedSorts = new Map<string, ItemSort>();
    mockCalculatedSorts.set('NQ2gQNYnrBrAx2qr', { _id: 'NQ2gQNYnrBrAx2qr', sort: 10000 });
    mockCalculatedSorts.set('h3g91xAHkTiYzW8T', { _id: 'h3g91xAHkTiYzW8T', sort: 20000 });
    mockCalculatedSorts.set(item.id, { _id: item.id, sort: 30000 });
    calculateItemSorts.mockReturnValue(mockCalculatedSorts);

    const value = Hooks.call('preUpdateItem', item, changes, {});

    expect(value).toBe(true);
    expect(calculateItemSorts).not.toHaveBeenCalled();
    expect(changes).toEqual({
      _id: '1CtCRdorXj0Wv58v',
      sort: 50000,
    });
  });
});
