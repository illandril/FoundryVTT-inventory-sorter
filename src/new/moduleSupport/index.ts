import GenericSheetHelper from './generic';
import SheetItemFinder from './SheetItemFinder';
import Tidy5eSheetKgarHelper from './tidy5e-sheet-kgar';

// List should be ordered from most specific to least specific,
// because the first one to find something to sort "wins"
export const itemFinders = [
  Tidy5eSheetKgarHelper,
  GenericSheetHelper,
] as const satisfies SheetItemFinder[];
