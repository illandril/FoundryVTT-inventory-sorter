import type SheetItemFinder from './SheetItemFinder';
import type { ItemNode, ItemSection } from './SheetItemFinder';

const GenericSheetHelper: SheetItemFinder = (sheetElem) => {
  const sections: ItemSection[] = [];
  for (const sectionElement of sheetElem.querySelectorAll('.item-list')) {
    const items: ItemNode[] = [];
    for (const itemElement of sectionElement.querySelectorAll('.item')) {
      const id = itemElement.getAttribute('data-item-id');
      if (!id) {
        continue;
      }
      items.push({
        id,
        element: itemElement,
      });
    }
    sections.push({
      items,
      element: sectionElement,
      referenceNode: null,
    });
  }
  return sections;
};
GenericSheetHelper.key = 'generic';

export default GenericSheetHelper;
