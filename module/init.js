function caseInsensitiveCompare(a, b) {
  return a.localeCompare(b, undefined, { sensitivity: 'base' });
}

const TYPE_OFFSETS = {
  class: 0,
  feat: 100,
  weapon: 1000,
  equipment: 2000,
  consumable: 3000,
  tool: 4000,
  backpack: 5000,
  loot: 6000,
  spell: 10000,
  UNKNOWN: 20000,
};

function getItemsToSort(actor) {
  if (!actor || !actor.data) {
    return [];
  }
  const itemsToSort = [];
  actor.data.items.forEach((item) => {
    const type = item.type;
    const name = item.name;
    let subtype = 0;
    if (type === 'spell') {
      const prepMode = item.data.preparation && item.data.preparation.mode;
      if (prepMode === 'atwill') {
        subtype = 10;
      } else if (prepMode === 'innate') {
        subtype = 11;
      } else if (prepMode === 'pact') {
        subtype = 12;
      } else {
        subtype = parseInt(item.data.level, 10) || 0;
      }
    } else if (type === 'feat') {
      if (!item.data.activation || item.data.activation.type === '') {
        // Passive feats
        subtype = 0;
      } else {
        // Active feats
        subtype = 1;
      }
    }
    itemsToSort.push({
      _id: item._id,
      type: type,
      subtype: subtype,
      name: name,
      sort: item.sort,
    });
  });
  return itemsToSort;
}

function getSortedItems(actor) {
  const itemsToSort = getItemsToSort(actor);
  itemsToSort.sort((a, b) => {
    const typeCompare = caseInsensitiveCompare(a.type, b.type);
    if (typeCompare !== 0) {
      return typeCompare;
    }
    const subtypeCompare = a.subtype - b.subtype;
    if (subtypeCompare !== 0) {
      return subtypeCompare;
    }
    return caseInsensitiveCompare(a.name, b.name);
  });
  return itemsToSort;
}

function sortItems(actor) {
  const sortedItems = getSortedItems(actor);
  let itemUpdates = [];
  let nextSort = 0;
  let lastType = null;
  let lastSubType = null;
  sortedItems.forEach((item) => {
    if (item.type !== lastType || item.subtype !== lastSubType) {
      nextSort = 0;
    }
    nextSort++;
    lastType = item.type;
    lastSubType = item.subtype;

    const typeOffset = TYPE_OFFSETS[lastType] || TYPE_OFFSETS.UNKNOWN;
    const subtypeOffset = item.subtype * 1000;
    const newSort = typeOffset + subtypeOffset + nextSort;
    if (item.sort !== newSort) {
      itemUpdates.push({ _id: item._id, sort: newSort });
    }
  });
  if (itemUpdates.length > 0) {
    actor.updateOwnedItem(itemUpdates);
  }
}

const sortItemsDebounced = debounce(sortItems, 200)

Hooks.on('renderActorSheet', (actorSheet, html, data) => {
  sortItemsDebounced(actorSheet.actor);
});
