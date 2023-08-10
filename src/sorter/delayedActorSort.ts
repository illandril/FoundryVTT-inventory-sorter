import sortActorItems from './sortActorItems';

const pendingActorSorts = new Map<string, ReturnType<typeof setTimeout>>();

const delayedActorSort = (actor: dnd5e.documents.Actor5e | null) => {
  if (!actor) {
    return;
  }
  clearTimeout(pendingActorSorts.get(actor.id));
  pendingActorSorts.set(
    actor.id,
    setTimeout(() => {
      void sortActorItems(actor);
    }, 150),
  );
};

export default delayedActorSort;
