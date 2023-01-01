import { ItemSort } from './sorter/calculateItemSorts';

let delayedActorSort: jest.SpiedFunction<typeof import('./sorter/delayedActorSort').default>;
let calculateItemSorts: jest.SpiedFunction<typeof import('./sorter/calculateItemSorts').default>;
let hasActorBeenSorted: jest.SpiedFunction<typeof import('./sorter/sortActorItems').hasActorBeenSorted>;
beforeEach(async () => {
  const delayedActorSortModule = await import('./sorter/delayedActorSort');
  delayedActorSort = jest.spyOn(delayedActorSortModule, 'default').mockImplementation();

  const calculateItemSortsModule = await import('./sorter/calculateItemSorts');
  calculateItemSorts = jest.spyOn(calculateItemSortsModule, 'default').mockImplementation();

  const sortActorItemsModule = await import('./sorter/sortActorItems');
  hasActorBeenSorted = jest.spyOn(sortActorItemsModule, 'hasActorBeenSorted').mockImplementation();

  await import('./index');
  jest.resetModules();
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

    expect(delayedActorSort).not.toBeCalled();
    expect(hasActorBeenSorted).not.toBeCalled();

    Hooks.callAll('renderActorSheet', actorSheet, element);

    expect(hasActorBeenSorted).toBeCalledTimes(1);
    expect(hasActorBeenSorted).toBeCalledWith(actor);
    expect(delayedActorSort).toBeCalledTimes(1);
    expect(delayedActorSort).toBeCalledWith(actor);
  });

  it('does not call delayedActorSort if the actor has been sorted', () => {
    hasActorBeenSorted.mockReturnValue(true);
    const actor = {};
    const actorSheet = {
      isEditable: true,
      actor,
    } as ActorSheet;
    const element = {} as JQuery;

    expect(delayedActorSort).not.toBeCalled();
    expect(hasActorBeenSorted).not.toBeCalled();

    Hooks.callAll('renderActorSheet', actorSheet, element);

    expect(hasActorBeenSorted).toBeCalledTimes(1);
    expect(hasActorBeenSorted).toBeCalledWith(actor);
    expect(delayedActorSort).not.toBeCalled();
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

    expect(delayedActorSort).not.toBeCalled();
    expect(hasActorBeenSorted).not.toBeCalled();
  });
});

describe.each(['createItem', 'deleteItem'] as const)('%s', (hookName) => {
  it('calls delayedActorSort with item.actor if the change was made by the current user', () => {
    const actor = {};
    const item = {
      actor,
    } as dnd5e.documents.Item5e;

    expect(delayedActorSort).not.toBeCalled();

    Hooks.callAll(hookName, item, {}, 'mock-user-id');

    expect(delayedActorSort).toBeCalledTimes(1);
    expect(delayedActorSort).toBeCalledWith(actor);
  });

  it('does not call delayedActorSort if the change was made by a different user', () => {
    const actor = {};
    const item = {
      actor,
    } as dnd5e.documents.Item5e;

    Hooks.callAll(hookName, item, {}, 'other-user-id');

    expect(delayedActorSort).not.toBeCalled();
  });
});

describe('updateItem', () => {
  it('calls delayedActorSort with item.actor if the change was made by the current user', () => {
    const actor = {};
    const item = {
      actor,
    } as dnd5e.documents.Item5e;

    expect(delayedActorSort).not.toBeCalled();

    Hooks.callAll('updateItem', item, {}, {}, 'mock-user-id');

    expect(delayedActorSort).toBeCalledTimes(1);
    expect(delayedActorSort).toBeCalledWith(actor);
  });

  it('does not call delayedActorSort if the change was made by a different user', () => {
    const actor = {};
    const item = {
      actor,
    } as dnd5e.documents.Item5e;

    Hooks.callAll('updateItem', item, {}, {}, 'other-user-id');

    expect(delayedActorSort).not.toBeCalled();
  });

  it('does not call delayedActorSort if the change was made by this module', () => {
    const actor = {};
    const item = {
      actor,
    } as dnd5e.documents.Item5e;

    expect(delayedActorSort).not.toBeCalled();

    Hooks.callAll('updateItem', item, {}, { illandrilInventorySorterUpdate: true }, 'mock-user-id');

    expect(delayedActorSort).not.toBeCalled();
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
    expect(calculateItemSorts).not.toBeCalled();
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
    expect(calculateItemSorts).not.toBeCalled();
    expect(changes).toEqual({
      name: 'Bravo',
      sort: 50000,
    });
    expect(errorSpy).toBeCalledTimes(1);
    expect(errorSpy).toBeCalledWith(
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
    expect(calculateItemSorts).toBeCalledWith(actor);
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
    expect(calculateItemSorts).toBeCalledWith(actor);
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
    expect(calculateItemSorts).not.toBeCalled();
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
    expect(calculateItemSorts).toBeCalledWith(actor);
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
    expect(calculateItemSorts).toBeCalledWith(actor);
    expect(changes).toEqual({
      _id: '1CtCRdorXj0Wv58v',
      sort: 30000,
    });
  });
});
