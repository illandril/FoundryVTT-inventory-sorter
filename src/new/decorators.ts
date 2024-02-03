import module from '../module';
import { AnyItemSortOption, typeBasedSorting } from '../settings';
import Decorator from './Decorator';
import getTarget from './getTarget';
import getUsage from './getUsage';

const get = (item: dnd5e.documents.Item5e, setting: AnyItemSortOption | null): ReturnType<Decorator> => {
  if (setting === null) {
    return null;
  }
  let sortValue: string;
  const quantity = (item.system as dnd5e.documents.ItemSystemData.PhysicalItem).quantity ?? 0;
  const weight = (item.system as dnd5e.documents.ItemSystemData.PhysicalItem).weight ?? 0;
  switch (setting.column) {
    case 'name':
      sortValue = item.name;
      break;
    case 'quantity':
      sortValue = `${quantity}`;
      break;
    case 'usage':
      sortValue = getUsage(item);
      break;
    case 'weight':
      sortValue = `${weight}`;
      break;
    case 'totalWeight':
      sortValue = `${weight * quantity}`;
      break;
    case 'school':
      sortValue = (item.system as dnd5e.documents.ItemSystemData.Spell).school ?? '';
      break;
    case 'target':
      sortValue = getTarget(item);
      break;
    case 'requirements':
      sortValue = (item.system as dnd5e.documents.ItemSystemData.Feat).requirements ?? '';
      break;
    /* istanbul ignore next - this is never expected to happen */
    default:
      module.logger.error('Unexpected sort setting', setting);
      return null;
  }
  return {
    value: sortValue,
    isDesc: setting.isDesc,
  };
};

const getForType = (item: dnd5e.documents.Item5e) => {
  return typeBasedSorting[item.type];
};

const decorators: readonly Decorator[] = [
  (item) => get(item, getForType(item)?.primary() ?? null),
  (item) => get(item, getForType(item)?.secondary() ?? null),
];

export default decorators;
