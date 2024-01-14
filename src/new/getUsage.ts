const getUsage = (item: dnd5e.documents.Item5e) => {
  const activation = (item.system as dnd5e.documents.ItemSystemData.ActivatedEffect).activation;
  const type = activation?.type || '';
  const typeIndex = Object.keys(dnd5e.config.abilityActivationTypes).indexOf(type);
  const cost = activation?.cost || 0;
  return `${(typeIndex + 1) * 1_000_000 + cost}`;
};

export default getUsage;
