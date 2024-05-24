import { LegacySortFeatsByRequirement } from '../settings';
import * as spells from '../tests/data/spells';
import { mockActor, mockItem } from '../tests/mockHelpers';
import calculateItemSorts from './calculateItemSorts';

beforeAll(() => {
  Hooks.callAll('init');
});

beforeEach(() => {
  LegacySortFeatsByRequirement.set(false);
});

describe('calculateItemSorts()', () => {
  it('returns an empty map for a null actor', () => {
    const itemSorts = calculateItemSorts(null);

    expect(itemSorts.size).toBe(0);
  });

  it('returns an empty map for an actor with no items', () => {
    const actor = mockActor([]);

    const itemSorts = calculateItemSorts(actor);

    expect(itemSorts.size).toBe(0);
  });

  it('returns an empty map for an actor with undefined items', () => {
    const actor = mockActor(undefined);

    const itemSorts = calculateItemSorts(actor);

    expect(itemSorts.size).toBe(0);
  });

  it('sorts an individual item correctly', () => {
    const actor = mockActor([
      mockItem({
        id: 'mock-item-a',
        name: 'Common Clothes',
        type: 'equipment',
        system: {},
      }),
    ]);

    const itemSorts = calculateItemSorts(actor);
    const sortValue = itemSorts.get('mock-item-a');

    expect(sortValue).toEqual({
      _id: 'mock-item-a',
      sort: 100000,
    });
  });

  describe.each([
    'background',
    'backpack',
    'class',
    'consumable',
    'equipment',
    'feat',
    'loot',
    'spell',
    'subclass',
    'tool',
    'weapon',
  ])('type=%s', (type) => {
    it('includes each item id as _id', () => {
      const actor = mockActor([
        mockItem({ id: '9i6tT2SYxq5Xegzu', name: 'Mock Item', type, system: {} }),
        mockItem({ id: 'WynbxDC89Wp0PODY', name: 'Mock Item', type, system: {} }),
        mockItem({ id: 'L1PmYKzM0AkYtFKB', name: 'Mock Item', type, system: {} }),
        mockItem({ id: 'TxjrqhRqn2861xv9', name: 'Mock Item', type, system: {} }),
        mockItem({ id: 'ZjSZ49o8HfrD71qM', name: 'Mock Item', type, system: {} }),
      ]);

      const itemSorts = calculateItemSorts(actor);

      expect(itemSorts.get('9i6tT2SYxq5Xegzu')?._id).toBe('9i6tT2SYxq5Xegzu');
      expect(itemSorts.get('WynbxDC89Wp0PODY')?._id).toBe('WynbxDC89Wp0PODY');
      expect(itemSorts.get('L1PmYKzM0AkYtFKB')?._id).toBe('L1PmYKzM0AkYtFKB');
      expect(itemSorts.get('TxjrqhRqn2861xv9')?._id).toBe('TxjrqhRqn2861xv9');
      expect(itemSorts.get('ZjSZ49o8HfrD71qM')?._id).toBe('ZjSZ49o8HfrD71qM');
    });

    it('sorts alphabetically, case-insensitive', () => {
      const actor = mockActor([
        mockItem({
          id: 'mock-item-a',
          name: 'bravo',
          type,
          system: {},
        }),
        mockItem({
          id: 'mock-item-b',
          name: 'Charlie',
          type,
          system: {},
        }),
        mockItem({
          id: 'mock-item-c',
          name: 'Alfa',
          type,
          system: {},
        }),
      ]);

      const itemSorts = calculateItemSorts(actor);

      expect(itemSorts.get('mock-item-a')?.sort).toBe(200000);
      expect(itemSorts.get('mock-item-b')?.sort).toBe(300000);
      expect(itemSorts.get('mock-item-c')?.sort).toBe(100000);
    });
  });

  it('sorts spells into groups correctly', () => {
    const actor = mockActor([
      mockItem(spells.acidArrow),
      mockItem(spells.acidSplash),
      mockItem(spells.animalFriendship),
      mockItem(spells.animalShapesAtWill),
      mockItem(spells.blindnessDeafnessPact),
      mockItem(spells.burningHands),
      mockItem(spells.calmEmotions),
      mockItem(spells.chillTouch),
      mockItem(spells.clairvoyanceInnate),
      mockItem(spells.darknessInnate),
      mockItem(spells.hellishRebukePact),
      mockItem(spells.polymorphAtWill),
    ]);

    const itemSorts = calculateItemSorts(actor);

    // At-Will
    expect(itemSorts.get(spells.animalShapesAtWill.id)?.sort).toBe(100000);
    expect(itemSorts.get(spells.polymorphAtWill.id)?.sort).toBe(200000);

    // Innate
    expect(itemSorts.get(spells.clairvoyanceInnate.id)?.sort).toBe(100000);
    expect(itemSorts.get(spells.darknessInnate.id)?.sort).toBe(200000);

    // Pact
    expect(itemSorts.get(spells.blindnessDeafnessPact.id)?.sort).toBe(100000);
    expect(itemSorts.get(spells.hellishRebukePact.id)?.sort).toBe(200000);

    // Cantrips
    expect(itemSorts.get(spells.acidSplash.id)?.sort).toBe(100000);
    expect(itemSorts.get(spells.chillTouch.id)?.sort).toBe(200000);

    // 1st Level
    expect(itemSorts.get(spells.animalFriendship.id)?.sort).toBe(100000);
    expect(itemSorts.get(spells.burningHands.id)?.sort).toBe(200000);

    // 2nd Level
    expect(itemSorts.get(spells.acidArrow.id)?.sort).toBe(100000);
    expect(itemSorts.get(spells.calmEmotions.id)?.sort).toBe(200000);

    expect(itemSorts.size).toBe(12);
  });

  it('sorts feats into groups correctly (SortFeatsByRequirement = false)', () => {
    LegacySortFeatsByRequirement.set(false);
    const actor = mockActor([
      mockItem({
        id: '9i6tT2SYxq5Xegzu',
        name: 'Breath Weapon',
        type: 'feat',
        system: {
          activation: {
            type: 'action',
          },
          requirements: 'Dragonborn',
        },
      }),
      mockItem({
        id: 'WynbxDC89Wp0PODY',
        name: 'Bardic Inspiration',
        type: 'feat',
        system: {
          activation: {
            type: 'bonus',
          },
          requirements: 'Bard 1',
        },
      }),
      mockItem({
        id: 'L1PmYKzM0AkYtFKB',
        name: 'Spellcasting (Bard)',
        type: 'feat',
        system: {
          activation: {
            type: '',
          },
          requirements: 'Bard 1',
        },
      }),
      mockItem({
        id: 'TxjrqhRqn2861xv9',
        name: 'Song of Rest',
        type: 'feat',
        system: {
          activation: {
            type: 'special',
          },
          requirements: 'Bard 2',
        },
      }),
      mockItem({
        id: 'ZjSZ49o8HfrD71qM',
        name: 'Bard College',
        type: 'feat',
        system: {
          activation: {
            type: undefined,
          },
          requirements: 'Bard 3',
        },
      }),
      mockItem({
        id: 'LIuSL9KNd9fP2gJ5',
        name: 'Expertise (Bard)',
        type: 'feat',
        system: {
          requirements: 'Bard 3',
        },
      }),
    ]);

    const itemSorts = calculateItemSorts(actor);

    // Active Abilities
    expect(itemSorts.get('WynbxDC89Wp0PODY')?.sort).toBe(100000); // Bardic Inspiration
    expect(itemSorts.get('9i6tT2SYxq5Xegzu')?.sort).toBe(200000); // Breath Weapon
    expect(itemSorts.get('TxjrqhRqn2861xv9')?.sort).toBe(300000); // Song of Rest

    // Passive Abilities
    expect(itemSorts.get('ZjSZ49o8HfrD71qM')?.sort).toBe(100000); // Bard College
    expect(itemSorts.get('LIuSL9KNd9fP2gJ5')?.sort).toBe(200000); // Expertise (Bard)
    expect(itemSorts.get('L1PmYKzM0AkYtFKB')?.sort).toBe(300000); // Spellcasting (Bard)

    expect(itemSorts.size).toBe(6);
  });

  it('sorts feats into groups correctly (SortFeatsByRequirement = true)', () => {
    LegacySortFeatsByRequirement.set(true);
    const actor = mockActor([
      mockItem({
        id: '9i6tT2SYxq5Xegzu',
        name: 'Breath Weapon',
        type: 'feat',
        system: {
          activation: {
            type: 'action',
          },
          requirements: 'Dragonborn',
        },
      }),
      mockItem({
        id: 'WynbxDC89Wp0PODY',
        name: 'Bardic Inspiration',
        type: 'feat',
        system: {
          activation: {
            type: 'bonus',
          },
          requirements: 'Bard 1',
        },
      }),
      mockItem({
        id: 'L1PmYKzM0AkYtFKB',
        name: 'Spellcasting (Bard)',
        type: 'feat',
        system: {
          activation: {
            type: '',
          },
          requirements: 'Bard 1',
        },
      }),
      mockItem({
        id: 'TxjrqhRqn2861xv9',
        name: 'Song of Rest',
        type: 'feat',
        system: {
          activation: {
            type: 'special',
          },
          requirements: 'Bard 2',
        },
      }),
      mockItem({
        id: 'ZjSZ49o8HfrD71qM',
        name: 'Bard College',
        type: 'feat',
        system: {
          activation: {
            type: undefined,
          },
          requirements: 'Bard 3',
        },
      }),
      mockItem({
        id: 'LIuSL9KNd9fP2gJ5',
        name: 'Expertise (Bard)',
        type: 'feat',
        system: {
          requirements: 'Bard 3',
        },
      }),
    ]);

    const itemSorts = calculateItemSorts(actor);

    // Active Abilities
    expect(itemSorts.get('WynbxDC89Wp0PODY')?.sort).toBe(100000); // (Bard 1) Bardic Inspiration
    expect(itemSorts.get('TxjrqhRqn2861xv9')?.sort).toBe(200000); // (Bard 2) Song of Rest
    expect(itemSorts.get('9i6tT2SYxq5Xegzu')?.sort).toBe(300000); // (Dragonborn) Breath Weapon

    // Passive Abilities
    expect(itemSorts.get('L1PmYKzM0AkYtFKB')?.sort).toBe(100000); // (Bard 1) Spellcasting (Bard)
    expect(itemSorts.get('ZjSZ49o8HfrD71qM')?.sort).toBe(200000); // (Bard 3) Bard College
    expect(itemSorts.get('LIuSL9KNd9fP2gJ5')?.sort).toBe(300000); // (Bard 3) Expertise (Bard)

    expect(itemSorts.size).toBe(6);
  });
});
