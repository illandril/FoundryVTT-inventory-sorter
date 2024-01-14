import collator from '../collator';
import module from '../module';
import { EnableLegacySorter, registerSettingCallback } from '../settings';
import decorators from './decorators';

const sortSheet = (sheet: ActorSheet<dnd5e.documents.Actor5e>) => {
  const sheetElem = sheet.element[0];
  const actor = sheet.actor;
  if (!sheetElem || !actor) {
    module.logger.debug('Not sorting sheet - no sheet element or no actor', sheet);
    return;
  }
  module.logger.debug('Sorting sheet', sheet);
  const itemLists = sheetElem.querySelectorAll('.item-list');
  for (const itemList of itemLists) {
    const itemNodes = itemList.querySelectorAll('.item');
    const sortedItems = [...itemNodes].map((element, index) => {
      const id = element.getAttribute('data-item-id') || '';
      const item = actor.items.get(id);
      return {
        element,
        sorts: [
          ...decorators.map((decorator) => item && decorator(item) || ''),

          // Fallback to the manually defined sort if everything is the same
          `${item?.sort || ''}`,

          // Added safety to ensure predictable behavior if two items share a `sort`
          `${item?.id || ''}`,
          `${index}`,
        ],
      };
    });
    sortedItems.sort((a, b) => {
      for (let i = 0; i < a.sorts.length; i++) {
        const sort = collator.compare(a.sorts[i], b.sorts[i]);
        if (sort) {
          return sort;
        }
      }
      return 0;
    });
    module.logger.debug('Sorted list', sortedItems);

    for (const item of sortedItems) {
      itemList.appendChild(item.element);
    }
  }
};

Hooks.on('renderActorSheet', (sheet) => {
  if (EnableLegacySorter.get()) {
    // Legacy sorting - disable the new sorting
    return;
  }
  sortSheet(sheet as ActorSheet<dnd5e.documents.Actor5e>);
});

const sortOpenActorSheets = () => {
  if (EnableLegacySorter.get()) {
    // Legacy sorting - disable the new sorting
    return;
  }
  for (const window of Object.values((ui as unknown as { windows: Record<string, Application | undefined> }).windows)) {
    if (window?.rendered && window instanceof ActorSheet) {
      sortSheet(window as ActorSheet<dnd5e.documents.Actor5e>);
    }
  }
};

registerSettingCallback(sortOpenActorSheets);
