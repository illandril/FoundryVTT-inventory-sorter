import module from '../module';
import compareStringCaseInsensitive from './compareStringCaseInsensitive';

export const SortFeatsByRequirement = module.settings.register('sortFeatsByRequirement', Boolean, false, { hasHint: true });

type ItemSortDetails = {
  id: string
  group: string
  name: string
  alternateSort: string
};

const compareItemToSort = (itemA: ItemSortDetails, itemB: ItemSortDetails) => {
  let compare = compareStringCaseInsensitive(itemA.group, itemB.group);
  if (compare === 0) {
    compare = compareStringCaseInsensitive(itemA.alternateSort, itemB.alternateSort);
  }
  if (compare === 0) {
    compare = compareStringCaseInsensitive(itemA.name, itemB.name);
  }
  return compare;
};

const getSpellSubtype = (system: dnd5e.documents.ItemSystemData.Spell) => {
  const prepMode = system.preparation?.mode;
  let subtype: string;
  if (prepMode === 'atwill' || prepMode === 'innate' || prepMode === 'pact') {
    subtype = prepMode;
  } else {
    subtype = `${system.level || 0}`;
  }
  return subtype;
};

const getFeatSortDetails = (system: dnd5e.documents.ItemSystemData.Feat) => {
  let subtype: string;
  if (!system.activation || !system.activation.type) {
    // Passive feats
    subtype = 'passive';
  } else {
    // Active feats
    subtype = 'active';
  }
  let alternateSort: string | undefined;
  if (SortFeatsByRequirement.get()) {
    alternateSort = system.requirements;
  }
  return { subtype, alternateSort };
};

const extractSortInformation = (items: foundry.utils.Collection<string, dnd5e.documents.Item5e>): ItemSortDetails[] => {
  if (!items) {
    return [];
  }
  const unsortedItems = items.map<ItemSortDetails>((item) => {
    const type = item.type;
    const name = item.name;
    let subtype: string | undefined;
    let alternateSort: string | undefined;
    if (type === 'spell') {
      subtype = getSpellSubtype(item.system as dnd5e.documents.ItemSystemData.Spell);
    } else if (type === 'feat') {
      const featDetails = getFeatSortDetails(item.system as dnd5e.documents.ItemSystemData.Feat);
      subtype = featDetails.subtype;
      alternateSort = featDetails.alternateSort;
    }
    return {
      id: item.id,
      group: subtype ? `${type}_${subtype}` : type,
      name: name,
      alternateSort: alternateSort ?? '',
    };
  });

  return unsortedItems.sort(compareItemToSort);
};

export default extractSortInformation;
