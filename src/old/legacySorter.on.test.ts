import type { ItemSort } from './calculateItemSorts';

let delayedActorSort: jest.SpiedFunction<typeof import('./delayedActorSort').default>;
let calculateItemSorts: jest.SpiedFunction<typeof import('./calculateItemSorts').default>;
let hasActorBeenSorted: jest.SpiedFunction<typeof import('./sortActorItems').hasActorBeenSorted>;
let LegacySortFeatsByRequirement: typeof import('../settings').LegacySortFeatsByRequirement;
let forEachOpenSheet: jest.SpiedFunction<typeof import('../forEachOpenSheet').default>;

beforeAll(async () => {
  delayedActorSort = jest.spyOn(await import('./delayedActorSort'), 'default').mockReturnValue();

  calculateItemSorts = jest.spyOn(await import('./calculateItemSorts'), 'default').mockReturnValue(new Map());

  hasActorBeenSorted = jest.spyOn(await import('./sortActorItems'), 'hasActorBeenSorted').mockReturnValue(false);

  forEachOpenSheet = jest.spyOn(await import('../forEachOpenSheet'), 'default').mockImplementation(() => undefined);

  SIMULATE.mockSavedSetting('illandril-inventory-sorter', 'enableLegacySorter', true);

  await import('./legacySorter');

  LegacySortFeatsByRequirement = (await import('../settings')).LegacySortFeatsByRequirement;

  Hooks.callAll('init');
});

beforeEach(() => {
  forEachOpenSheet.mockImplementation(() => undefined);
});

describe('renderActorSheet', () => {
  it('calls delayedActorSort if the actor has not been sorted', () => {
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

    expect(hasActorBeenSorted).toHaveBeenCalledTimes(1);
    expect(hasActorBeenSorted).toHaveBeenCalledWith(actor);
    expect(delayedActorSort).toHaveBeenCalledTimes(1);
    expect(delayedActorSort).toHaveBeenCalledWith(actor);
  });

  it('does not call delayedActorSort if the actor has been sorted', () => {
    hasActorBeenSorted.mockReturnValue(true);
    const actor = {};
    const actorSheet = {
      isEditable: true,
      actor,
    } as ActorSheet;
    const element = {} as JQuery;

    expect(delayedActorSort).not.toHaveBeenCalled();
    expect(hasActorBeenSorted).not.toHaveBeenCalled();

    Hooks.callAll('renderActorSheet', actorSheet, element);

    expect(hasActorBeenSorted).toHaveBeenCalledTimes(1);
    expect(hasActorBeenSorted).toHaveBeenCalledWith(actor);
    expect(delayedActorSort).not.toHaveBeenCalled();
  });

  it('does not call delayedActorSort if the actorSheet is not editable', () => {
    hasActorBeenSorted.mockReturnValue(false);
    const actor = {};
    const actorSheet = {
      isEditable: false,
      actor,
    } as ActorSheet;
    const element = {} as JQuery;

    Hooks.callAll('renderActorSheet', actorSheet, element);

    expect(delayedActorSort).not.toHaveBeenCalled();
    expect(hasActorBeenSorted).not.toHaveBeenCalled();
  });
});

describe.each(['createItem', 'deleteItem'] as const)('%s', (hookName) => {
  it('calls delayedActorSort with item.actor if the change was made by the current user', () => {
    const actor = {};
    const item = {
      actor,
    } as dnd5e.documents.Item5e;

    expect(delayedActorSort).not.toHaveBeenCalled();

    Hooks.callAll(hookName, item, {}, 'mock-user-id');

    expect(delayedActorSort).toHaveBeenCalledTimes(1);
    expect(delayedActorSort).toHaveBeenCalledWith(actor);
  });

  it('does not call delayedActorSort if the change was made by a different user', () => {
    const actor = {};
    const item = {
      actor,
    } as dnd5e.documents.Item5e;

    Hooks.callAll(hookName, item, {}, 'other-user-id');

    expect(delayedActorSort).not.toHaveBeenCalled();
  });
});

describe('updateItem', () => {
  it('calls delayedActorSort with item.actor if the change was made by the current user', () => {
    const actor = {};
    const item = {
      actor,
    } as dnd5e.documents.Item5e;

    expect(delayedActorSort).not.toHaveBeenCalled();

    Hooks.callAll('updateItem', item, {}, {}, 'mock-user-id');

    expect(delayedActorSort).toHaveBeenCalledTimes(1);
    expect(delayedActorSort).toHaveBeenCalledWith(actor);
  });

  it('does not call delayedActorSort if the change was made by a different user', () => {
    const actor = {};
    const item = {
      actor,
    } as dnd5e.documents.Item5e;

    Hooks.callAll('updateItem', item, {}, {}, 'other-user-id');

    expect(delayedActorSort).not.toHaveBeenCalled();
  });

  it('does not call delayedActorSort if the change was made by this module', () => {
    const actor = {};
    const item = {
      actor,
    } as dnd5e.documents.Item5e;

    expect(delayedActorSort).not.toHaveBeenCalled();

    Hooks.callAll('updateItem', item, {}, { illandrilInventorySorterUpdate: true }, 'mock-user-id');

    expect(delayedActorSort).not.toHaveBeenCalled();
  });
});

describe('preUpdateItem', () => {
  it('returns true if the changes have no sort', () => {
    const actor = {};
    const item = {
      id: '1CtCRdorXj0Wv58v',
      actor,
      name: 'Alfa',
      sort: 20000,
    } as dnd5e.documents.Item5e;

    const changes = {
      _id: '1CtCRdorXj0Wv58v',
      name: 'Bravo',
    };

    const value = Hooks.call('preUpdateItem', item, changes, {});

    expect(value).toBe(true);
    expect(calculateItemSorts).not.toHaveBeenCalled();
    expect(changes).toEqual({
      _id: '1CtCRdorXj0Wv58v',
      name: 'Bravo',
    });
  });

  it('logs an error and returns true if the change has no _id', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    const actor = {};
    const item = {
      id: '1CtCRdorXj0Wv58v',
      actor,
      name: 'Alfa',
      sort: 20000,
    } as dnd5e.documents.Item5e;

    const changes = {
      name: 'Bravo',
      sort: 50000,
    };

    const value = Hooks.call('preUpdateItem', item, changes, {});

    expect(value).toBe(true);
    expect(calculateItemSorts).not.toHaveBeenCalled();
    expect(changes).toEqual({
      name: 'Bravo',
      sort: 50000,
    });
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringMatching(/Illandril's Inventory Sorter/),
      expect.stringMatching(/background-color/),
      'preUpdateItem hook was called with no _id',
      changes,
    );
  });

  it('updates sort with value from calculateItemSorts', () => {
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
    expect(calculateItemSorts).toHaveBeenCalledWith(actor);
    expect(changes).toEqual({
      _id: '1CtCRdorXj0Wv58v',
      sort: 30000,
    });
  });

  it('does not update the sort if calculateItemSorts has no sort for the item', () => {
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
    mockCalculatedSorts.set('x04z5Jbbc6nxJkzK', { _id: 'x04z5Jbbc6nxJkzK', sort: 30000 });
    calculateItemSorts.mockReturnValue(mockCalculatedSorts);

    const value = Hooks.call('preUpdateItem', item, changes, {});

    expect(value).toBe(true);
    expect(calculateItemSorts).toHaveBeenCalledWith(actor);
    expect(changes).toEqual({
      _id: '1CtCRdorXj0Wv58v',
      sort: 50000,
    });
  });

  it('does not update the sort if the change was made by this module', () => {
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

    const value = Hooks.call('preUpdateItem', item, changes, { illandrilInventorySorterUpdate: true });

    expect(value).toBe(true);
    expect(changes).toEqual({
      _id: '1CtCRdorXj0Wv58v',
      sort: 50000,
    });
    expect(calculateItemSorts).not.toHaveBeenCalled();
  });

  it('returns true if the fixed sort is current sort and there are other changes', () => {
    const actor = {};
    const item = {
      id: '1CtCRdorXj0Wv58v',
      actor,
      name: 'Alfa',
      sort: 30000,
    } as dnd5e.documents.Item5e;

    const changes = {
      _id: item.id,
      name: 'Bravo',
      sort: 50000,
    };

    const mockCalculatedSorts = new Map<string, ItemSort>();
    mockCalculatedSorts.set('NQ2gQNYnrBrAx2qr', { _id: 'NQ2gQNYnrBrAx2qr', sort: 10000 });
    mockCalculatedSorts.set('h3g91xAHkTiYzW8T', { _id: 'h3g91xAHkTiYzW8T', sort: 20000 });
    mockCalculatedSorts.set(item.id, { _id: item.id, sort: 30000 });
    calculateItemSorts.mockReturnValue(mockCalculatedSorts);

    const value = Hooks.call('preUpdateItem', item, changes, {});

    expect(value).toBe(true);
    expect(calculateItemSorts).toHaveBeenCalledWith(actor);
    expect(changes).toEqual({
      _id: '1CtCRdorXj0Wv58v',
      name: 'Bravo',
      sort: 30000,
    });
  });

  it('returns false if the fixed sort is current sort and there are no other changes', () => {
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

    expect(value).toBe(false);
    expect(calculateItemSorts).toHaveBeenCalledWith(actor);
    expect(changes).toEqual({
      _id: '1CtCRdorXj0Wv58v',
      sort: 30000,
    });
  });
});

it('refreshes the sort on any open actor sheets when changing LegacySortFeatsByRequirement', () => {
  LegacySortFeatsByRequirement.set(false);

  const actor1 = {
    id: 'pb0HcmClJ3fSyy6k',
  } as dnd5e.documents.Actor5e;
  const actor2 = {
    id: 'Xa0NzE8I9oEtL4bb',
  } as dnd5e.documents.Actor5e;
  const actor3 = {
    id: '8yKqiQXRS2aoF5mM',
  } as dnd5e.documents.Actor5e;
  forEachOpenSheet.mockImplementation((callback) => {
    callback({
      isEditable: true,
      actor: actor1,
    } as ActorSheet<dnd5e.documents.Actor5e>);
    callback({
      isEditable: false,
      actor: actor2,
    } as ActorSheet<dnd5e.documents.Actor5e>);
    callback({
      isEditable: true,
      actor: actor3,
    } as ActorSheet<dnd5e.documents.Actor5e>);
  });

  expect(delayedActorSort).not.toHaveBeenCalled();
  expect(hasActorBeenSorted).not.toHaveBeenCalled();

  LegacySortFeatsByRequirement.set(true);

  expect(hasActorBeenSorted).toHaveBeenCalledTimes(2);
  expect(hasActorBeenSorted).toHaveBeenNthCalledWith(1, actor1);
  expect(hasActorBeenSorted).toHaveBeenNthCalledWith(2, actor3);
  expect(delayedActorSort).toHaveBeenCalledTimes(2);
  expect(delayedActorSort).toHaveBeenNthCalledWith(1, actor1);
  expect(delayedActorSort).toHaveBeenNthCalledWith(2, actor3);

  LegacySortFeatsByRequirement.set(false);

  expect(hasActorBeenSorted).toHaveBeenCalledTimes(4);
  expect(hasActorBeenSorted).toHaveBeenNthCalledWith(3, actor1);
  expect(hasActorBeenSorted).toHaveBeenNthCalledWith(4, actor3);
  expect(delayedActorSort).toHaveBeenCalledTimes(4);
  expect(delayedActorSort).toHaveBeenNthCalledWith(3, actor1);
  expect(delayedActorSort).toHaveBeenNthCalledWith(4, actor3);
});
