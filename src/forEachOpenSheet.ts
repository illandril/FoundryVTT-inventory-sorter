
const forEachOpenSheet = (callback: (sheet: ActorSheet<dnd5e.documents.Actor5e>) => void) => {
  for (const window of Object.values((ui as unknown as { windows: Record<string, Application | undefined> }).windows)) {
    if (window?.rendered && window?.options?.baseApplication === 'ActorSheet') {
      callback(window as ActorSheet<dnd5e.documents.Actor5e>);
    }
  }
};

export default forEachOpenSheet;
