import SheetItemFinder, { ItemNode, ItemSection } from './SheetItemFinder';

const Tidy5eSheetKgarHelper: SheetItemFinder = (sheetElem) => {
  if (!sheetElem?.classList.contains('tidy5e-kgar')) {
    return null;
  }

  const sections: ItemSection[] = [];
  for (const itemTable of sheetElem.querySelectorAll('[data-tidy-sheet-part="item-table"]')) {
    const items: ItemNode[] = [];
    const sectionElement = itemTable.querySelector('.items') ?? itemTable;
    const referenceNode = sectionElement.querySelector('[data-item-id] + :not([data-item-id])');
    for (const itemElement of sectionElement.querySelectorAll('[data-item-id]')) {
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
Tidy5eSheetKgarHelper.key = 'tidy5e-sheet-kgar';

export default Tidy5eSheetKgarHelper;
