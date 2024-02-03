export type ItemNode = {
  id: string
  element: Element
};

export type ItemSection = {
  items: ItemNode[]
  element: Element
  referenceNode: Element | null
};

type SheetItemFinder = {
  key: string
  (sheetElem: Element): ItemSection[] | null
};

export default SheetItemFinder;
