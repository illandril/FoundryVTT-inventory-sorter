import collator from '../collator';

export type ItemSortDetails = {
  id: string
  group: string
  name: string
  alternateSort: string
};

export type SortedItemDetails = {
  id: string
  group: string
};

const sortItems = (items: ItemSortDetails[]): SortedItemDetails[] => {
  return items
    // .map((item) => ({
    //   id: item.id,
    //   group: item.group,
    //   sort: `${item.group}${SPLITTER}${item.alternateSort}${SPLITTER}${item.name}`,
    // }))
    // .sort((a, b) => collator.compare(a.sort, b.sort))
    .map((item) => item)
    .sort((a, b) => collator.compare(a.group, b.group)
                  || collator.compare(a.alternateSort, b.alternateSort)
                  || collator.compare(a.name, b.name)
                  || collator.compare(a.id, b.id))
    .map((item) => ({
      id: item.id,
      group: item.group,
    }));
};

export default sortItems;
