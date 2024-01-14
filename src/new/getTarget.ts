const getTarget = (item: dnd5e.documents.Item5e) => {
  const target = (item.system as dnd5e.documents.ItemSystemData.Spell).target;
  const type = target?.type || '';
  const typeIndex = Object.keys(dnd5e.config.targetTypes).indexOf(type);
  const count = target?.value || 0;
  return `${typeIndex} x ${count}`;
};

export default getTarget;
