import collator from '../collator';
import forEachOpenSheet from '../forEachOpenSheet';
import module from '../module';
import { EnableLegacySorter, registerSettingCallback } from '../settings';
import Decorator from './Decorator';
import decorators from './decorators';

const mapItemNode = (actor: dnd5e.documents.Actor5e, element: Element, index: number) => {
  const id = element.getAttribute('data-item-id') || '';
  const item = actor.items.get(id);
  return {
    element,
    sorts: [
      ...decorators.map((decorator) => item ? decorator(item) : null),

      // Fallback to the manually defined sort if everything is the same
      { value: `${item?.sort || ''}`, isDesc: false },

      // Added safety to ensure predictable behavior if two items share a `sort`
      { value: `${item?.id || ''}`, isDesc: false },
      { value: `${index}`, isDesc: false },
    ] satisfies ReturnType<Decorator>[],
  };
};

const compareSorts = (a: { sorts: ReturnType<Decorator>[] }, b: { sorts: ReturnType<Decorator>[] }) => {
  for (let i = 0; i < a.sorts.length; i++) {
    const sortA = a.sorts[i];
    const sortB = b.sorts[i];
    const sort = collator.compare(sortA?.value ?? '', sortB?.value ?? '');
    if (sort) {
      return sortA?.isDesc || sortB?.isDesc ? -1 * sort : sort;
    }
  }
  /* istanbul ignore next - this is never expected to happen */
  return 0;
};

const sortActorSheet = (sheet: ActorSheet<dnd5e.documents.Actor5e>) => {
  const sheetElem = sheet.element.get(0);
  const actor = sheet.actor;
  if (!sheetElem || !actor) {
    module.logger.debug('Not sorting sheet - no sheet element or no actor', sheet);
    return;
  }
  module.logger.debug('Sorting sheet', sheet);
  const itemLists = sheetElem.querySelectorAll('.item-list');
  for (const itemList of itemLists) {
    const itemNodes = itemList.querySelectorAll('.item');
    const sortedItems = [...itemNodes].map((element, index) => mapItemNode(actor, element, index));
    sortedItems.sort(compareSorts);
    module.logger.debug('Sorted list', sortedItems);

    for (const item of sortedItems) {
      itemList.appendChild(item.element);
    }
  }
  module.logger.debug('Done sorting sheet', sheet);
};

Hooks.on('renderActorSheet', (sheet) => {
  if (EnableLegacySorter.get()) {
    // Legacy sorting - disable the new sorting
    return;
  }
  sortActorSheet(sheet as ActorSheet<dnd5e.documents.Actor5e>);
});

const sortOpenActorSheets = () => {
  if (EnableLegacySorter.get()) {
    // Legacy sorting - disable the new sorting
    return;
  }
  forEachOpenSheet(sortActorSheet);
};

registerSettingCallback(sortOpenActorSheets);
