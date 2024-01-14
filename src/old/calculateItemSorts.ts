import extractSortInformation from './extractSortInformation';

export type ItemSort = {
  _id: string
  sort: number
};

const calculateItemSorts = (actor: dnd5e.documents.Actor5e | null) => {
  const itemSorts = new Map<string, ItemSort>();
  if (actor) {
    const sortedItems = extractSortInformation(actor.items);
    let nextSort = 0;
    let lastGroup = null;
    for (const item of sortedItems) {
      if (item.group !== lastGroup) {
        nextSort = 0;
        lastGroup = item.group;
      }
      nextSort++;

      const newSort = nextSort * foundry.CONST.SORT_INTEGER_DENSITY;
      itemSorts.set(item.id, { _id: item.id, sort: newSort });
    }
  }
  return itemSorts;
};

export default calculateItemSorts;
