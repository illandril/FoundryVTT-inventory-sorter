import type SheetItemFinder from './SheetItemFinder';
import type { ItemNode, ItemSection } from './SheetItemFinder';

const Tidy5eSheetHelper: SheetItemFinder = (sheetElem) => {
  // https://github.com/kgar/foundry-vtt-tidy-5e-sheets
  // .tidy5e-kgar is the class used for the Alpha version of kgar's rewrite
  // .tidy5e-sheet is what was used when the rewrite officially took over the old module
  if (!sheetElem?.classList.contains('tidy5e-kgar') && !sheetElem?.classList.contains('tidy5e-sheet')) {
    return null;
  }

  const sections: ItemSection[] = [];
  for (const itemTable of sheetElem.querySelectorAll('[data-tidy-sheet-part="item-table"]')) {
    const items: ItemNode[] = [];
    const sectionElement = itemTable.querySelector('[data-item-id]')?.parentElement;
    if (!sectionElement) {
      continue;
    }
    const referenceNode = sectionElement.querySelector('[data-item-id] + :not([data-item-id])');
    for (const itemElement of sectionElement.querySelectorAll('[data-item-id]')) {
      // biome-ignore lint/style/noNonNullAssertion: The existence of the attribute was guaranteed since it was part of the selector
      const id = itemElement.getAttribute('data-item-id')!;
      items.push({
        id,
        element: itemElement,
      });
    }
    sections.push({
      element: sectionElement,

      items,
      referenceNode,
    });
  }
  return sections;
};
Tidy5eSheetHelper.key = 'tidy5e-sheet';

export default Tidy5eSheetHelper;
