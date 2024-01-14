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
type NAME = typeof NAME;

const NONE = 'none';
type NONE = typeof NONE;

type UniversalOption = NAME | NONE;

const DEFAULT = 'default';
type DEFAULT = typeof DEFAULT;


const inventorySortOptions = ['weight', 'quantity', 'usage'] as const;
type InventorySortOption = typeof inventorySortOptions[number];

const featureOtherSortOptions = ['requirements', 'usage'] as const;
type FeatureOtherSortOption = typeof featureOtherSortOptions[number];

const spellSortOptions = ['usage', 'school', 'target'] as const;
type SpellSortOption = typeof spellSortOptions[number];

type ItemSortOption = InventorySortOption | FeatureOtherSortOption | SpellSortOption;

type FallbackGetter<T extends ItemSortOption> = () => T | UniversalOption;
type SpecificGetter<T extends ItemSortOption> = () => T | UniversalOption | DEFAULT;
type NormalizedValue<T extends ItemSortOption> = T | Exclude<UniversalOption, NONE> | null;
type FallbackSetting<T extends ItemSortOption> = {
  type: string
  choices: readonly (T | UniversalOption)[]
  primary: FallbackGetter<T>
  secondary: FallbackGetter<T>
};

type SpecificSetting<T extends ItemSortOption> = {
  primary: () => NormalizedValue<T>
  secondary: () => NormalizedValue<T>
};

export type AnyItemSortOption = NormalizedValue<ItemSortOption>;

const normalize = <T extends ItemSortOption>(value: T | UniversalOption): NormalizedValue<T> => {
  if (value === NONE) {
    return null;
  }
  return value;
};

const getOrDefault = <T extends ItemSortOption>(get: SpecificGetter<T>, getFallback: FallbackGetter<T>): NormalizedValue<T> => {
  let value = get();
  if (value === DEFAULT) {
    value = getFallback();
  }
  return normalize(value);
};

const normalizeChoices = <T extends string>(choicesArray: readonly T[]) => {
  // const entries = choicesArray.map((choice) => [choice, () => module.localize(`setting.sort.choice.${choice}`)] as const);
  const entries = choicesArray.map((choice) => [choice, `${module.id}.setting.sort.choice.${choice}`] as const);
  return Object.fromEntries(entries) as Record<T, string>;
};

const getFallbackSetting = <T extends ItemSortOption>(type: string, uniqueChoices: readonly T[]): FallbackSetting<T> => {
  const choicesArray = [NAME, ...uniqueChoices, NONE] as const;
  const choices = normalizeChoices(choicesArray);
  const primary = module.settings.register<T | UniversalOption>(`sort${type}FallbackPrimary`, String, NAME, {
    hasHint: true,
    choices,
    onChange,
  });
  const secondary = module.settings.register<T | UniversalOption>(`sort${type}FallbackSecondary`, String, NONE, {
    hasHint: true,
    choices,
    onChange,
  });

  return {
    type,
    choices: choicesArray,
    primary: () => primary.get(),
    secondary: () => secondary.get(),
  };
};

const getSpecificSettingPlus = <T extends ItemSortOption, E extends ItemSortOption>(category: string, fallback: FallbackSetting<T>, extra: readonly E[]): SpecificSetting<T | E> => {
  const choices = normalizeChoices([DEFAULT, NAME, ...extra, ...fallback.choices.filter((choice) => choice !== NAME)]);
  const primary = module.settings.register<T | E | UniversalOption | DEFAULT>(`sort${fallback.type}${category}Primary`, String, DEFAULT, {
    choices,
    onChange,
  });
  const secondary = module.settings.register<T | E | UniversalOption | DEFAULT>(`sort${fallback.type}${category}Secondary`, String, DEFAULT, {
    choices,
    onChange,
  });

  return {
    primary: () => getOrDefault<T | E>(primary.get, fallback.primary),
    secondary: () => getOrDefault<T | E>(secondary.get, fallback.secondary),
  };
};

const getSpecificSetting = <T extends ItemSortOption>(category: string, fallback: FallbackSetting<T>): SpecificSetting<T> => {
  return getSpecificSettingPlus(category, fallback, []);
};

const asSpecificSetting = <T extends ItemSortOption>(fallback: FallbackSetting<T>): SpecificSetting<T> => {
  return {
    primary: () => normalize(fallback.primary()),
    secondary: () => normalize(fallback.secondary()),
  };
};


const InventoryFallback = getFallbackSetting('Inventory', inventorySortOptions);
const weapon = getSpecificSetting('Weapons', InventoryFallback);
const equipment = getSpecificSetting('Equipment', InventoryFallback);
const consumable = getSpecificSetting('Consumables', InventoryFallback);
const tool = getSpecificSetting('Tools', InventoryFallback);
const backpack = getSpecificSetting('Backpacks', InventoryFallback);
const loot = getSpecificSetting('Loot', InventoryFallback);

const FeatureFallback = getFallbackSetting('Features', []);
const race = getSpecificSetting('Race', FeatureFallback);
const background = getSpecificSetting('Background', FeatureFallback);
const classAndSubclass = getSpecificSetting('Class', FeatureFallback);
const feat = getSpecificSettingPlus('Other', FeatureFallback, featureOtherSortOptions);

const spell = asSpecificSetting(getFallbackSetting('Spells', spellSortOptions));

export const typeBasedSorting: Readonly<Record<dnd5e.documents.Item5e['type'], SpecificSetting<ItemSortOption> | undefined>> = {
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
};

export const EnableLegacySorter = module.settings.register('enableLegacySorter', Boolean, false, { hasHint: true, onChange: () => {
  onChange();
  onChangeLegacy();
} });
export const LegacySortFeatsByRequirement = module.settings.register('sortFeatsByRequirement', Boolean, false, { hasHint: true, onChange: onChangeLegacy });
