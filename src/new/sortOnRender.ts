import collator from '../collator';
import forEachOpenSheet from '../forEachOpenSheet';
import module from '../module';
import { EnableLegacySorter, registerSettingCallback } from '../settings';
import type Decorator from './Decorator';
import decorators from './decorators';
import { itemFinders } from './moduleSupport';
import type { ItemNode } from './moduleSupport/SheetItemFinder';

const mapItemNode = (actor: dnd5e.documents.Actor5e, itemNode: ItemNode, index: number) => {
  const item = actor.items.get(itemNode.id);
  return {
    ...itemNode,
    sorts: [
      ...decorators.map((decorator) => (item ? decorator(item) : null)),

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

const sortSheet = (sheet: Application) => {
  if (EnableLegacySorter.get()) {
    // Legacy sorting - disable the new sorting
    return;
  }
  const sheetElem = sheet.element.get(0);
  const actor = foundry.utils.getProperty(sheet, 'actor');
  if (!sheetElem || !actor) {
    module.logger.debug('Not sorting sheet - no sheet element or no actor', sheet, sheetElem, actor);
    return;
  }
  sort(sheetElem, actor as dnd5e.documents.Actor5e);
};

const sort = (sheetElem: Element, actor: dnd5e.documents.Actor5e) => {
  for (const itemFinder of itemFinders) {
    module.logger.debug('Checking itemFinder', itemFinder.key);
    const sections = itemFinder(sheetElem);
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
      module.logger.debug('Done sorting sheet', sheetElem, actor);
      return;
    }
  }
  module.logger.debug('Could not sort sheet - no sections found', sheetElem, actor);
};

Hooks.on('renderActorSheet', (sheet) => {
  sortSheet(sheet);
});

Hooks.on('renderContainerSheet', (containerSheet) => {
  sortSheet(containerSheet);
});

declare global {
  interface HookCallbacks {
    'tidy5e-sheet.renderActorSheet': (sheet: ActorSheet<dnd5e.documents.Actor5e>) => void;
  }
}

Hooks.on('tidy5e-sheet.renderActorSheet', (sheet) => {
  sortSheet(sheet);
});

Hooks.on('updateUser', (user, changes) => {
  if (user.id === game.user?.id && foundry.utils.getProperty(changes, 'flags.dnd5e.sheetPrefs')) {
    // We need to wait briefly so the dnd5e 3.x character sheet's grouping
    // logic doesn't overwrite our sorting logic
    setTimeout(() => {
      sortOpenActorSheets();
    }, 1);
  }
});

const sortOpenActorSheets = () => {
  if (EnableLegacySorter.get()) {
    // Legacy sorting - disable the new sorting
    return;
  }
  forEachOpenSheet(sortSheet);
};

registerSettingCallback(sortOpenActorSheets);
