const getTarget = (item: dnd5e.documents.Item5e) => {
  const target = (item.system as dnd5e.documents.ItemSystemData.Spell).target;
  const type = target?.type || '';
  const typeIndex = Object.keys(dnd5e.config.targetTypes).indexOf(type);
  const value = target?.value || 0;
  return `${(typeIndex + 1) * 1_000_000 + value}`;
};

export default getTarget;
