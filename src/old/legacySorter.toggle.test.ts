let delayedActorSort: jest.SpiedFunction<typeof import('./delayedActorSort').default>;
let hasActorBeenSorted: jest.SpiedFunction<typeof import('./sortActorItems').hasActorBeenSorted>;
let EnableLegacySorter: typeof import('../settings').EnableLegacySorter;
let forEachOpenSheet: jest.SpiedFunction<typeof import('../forEachOpenSheet').default>;

beforeAll(async () => {
  delayedActorSort = jest.spyOn(await import('./delayedActorSort'), 'default').mockReturnValue();

  hasActorBeenSorted = jest.spyOn(await import('./sortActorItems'), 'hasActorBeenSorted').mockReturnValue(false);

  forEachOpenSheet = jest.spyOn(await import('../forEachOpenSheet'), 'default').mockImplementation(() => undefined);

  SIMULATE.mockSavedSetting('illandril-inventory-sorter', 'enableLegacySorter', true);

  await import('./legacySorter');

  EnableLegacySorter = (await import('../settings')).EnableLegacySorter;

  Hooks.callAll('init');
});

beforeEach(() => {
  forEachOpenSheet.mockImplementation(() => undefined);
});

it('refreshes the sort on any open actor sheets when turning EnableLegacySorter on', () => {
  EnableLegacySorter.set(false);

  const actor1 = {
    id: 'pb0HcmClJ3fSyy6k',
  } as dnd5e.documents.Actor5e;
  forEachOpenSheet.mockImplementation((callback) => {
    callback({
      isEditable: true,
      actor: actor1,
    } as ActorSheet<dnd5e.documents.Actor5e>);
  });

  expect(delayedActorSort).not.toHaveBeenCalled();
  expect(hasActorBeenSorted).not.toHaveBeenCalled();

  EnableLegacySorter.set(true);

  expect(hasActorBeenSorted).toHaveBeenCalledTimes(1);
  expect(hasActorBeenSorted).toHaveBeenNthCalledWith(1, actor1);
  expect(delayedActorSort).toHaveBeenCalledTimes(1);
  expect(delayedActorSort).toHaveBeenNthCalledWith(1, actor1);
});

it('does not sort when turning EnableLegacySorter off', () => {
  EnableLegacySorter.set(true);

  const actor1 = {
    id: 'pb0HcmClJ3fSyy6k',
  } as dnd5e.documents.Actor5e;
  forEachOpenSheet.mockImplementation((callback) => {
    callback({
      isEditable: true,
      actor: actor1,
    } as ActorSheet<dnd5e.documents.Actor5e>);
  });

  expect(delayedActorSort).not.toHaveBeenCalled();
  expect(hasActorBeenSorted).not.toHaveBeenCalled();

  EnableLegacySorter.set(false);

  expect(delayedActorSort).not.toHaveBeenCalled();
  expect(hasActorBeenSorted).not.toHaveBeenCalled();
});
