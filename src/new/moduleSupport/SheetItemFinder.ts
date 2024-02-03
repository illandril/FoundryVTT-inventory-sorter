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
  (sheet: ActorSheet<dnd5e.documents.Actor5e>, sheetElem: Element): ItemSection[] | null
};

export default SheetItemFinder;
