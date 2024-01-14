import module from '../module';
import calculateItemSorts from './calculateItemSorts';

const sortedActors = new Set<string>();

const sortActorItems = async (actor: dnd5e.documents.Actor5e) => {
  sortedActors.add(actor.id);

  const itemSorts = calculateItemSorts(actor);
  const itemUpdates = [];
  for (const itemSort of itemSorts.values()) {
    const item = actor.items.get(itemSort._id) as dnd5e.documents.Item5e;
    if (item.sort !== itemSort.sort) {
      itemUpdates.push(itemSort);
    }
  }
  if (itemUpdates.length > 0) {
    module.logger.debug('Updating sort for items', itemUpdates);
    try {
      await actor.updateEmbeddedDocuments('Item', itemUpdates, { illandrilInventorySorterUpdate: true });
    } catch (error) {
      module.logger.error('Error updating items for actor', actor.id, error);
    }
  }
};

export default sortActorItems;

export const hasActorBeenSorted = (actor: dnd5e.documents.Actor5e) => sortedActors.has(actor.id);
