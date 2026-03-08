const passthrough = (value) => value;

module.exports = {
  __esModule: true,
  init: () => undefined,
  captureException: () => undefined,
  captureMessage: () => undefined,
  withScope: (callback) =>
    callback?.({ setTag: passthrough, setContext: passthrough }),
};
