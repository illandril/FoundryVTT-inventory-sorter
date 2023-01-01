const getTypedActor = (item: Item) => (item as dnd5e.documents.Item5e).actor;

export default getTypedActor;
