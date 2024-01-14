
const forEachOpenSheet = (callback: (sheet: ActorSheet<dnd5e.documents.Actor5e>) => void) => {
  if (!ui?.windows) {
    return;
  }
  for (const window of Object.values(ui.windows)) {
    if (window?.rendered && window?.options?.baseApplication === 'ActorSheet') {
      callback(window as ActorSheet<dnd5e.documents.Actor5e>);
    }
  }
};

export default forEachOpenSheet;
