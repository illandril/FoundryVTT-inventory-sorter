import module from '../module';
import { AnyItemSortOption, typeBasedSorting } from '../settings';
import Decorator from './Decorator';
import getTarget from './getTarget';
import getUsage from './getUsage';

const get = (item: dnd5e.documents.Item5e, setting: AnyItemSortOption | null): ReturnType<Decorator> => {
  if (setting === null) {
    return null;
  }
  switch (setting) {
    case 'name':
      return item.name;
    case 'quantity':
      return `${(item.system as dnd5e.documents.ItemSystemData.PhysicalItem).quantity ?? 0}`;
    case 'usage':
      return getUsage(item);
    case 'weight':
      return `${(item.system as dnd5e.documents.ItemSystemData.PhysicalItem).weight ?? 0}`;
    case 'school':
      return (item.system as dnd5e.documents.ItemSystemData.Spell).school ?? '';
    case 'target':
      return getTarget(item);
    case 'requirements':
      return (item.system as dnd5e.documents.ItemSystemData.Feat).requirements ?? '';
    default:
      module.logger.error('Unexpected sort setting', setting);
      return null;
  }
};

const getForType = (item: dnd5e.documents.Item5e) => {
  return typeBasedSorting[item.type];
};

const decorators: readonly Decorator[] = [
  (item) => get(item, getForType(item)?.primary() ?? null),
  (item) => get(item, getForType(item)?.secondary() ?? null),
];

export default decorators;
