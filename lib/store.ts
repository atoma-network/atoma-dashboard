import { EventEmitter } from "events";

type StoreData = {
  loggedIn: boolean;
};

class Store extends EventEmitter {
  private data: StoreData;

  constructor() {
    super();
    this.data = { loggedIn: sessionStorage.getItem("atoma_access_token") !== null };
  }

  // Get the whole state or part of it
  getState() {
    return this.data;
  }

  // Update state and emit a change event
  setState(newData: Partial<StoreData>) {
    this.data = { ...this.data, ...newData };
    this.emit("change", this.data);
  }
}

// Create a singleton store instance
export const store = new Store();
