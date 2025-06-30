import { forEach } from "@petit-kit/utils";
import localStoragePlugin from "./plugins/local-storage";

class Magasin {
  private _store: Record<string, any> = {};
  private _subscribers: Record<string, ((value: any) => void)[]> = {};
  private _defaults: Record<string, any> = {};
  private _getters: Record<string, (...args: any[]) => any> = {};
  private _relations: Record<string, any> = {};
  private plugins: any[] = [];

  constructor(args: { id?: any; plugins?: any[] } = {}) {
    this.plugins = (args.plugins || [])?.reduce(
      (acc, p) => ({ ...acc, ...p(this, args) }),
      {}
    );
    forEach(this.plugins, (p: any) => p.init?.());
  }

  default(key: string, value: any) {
    this._defaults[key] = value;
    return this._store[key] === undefined
      ? this.set(key, value)
      : this.ref(key);
  }

  set(key: string, value: any, deps?: any[]): any {
    if (value instanceof Promise)
      return value.then((v) => this.set(key, v, deps)), this.ref(key);

    const usableValue =
      typeof value === "function"
        ? (this._getters[key] = value)(this._store[key])
        : value;

    this._store[key] = usableValue;
    this.broadcast(key);

    forEach(deps, (dep: any) =>
      (this._relations[typeof dep === "string" ? dep : dep.key] ??= []).push(
        key
      )
    );

    forEach(this._relations[key], (relationKey: string) =>
      this.set(relationKey, this._getters[relationKey](this._store))
    );

    forEach(this.plugins, (plugin: any) => plugin.set?.(key, usableValue));
    return this.ref(key);
  }

  get = (key: string) => (key === undefined ? this._store : this._store[key]);

  ref = (
    key: string
  ): {
    key: string;
    get: () => any;
    set: (value: any, deps?: any[]) => any;
    subscribe: (
      callback: (value: any) => void,
      broadcast?: boolean
    ) => () => void;
  } => ({
    key,
    get: () => this.get(key as string),
    set: (value: any, deps?: any[]) => this.set(key, value, deps),
    subscribe: (callback: (value: any) => void, broadcast = true) =>
      this.subscribe(key, callback, broadcast),
  });

  subscribe(key: string, callback: (value: any) => void, broadcast = true) {
    (this._subscribers[key] ??= []).push(callback);
    if (this._store[key] !== undefined && broadcast) callback(this._store[key]);
    return () => this.unsubscribe(key, callback);
  }

  unsubscribe(key: string, callback: (value: any) => void) {
    this._subscribers[key] = (this._subscribers[key] || []).filter(
      (cb) => cb !== callback
    );
    return this;
  }

  clear(key?: string) {
    key === undefined
      ? ((this._subscribers = {}),
        this.reset(),
        forEach(this.plugins, (plugin: any) => plugin.clear?.()))
      : (delete this._store[key],
        (this._subscribers[key] = []),
        this.broadcast(key));

    return this;
  }

  reset() {
    this._store = {};
    forEach(this._defaults, (value: any, key: string) => this.set(key, value));
    forEach(this.plugins, (plugin: any) => plugin.reset?.());
    this.broadcast();
    return this;
  }

  broadcast(key?: string) {
    (key ? [key] : Object.keys(this._subscribers)).forEach((k) =>
      (this._subscribers[k] || []).forEach((cb) => cb(this._store[k]))
    );
    return this;
  }
}

const magasin = new Magasin();

export default magasin;
export { Magasin, localStoragePlugin as localStorage };
