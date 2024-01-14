import { mockActor, mockItem } from '../tests/mockHelpers';
import { ItemSort } from './calculateItemSorts';

let sortActorItems: typeof import('./sortActorItems').default;
let hasActorBeenSorted: typeof import('./sortActorItems').hasActorBeenSorted;
let calculateItemSorts: jest.SpiedFunction<typeof import('./calculateItemSorts').default>;
beforeEach(async () => {
  const calculateItemSortsModule = await import('./calculateItemSorts');
  calculateItemSorts = jest.spyOn(calculateItemSortsModule, 'default').mockImplementation(() => new Map());

  const sortActorItemsModule = await import('./sortActorItems');
  sortActorItems = sortActorItemsModule.default;
  hasActorBeenSorted = sortActorItemsModule.hasActorBeenSorted;

  jest.resetModules();
});

describe('sortActorItems()', () => {
  it('causes hasActorBeenSorted to return true after sorting', async () => {
    const actor = mockActor(undefined, { id: 'Y2QQKpkeZCHalka0' });
    const actorSecondInstance = mockActor(undefined, { id: 'Y2QQKpkeZCHalka0' });

    expect(hasActorBeenSorted(actor)).toBe(false);
    expect(hasActorBeenSorted(actorSecondInstance)).toBe(false);

    await sortActorItems(actor);

    expect(hasActorBeenSorted(actor)).toBe(true);
    expect(hasActorBeenSorted(actorSecondInstance)).toBe(true);
  });

  it('calls updateEmbeddedDocuments with changes only', async () => {
    const mockCalculatedItemSorts = new Map<string, ItemSort>();
    mockCalculatedItemSorts.set('9i6tT2SYxq5Xegzu', { _id: '9i6tT2SYxq5Xegzu', sort: 10000 });
    mockCalculatedItemSorts.set('WynbxDC89Wp0PODY', { _id: 'WynbxDC89Wp0PODY', sort: 30000 });
    mockCalculatedItemSorts.set('L1PmYKzM0AkYtFKB', { _id: 'L1PmYKzM0AkYtFKB', sort: 20000 });
    calculateItemSorts.mockReturnValue(mockCalculatedItemSorts);

    const updateEmbeddedDocuments = jest.fn<Promise<unknown>, unknown[]>().mockResolvedValue(undefined);
    const actor = mockActor([
      mockItem({ id: '9i6tT2SYxq5Xegzu', sort: 10000, name: 'A', type: 'feat', system: {} }),
      mockItem({ id: 'WynbxDC89Wp0PODY', sort: 20000, name: 'C', type: 'feat', system: {} }),
      mockItem({ id: 'L1PmYKzM0AkYtFKB', sort: 30000, name: 'B', type: 'feat', system: {} }),
    ], {
      id: 'Y2QQKpkeZCHalka0',
      updateEmbeddedDocuments,
    });

    await sortActorItems(actor);

    expect(updateEmbeddedDocuments).toHaveBeenCalledTimes(1);
    expect(updateEmbeddedDocuments).toHaveBeenCalledWith('Item', expect.any(Array), {
      illandrilInventorySorterUpdate: true,
    });
    expect(updateEmbeddedDocuments.mock.calls[0][1]).toHaveLength(2);
    expect(updateEmbeddedDocuments.mock.calls[0][1]).toEqual(expect.arrayContaining([
      { _id: 'L1PmYKzM0AkYtFKB', sort: 20000 },
      { _id: 'WynbxDC89Wp0PODY', sort: 30000 },
    ]));
  });

  it('does not call updateEmbeddedDocuments if there are no changes', async () => {
    const mockCalculatedItemSorts = new Map<string, ItemSort>();
    mockCalculatedItemSorts.set('9i6tT2SYxq5Xegzu', { _id: '9i6tT2SYxq5Xegzu', sort: 10000 });
    mockCalculatedItemSorts.set('WynbxDC89Wp0PODY', { _id: 'WynbxDC89Wp0PODY', sort: 30000 });
    mockCalculatedItemSorts.set('L1PmYKzM0AkYtFKB', { _id: 'L1PmYKzM0AkYtFKB', sort: 20000 });
    calculateItemSorts.mockReturnValue(mockCalculatedItemSorts);

    const updateEmbeddedDocuments = jest.fn<Promise<unknown>, unknown[]>().mockResolvedValue(undefined);
    const actor = mockActor([
      mockItem({ id: '9i6tT2SYxq5Xegzu', sort: 10000, name: 'A', type: 'feat', system: {} }),
      mockItem({ id: 'WynbxDC89Wp0PODY', sort: 30000, name: 'C', type: 'feat', system: {} }),
      mockItem({ id: 'L1PmYKzM0AkYtFKB', sort: 20000, name: 'B', type: 'feat', system: {} }),
    ], {
      id: 'Y2QQKpkeZCHalka0',
      updateEmbeddedDocuments,
    });

    await sortActorItems(actor);

    expect(updateEmbeddedDocuments).not.toHaveBeenCalled();
  });

  it('logs an error if updateEmbeddedDocuments throws', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    const mockCalculatedItemSorts = new Map<string, ItemSort>();
    mockCalculatedItemSorts.set('9i6tT2SYxq5Xegzu', { _id: '9i6tT2SYxq5Xegzu', sort: 10000 });
    mockCalculatedItemSorts.set('WynbxDC89Wp0PODY', { _id: 'WynbxDC89Wp0PODY', sort: 30000 });
    mockCalculatedItemSorts.set('L1PmYKzM0AkYtFKB', { _id: 'L1PmYKzM0AkYtFKB', sort: 20000 });
    calculateItemSorts.mockReturnValue(mockCalculatedItemSorts);

    const updateEmbeddedDocuments = jest.fn<Promise<unknown>, unknown[]>().mockRejectedValue('mock rejection');
    const actor = mockActor([
      mockItem({ id: '9i6tT2SYxq5Xegzu', sort: 10000, name: 'A', type: 'feat', system: {} }),
      mockItem({ id: 'WynbxDC89Wp0PODY', sort: 20000, name: 'C', type: 'feat', system: {} }),
      mockItem({ id: 'L1PmYKzM0AkYtFKB', sort: 30000, name: 'B', type: 'feat', system: {} }),
    ], {
      id: 'Y2QQKpkeZCHalka0',
      updateEmbeddedDocuments,
    });

    await sortActorItems(actor);

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringMatching(/Illandril's Inventory Sorter/),
      expect.stringMatching(/background-color/),
      'Error updating items for actor',
      'Y2QQKpkeZCHalka0',
      'mock rejection',
    );
  });
});
