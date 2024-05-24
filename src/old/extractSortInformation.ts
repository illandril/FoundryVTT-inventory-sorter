import { LegacySortFeatsByRequirement } from '../settings';
import sortItems, { type ItemSortDetails, type SortedItemDetails } from './sortItems';

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
  if (LegacySortFeatsByRequirement.get()) {
    alternateSort = system.requirements;
  }
  return { subtype, alternateSort };
};

const extractSortInformation = (
  items: foundry.utils.Collection<string, dnd5e.documents.Item5e>,
): SortedItemDetails[] => {
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

  return sortItems(unsortedItems);
};

export default extractSortInformation;
