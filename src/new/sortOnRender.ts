import collator from '../collator';
import forEachOpenSheet from '../forEachOpenSheet';
import module from '../module';
import { EnableLegacySorter, registerSettingCallback } from '../settings';
import Decorator from './Decorator';
import decorators from './decorators';
import { itemFinders } from './moduleSupport';
import { ItemNode } from './moduleSupport/SheetItemFinder';

const mapItemNode = (actor: dnd5e.documents.Actor5e, itemNode: ItemNode, index: number) => {
  const item = actor.items.get(itemNode.id);
  return {
    ...itemNode,
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
  if (EnableLegacySorter.get()) {
    // Legacy sorting - disable the new sorting
    return;
  }
  const sheetElem = sheet.element.get(0);
  const actor = sheet.actor;
  if (!sheetElem || !actor) {
    module.logger.debug('Not sorting sheet - no sheet element or no actor', sheet);
    return;
  }

  for (const itemFinder of itemFinders) {
    module.logger.debug('Checking itemFinder', itemFinder.key);
    const sections = itemFinder(sheet, sheetElem);
    if (sections?.length) {
      module.logger.debug('Found sections', itemFinder.key, sections.length);
      for (const section of sections) {
        const sortedItems = section.items.map((element, index) => mapItemNode(actor, element, index));
        sortedItems.sort(compareSorts);
        module.logger.debug('Sorted list', sortedItems);

        for (const item of sortedItems) {
          section.element.insertBefore(item.element, section.referenceNode);
        }
      }
      module.logger.debug('Done sorting sheet', sheet);
      return;
    }
  }
  module.logger.debug('Could not sort sheet - no sections found', sheet);
};

Hooks.on('renderActorSheet', (sheet) => {
  sortActorSheet(sheet as ActorSheet<dnd5e.documents.Actor5e>);
});

declare global {
  interface HookCallbacks {
    'tidy5e-sheet.renderActorSheet': (sheet: ActorSheet<dnd5e.documents.Actor5e>) => void
  }
}

Hooks.on('tidy5e-sheet.renderActorSheet', (sheet) => {
  sortActorSheet(sheet);
});

const sortOpenActorSheets = () => {
  if (EnableLegacySorter.get()) {
    // Legacy sorting - disable the new sorting
    return;
  }
  forEachOpenSheet(sortActorSheet);
};

registerSettingCallback(sortOpenActorSheets);
