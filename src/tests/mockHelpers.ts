type MockItem = {
  id: string;
  name: string;
  type: string;
  system: dnd5e.documents.ItemSystemData.Any;
  sort?: number;
};

export const mockItem = (item: MockItem) => item as dnd5e.documents.Item5e;

export const mockActor = (items: dnd5e.documents.Item5e[] | undefined, extraProps?: object) => {
  let items5e: foundry.utils.Collection<string, dnd5e.documents.Item5e> | undefined;
  if (items) {
    items5e = {
      map: (transformer) => items.map(transformer as unknown as Parameters<typeof items.map>[0]),
      get: (key) => items.find((item) => item.id === key),
    } as foundry.utils.Collection<string, dnd5e.documents.Item5e>;
  }
  const actor: dnd5e.documents.Actor5e = {
    ...extraProps,
    items: items5e,
  } as dnd5e.documents.Actor5e;

  return actor;
};
