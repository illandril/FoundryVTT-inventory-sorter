function caseInsensitiveCompare(a, b) {
  return a.localeCompare(b, undefined, { sensitivity: 'base' });
}

function getItemsToSort(actor) {
  const itemsToSort = [];
  actor.data.items.forEach((item) => {
    const type = item.type;
    const name = item.name;
    let subtype = 0;
    if (type === 'spell') {
      const prepMode = item.data.preparation.mode;
      if (prepMode === 'atwill') {
        subtype = 10;
      } else if (prepMode === 'innate') {
        subtype = 11;
      } else if (prepMode === 'pact') {
        subtype = 12;
      } else {
        subtype = item.data.level;
      }
    } else if (type === 'feat') {
      if (item.data.activation.type === '') {
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

    const newSort = item.subtype * 1000 + nextSort;
    if (item.sort !== newSort) {
      itemUpdates.push({ _id: item._id, sort: newSort });
    }
  });
  if (itemUpdates.length > 0) {
    actor.updateOwnedItem(itemUpdates);
  }
}

Hooks.on('renderActorSheet5eCharacter', (actorSheet, html, data) => {
  sortItems(game.actors.get(data.actor._id));
});
