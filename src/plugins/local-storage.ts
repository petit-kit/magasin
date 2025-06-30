const localStoragePlugin = (magasin: any, settings: any) => {
  const options = {
    autoSave: true,
    ...settings,
  };

  const plugin: any = {
    init: () => {
      magasin._store = JSON.parse(localStorage.getItem(options.id) || "{}");
    },
    save: () => {
      localStorage.setItem(options.id, JSON.stringify(magasin._store));
    },
    clear: () => {
      localStorage.setItem(options.id, "");
    },
    reset: () => plugin.save(),
  };

  if (options.autoSave) {
    plugin.set = plugin.save;
  }

  return {
    localStorage: plugin,
  };
};

export default localStoragePlugin;
