import getTypedActor from './getTypedActor';
import module from './module';
import calculateItemSorts from './sorter/calculateItemSorts';
import delayedActorSort from './sorter/delayedActorSort';
import { hasActorBeenSorted } from './sorter/sortActorItems';

const onItemChange = (item: Item, userId: string) => {
  // If the user made a change to an item, it could mean the sorting for
  // the entire actor might be invalid. Recalculate the sorts.
  if (userId === game.userId) {
    delayedActorSort(getTypedActor(item));
  }
};

Hooks.on('renderActorSheet', (actorSheet) => {
  // The user opened an actor sheet - if it is editable, and we haven't already sorted
  // the actor, then we should sort it now so the user sees the sorted items.
  if (actorSheet.isEditable) {
    const actor = actorSheet.actor as dnd5e.documents.Actor5e;
    if (!hasActorBeenSorted(actor)) {
      delayedActorSort(actor);
    }
  }
});

Hooks.on('createItem', (item, _options, userId) => onItemChange(item, userId));
Hooks.on('deleteItem', (item, _options, userId) => onItemChange(item, userId));
Hooks.on('updateItem', (item, _changes, options, userId) => {
  if (!options.illandrilInventorySorterUpdate) {
    onItemChange(item, userId);
  }
});

Hooks.on('preUpdateItem', (item, changes, options) => {
  if (changes.sort === undefined) {
    // sort isn't changing - nothing for us to do
    return true;
  }
  if (changes._id === undefined) {
    // No _id... so we can't check the sort (if this happens, it probably means)
    module.logger.error('preUpdateItem hook was called with no _id', changes);
    return true;
  }

  if (!options.illandrilInventorySorterUpdate) {
    // It wasn't us making the change - calculate what the sort should be,
    // and update changes with the calculated sort
    const itemSorts = calculateItemSorts(getTypedActor(item));
    const itemSort = itemSorts.get(changes._id);
    if (itemSort) {
      changes.sort = itemSort.sort;
    }
  }

  if (item.sort === changes.sort && Object.keys(changes).length === 2) {
    // Only sort is changing, and it is already where we want it - stop the update from happening
    return false;
  }

  // We've fixed the changes (if necessary) - let the update happen
  return true;
});
