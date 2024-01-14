import forEachOpenSheet from './forEachOpenSheet';

const defaultUI = ui;
afterEach(() => {
  jest.replaceProperty(window, 'ui', defaultUI);
});

it('gracefully handles ui being undefined', () => {
  const callback = jest.fn();

  jest.replaceProperty(window, 'ui', undefined as unknown as typeof window.ui);

  forEachOpenSheet(callback);

  expect(callback).not.toHaveBeenCalled();
});

it('gracefully handles ui.windows being undefined', () => {
  const callback = jest.fn();

  jest.replaceProperty(window, 'ui', {} as typeof window.ui);

  forEachOpenSheet(callback);

  expect(callback).not.toHaveBeenCalled();
});

it('calls the callback for an opened ActorSheet', () => {
  const application = {
    rendered: true,
    options: {
      id: '1',
      baseApplication: 'ActorSheet',
    },
  } as Application;
  const callback = jest.fn();

  jest.replaceProperty(ui, 'windows', {
    12: application,
  });

  forEachOpenSheet(callback);

  expect(callback).toHaveBeenCalledTimes(1);
  expect(callback).toHaveBeenCalledWith(application);
});

it('calls the callback for multiple opened ActorSheets', () => {
  const application1 = {
    rendered: true,
    options: {
      id: '1',
      baseApplication: 'ActorSheet',
    },
  } as Application;
  const application2 = {
    rendered: true,
    options: {
      id: '2',
      baseApplication: 'ItemSheet',
    },
  } as Application;
  const application3 = {
    rendered: false,
    options: {
      id: '3',
      baseApplication: 'ActorSheet',
    },
  } as Application;
  const application4 = {
    rendered: true,
    options: {
      id: '4',
      baseApplication: 'ActorSheet',
    },
  } as Application;
  const callback = jest.fn();

  jest.replaceProperty(ui, 'windows', {
    12: application1,
    18: application2,
    24: application3,
    30: application4,
  });

  forEachOpenSheet(callback);

  expect(callback).toHaveBeenCalledTimes(2);
  expect(callback).toHaveBeenCalledWith(application1);
  expect(callback).not.toHaveBeenCalledWith(application2); // Non-ActorSheet
  expect(callback).not.toHaveBeenCalledWith(application3); // Not rendered
  expect(callback).toHaveBeenCalledWith(application4);
});
