import { log } from './module.js';

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
  if (!actor) {
    return [];
  }
  return actor.items.map((item) => {
    const type = item.type;
    const name = item.name;
    let subtype = 0;
    if (type === 'spell') {
      const prepMode = item.preparation && item.preparation.mode;
      if (prepMode === 'atwill') {
        subtype = 10;
      } else if (prepMode === 'innate') {
        subtype = 11;
      } else if (prepMode === 'pact') {
        subtype = 12;
      } else {
        subtype = parseInt(item.level, 10) || 0;
      }
    } else if (type === 'feat') {
      if (!item.activation || item.activation.type === '') {
        // Passive feats
        subtype = 0;
      } else {
        // Active feats
        subtype = 1;
      }
    }
    return {
      id: item.id,
      type: type,
      subtype: subtype,
      name: name,
      sort: item.sort,
    };
  });
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

function getItemSorts(actor) {
  const sortedItems = getSortedItems(actor);
  const itemSorts = new Map();
  let nextSort = 0;
  let lastType = null;
  let lastSubType = null;
  for (const item of sortedItems) {
    if (item.type !== lastType || item.subtype !== lastSubType) {
      nextSort = 0;
    }
    nextSort++;
    lastType = item.type;
    lastSubType = item.subtype;

    const typeOffset = TYPE_OFFSETS[lastType] || TYPE_OFFSETS.UNKNOWN;
    const subtypeOffset = item.subtype * 1000;
    const newSort = typeOffset + subtypeOffset + nextSort;
    itemSorts.set(item.id, { _id: item.id, sort: newSort });
  }
  return itemSorts;
}

const sortedActors = new Set();

function sortItems(actor) {
  sortedActors.add(actor.id);
  const itemSorts = getItemSorts(actor);
  const itemUpdates = [];
  for (const itemSort of itemSorts.values()) {
    const item = actor.items.get(itemSort._id);
    if (item.sort !== itemSort.sort) {
      log.debug('item sort mismatch', { id: item.id, current: item.sort, new: itemSort.sort });
      itemUpdates.push(itemSort);
    }
  }
  if (itemUpdates.length > 0) {
    log.debug('Updating sort for items', itemUpdates)
    actor.updateEmbeddedDocuments('Item', itemUpdates, { illandrilInventorySorterUpdate: true });
  }
}

const pendingActorSorts = new Map();
function delayedSort(actor) {
  if(!actor) {
    return;
  }
  clearTimeout(pendingActorSorts.get(actor.id));
  pendingActorSorts.set(
    actor.id,
    setTimeout(() => sortItems(actor), 150)
  );
}

Hooks.on('preUpdateItem', (item, changes, options, ...args) => {
  if (changes.sort !== undefined) {
    if (!options.illandrilInventorySorterUpdate) {
      const itemSorts = getItemSorts(item.parent);
      const itemSort = itemSorts.get(changes._id);
      if(itemSort) {
        changes.sort = itemSort.sort;
      }
    }
    if (item.sort === changes.sort && Object.keys(changes).length === 2) {
      return false;
    }
  }
});

Hooks.on('createItem', (item, options, userId, ...args) => {
  if (userId === game.userId) {
    delayedSort(item.parent);
  }
});

Hooks.on('deleteItem', (item, options, userId, ...args) => {
  if (userId === game.userId) {
    delayedSort(item.parent);
  }
});

Hooks.on('updateItem', (item, changes, options, userId) => {
  if (userId === game.userId) {
    if (!options.illandrilInventorySorterUpdate) {
      delayedSort(item.parent);
    }
  }
});

Hooks.on('renderActorSheet', (actorSheet) => {
  if (actorSheet.isEditable) {
    const actor = actorSheet.actor;
    if (!sortedActors.has(actor.id)) {
      delayedSort(actor);
    }
  }
});
