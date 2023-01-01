type ItemSortDetails = {
  id: string
  group: string
  name: string
};

const compareStringCaseInsensitive = (strA: string, strB: string) => strA.localeCompare(strB, undefined, { sensitivity: 'base' });

const compareItemToSort = (itemA: ItemSortDetails, itemB: ItemSortDetails) => {
  let compare = compareStringCaseInsensitive(itemA.group, itemB.group);
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

const getFeatSubtype = (system: dnd5e.documents.ItemSystemData.Feat) => {
  let subtype: string;
  if (!system.activation || !system.activation.type) {
    // Passive feats
    subtype = 'passive';
  } else {
    // Active feats
    subtype = 'active';
  }
  return subtype;
};

const extractSortInformation = (items: foundry.utils.Collection<string, dnd5e.documents.Item5e>): ItemSortDetails[] => {
  if (!items) {
    return [];
  }
  const unsortedItems = items.map<ItemSortDetails>((item) => {
    const type = item.type;
    const name = item.name;
    let subtype: string | undefined;
    if (type === 'spell') {
      subtype = getSpellSubtype(item.system as dnd5e.documents.ItemSystemData.Spell);
    } else if (type === 'feat') {
      subtype = getFeatSubtype(item.system as dnd5e.documents.ItemSystemData.Feat);
    }
    return {
      id: item.id,
      group: subtype ? `${type}_${subtype}` : type,
      name: name,
    };
  });

  return unsortedItems.sort(compareItemToSort);
};

export default extractSortInformation;
