const getUsage = (item: dnd5e.documents.Item5e) => {
  const activation = (item.system as dnd5e.documents.ItemSystemData.ActivatedEffect).activation;
  const type = activation?.type || '';
  const typeIndex = Object.keys(dnd5e.config.abilityActivationTypes).indexOf(type);
  const count = activation?.cost || 0;
  return `${typeIndex} x ${count}`;
};

export default getUsage;
