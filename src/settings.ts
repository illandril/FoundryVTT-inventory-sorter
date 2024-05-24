import module from './module';

const callbacks: (() => void)[] = [];
export const registerSettingCallback = (callback: () => void) => {
  callbacks.push(callback);
};

const legacyCallbacks: (() => void)[] = [];
export const registerLegacySettingCallback = (callback: () => void) => {
  legacyCallbacks.push(callback);
};
const onChange = () => {
  for (const callback of callbacks) {
    callback();
  }
};
const onChangeLegacy = () => {
  for (const callback of legacyCallbacks) {
    callback();
  }
};

const NAME = 'name';
type Name = typeof NAME;

const NONE = 'none';
type None = typeof NONE;

const DEFAULT = 'default';
type Default = typeof DEFAULT;

const inventorySortOptions = ['weight', 'totalWeight', 'quantity', 'usage'] as const;
type InventorySortOption = (typeof inventorySortOptions)[number];

const featureOtherSortOptions = ['requirements', 'usage'] as const;
type FeatureOtherSortOption = (typeof featureOtherSortOptions)[number];

const spellSortOptions = ['usage', 'school', 'target'] as const;
type SpellSortOption = (typeof spellSortOptions)[number];

type ItemSortOption = InventorySortOption | FeatureOtherSortOption | SpellSortOption;

type SortDirection = 'asc' | 'desc';
type SortOption<T extends string> = `${T}_${SortDirection}`;
type FallbackGetter<T extends ItemSortOption> = () => SortOption<T | Name> | None;
type FallbackSetter<T extends ItemSortOption> = (value: SortOption<T | Name> | None) => void;
type SpecificGetter<T extends ItemSortOption> = () => SortOption<T | Name> | None | Default;
type SpecificSetter<T extends ItemSortOption> = (value: SortOption<T | Name> | None | Default) => void;
type NormalizedValue<T extends ItemSortOption> = { column: T | Name; isDesc: boolean } | null;
type FallbackSetting<T extends ItemSortOption> = {
  type: string;
  choices: readonly T[];
  primary: FallbackGetter<T>;
  setPrimary: FallbackSetter<T>;
  secondary: FallbackGetter<T>;
  setSecondary: FallbackSetter<T>;
};

export type FallbackAsSpecificSetting<T extends ItemSortOption> = {
  primary: () => NormalizedValue<T>;
  setPrimary: FallbackSetter<T>;
  secondary: () => NormalizedValue<T>;
  setSecondary: FallbackSetter<T>;
};

export type SpecificSetting<T extends ItemSortOption> = {
  primary: () => NormalizedValue<T>;
  setPrimary: SpecificSetter<T>;
  secondary: () => NormalizedValue<T>;
  setSecondary: SpecificSetter<T>;
};

export type AnyItemSortOption = NormalizedValue<ItemSortOption>;

const normalize = <T extends ItemSortOption>(value: SortOption<T | Name> | None): NormalizedValue<T> => {
  if (value === NONE) {
    return null;
  }
  const [column, direction] = value.split('_') as [T | Name, SortDirection];
  return { column, isDesc: direction === 'desc' };
};

const getOrDefault = <T extends ItemSortOption>(
  get: SpecificGetter<T>,
  getFallback: FallbackGetter<T>,
): NormalizedValue<T> => {
  let value = get();
  if (value === DEFAULT) {
    value = getFallback();
  }
  return normalize<T>(value);
};

const normalizeChoices = <T extends string>(choicesArray: readonly T[]) => {
  // const entries = choicesArray.map((choice) => [choice, () => module.localize(`setting.sort.choice.${choice}`)] as const);
  const entries = [NAME, ...choicesArray].flatMap(
    (choice) =>
      [
        [`${choice}_asc`, `${module.id}.setting.sort.choice.${choice}_asc`],
        [`${choice}_desc`, `${module.id}.setting.sort.choice.${choice}_desc`],
      ] as const,
  );
  entries.push();

  return Object.fromEntries([[NONE, `${module.id}.setting.sort.choice.${NONE}`], ...entries]) as Record<
    `${T | Name}_${'asc' | 'desc'}` | None,
    string
  >;
};

const getFallbackSetting = <T extends ItemSortOption>(
  type: string,
  uniqueChoices: readonly T[],
): FallbackSetting<T> => {
  const choices = normalizeChoices(uniqueChoices);
  const primary = module.settings.register<SortOption<T | Name> | None>(
    `sort${type}FallbackPrimary`,
    String,
    `${NAME}_asc`,
    {
      scope: 'client',
      hasHint: true,
      choices,
      onChange,
    },
  );
  const secondary = module.settings.register<SortOption<T | Name> | None>(
    `sort${type}FallbackSecondary`,
    String,
    NONE,
    {
      scope: 'client',
      hasHint: true,
      choices,
      onChange,
    },
  );

  return {
    type,
    choices: uniqueChoices,
    setPrimary: primary.set,
    primary: primary.get,
    setSecondary: secondary.set,
    secondary: secondary.get,
  };
};

const getSpecificSettingPlus = <T extends ItemSortOption, E extends ItemSortOption>(
  category: string,
  fallback: FallbackSetting<T>,
  extra: readonly E[],
): SpecificSetting<T | E> => {
  const choices = {
    [DEFAULT]: `${module.id}.setting.sort.choice.default`,
    ...normalizeChoices([...extra, ...fallback.choices]),
  };
  const primary = module.settings.register<SortOption<T | E | Name> | None | Default>(
    `sort${fallback.type}${category}Primary`,
    String,
    DEFAULT,
    {
      scope: 'client',
      choices,
      onChange,
    },
  );
  const secondary = module.settings.register<SortOption<T | E | Name> | None | Default>(
    `sort${fallback.type}${category}Secondary`,
    String,
    DEFAULT,
    {
      scope: 'client',
      choices,
      onChange,
    },
  );

  return {
    setPrimary: primary.set,
    primary: () => getOrDefault<T | E>(primary.get, fallback.primary),
    setSecondary: secondary.set,
    secondary: () => getOrDefault<T | E>(secondary.get, fallback.secondary),
  };
};

const getSpecificSetting = <T extends ItemSortOption>(
  category: string,
  fallback: FallbackSetting<T>,
): SpecificSetting<T> => {
  return getSpecificSettingPlus(category, fallback, []);
};

const asSpecificSetting = <T extends ItemSortOption>(fallback: FallbackSetting<T>): FallbackAsSpecificSetting<T> => {
  return {
    setPrimary: (value) => {
      fallback.setPrimary(value);
    },
    primary: () => normalize<T>(fallback.primary()),
    setSecondary: (value) => {
      fallback.setSecondary(value);
    },
    secondary: () => normalize<T>(fallback.secondary()),
  };
};

export const InventoryFallback = getFallbackSetting('Inventory', inventorySortOptions);
const weapon = getSpecificSetting('Weapons', InventoryFallback);
const equipment = getSpecificSetting('Equipment', InventoryFallback);
const consumable = getSpecificSetting('Consumables', InventoryFallback);
const tool = getSpecificSetting('Tools', InventoryFallback);
const backpack = getSpecificSetting('Backpacks', InventoryFallback);
const loot = getSpecificSetting('Loot', InventoryFallback);

export const FeatureFallback = getFallbackSetting('Features', []);
const race = getSpecificSetting('Race', FeatureFallback);
const background = getSpecificSetting('Background', FeatureFallback);
const classAndSubclass = getSpecificSetting('Class', FeatureFallback);
const feat = getSpecificSettingPlus('Other', FeatureFallback, featureOtherSortOptions);

const spell = asSpecificSetting(getFallbackSetting('Spells', spellSortOptions));

export const typeBasedSorting = {
  base: undefined, // Not expected to actually be used anywhere

  weapon,
  equipment,
  consumable,
  tool,
  backpack,
  loot,

  race,
  background,
  class: classAndSubclass,
  subclass: classAndSubclass,
  feat,

  spell,
} satisfies Readonly<
  Record<
    dnd5e.documents.Item5e['type'],
    | SpecificSetting<InventorySortOption>
    | SpecificSetting<never>
    | SpecificSetting<FeatureOtherSortOption>
    | FallbackAsSpecificSetting<SpellSortOption>
    | undefined
  >
>;

export const EnableLegacySorter = module.settings.register('enableLegacySorter', Boolean, false, {
  hasHint: true,
  onChange: () => {
    onChange();
    onChangeLegacy();
  },
});
export const LegacySortFeatsByRequirement = module.settings.register('sortFeatsByRequirement', Boolean, false, {
  hasHint: true,
  onChange: onChangeLegacy,
});
