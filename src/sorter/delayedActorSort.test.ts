import delayedActorSort from './delayedActorSort';
import sortActorItems from './sortActorItems';

jest.mock('./sortActorItems');

describe('delayedActorSort', () => {
  jest.useFakeTimers();

  it('should not call sortActorItems if no actor is provided', () => {
    delayedActorSort(null);

    jest.advanceTimersByTime(150);

    expect(sortActorItems).toBeCalledTimes(0);
  });

  it('should call sortActorItems after a short delay', () => {
    const actor = {
      id: 'mock-actor-id',
    } as dnd5e.documents.Actor5e;

    delayedActorSort(actor);

    jest.advanceTimersByTime(100);

    expect(sortActorItems).toBeCalledTimes(0);

    jest.advanceTimersByTime(50);

    expect(sortActorItems).toBeCalledTimes(1);
    expect(sortActorItems).toBeCalledWith(actor);
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

    expect(sortActorItems).toBeCalledTimes(0);

    jest.advanceTimersByTime(100);

    expect(sortActorItems).toBeCalledTimes(1);
    expect(sortActorItems).toBeCalledWith(actor);
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

    expect(sortActorItems).toBeCalledTimes(3);
    expect(sortActorItems).toBeCalledWith(actor1);
    expect(sortActorItems).toBeCalledWith(actor2);
    expect(sortActorItems).toBeCalledWith(actor3);
  });
});
