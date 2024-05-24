type Decorator = (item: dnd5e.documents.Item5e) => { value: string; isDesc: boolean } | null;
export default Decorator;
