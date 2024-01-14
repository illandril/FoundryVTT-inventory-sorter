import delayedActorSort from './delayedActorSort';
import sortActorItems from './sortActorItems';

jest.mock('./sortActorItems');

describe('delayedActorSort', () => {
  jest.useFakeTimers();

  it('should not call sortActorItems if no actor is provided', () => {
    delayedActorSort(null);

    jest.advanceTimersByTime(150);

    expect(sortActorItems).toHaveBeenCalledTimes(0);
  });

  it('should call sortActorItems after a short delay', () => {
    const actor = {
      id: 'mock-actor-id',
    } as dnd5e.documents.Actor5e;

    delayedActorSort(actor);

    jest.advanceTimersByTime(100);

    expect(sortActorItems).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(50);

    expect(sortActorItems).toHaveBeenCalledTimes(1);
    expect(sortActorItems).toHaveBeenCalledWith(actor);
  });

  it('should call sortActorItems only once if called repeatedly with the same actor', () => {
    const actor = {
      id: 'mock-actor-id',
    } as dnd5e.documents.Actor5e;

    delayedActorSort(actor);
    delayedActorSort(actor);

    jest.advanceTimersByTime(50);

    delayedActorSort(actor);

    jest.advanceTimersByTime(50);

    delayedActorSort(actor);

    jest.advanceTimersByTime(100);

    expect(sortActorItems).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(100);

    expect(sortActorItems).toHaveBeenCalledTimes(1);
    expect(sortActorItems).toHaveBeenCalledWith(actor);
  });

  it('should call sortActorItems for every actor if called rapidly with different actors', () => {
    const actor1 = {
      id: 'mock-actor-a',
    } as dnd5e.documents.Actor5e;
    const actor2 = {
      id: 'mock-actor-b',
    } as dnd5e.documents.Actor5e;
    const actor3 = {
      id: 'mock-actor-c',
    } as dnd5e.documents.Actor5e;

    delayedActorSort(actor1);
    delayedActorSort(actor2);

    jest.advanceTimersByTime(50);

    delayedActorSort(actor3);

    jest.advanceTimersByTime(150);

    expect(sortActorItems).toHaveBeenCalledTimes(3);
    expect(sortActorItems).toHaveBeenCalledWith(actor1);
    expect(sortActorItems).toHaveBeenCalledWith(actor2);
    expect(sortActorItems).toHaveBeenCalledWith(actor3);
  });
});
