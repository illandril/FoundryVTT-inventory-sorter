import './dnd5e.scss';
import type SheetItemFinder from './SheetItemFinder';
import GenericSheetHelper from './generic';
import Tidy5eSheetHelper from './tidy5e-sheet';

// List should be ordered from most specific to least specific,
// because the first one to find something to sort "wins"
export const itemFinders = [Tidy5eSheetHelper, GenericSheetHelper] as const satisfies SheetItemFinder[];
