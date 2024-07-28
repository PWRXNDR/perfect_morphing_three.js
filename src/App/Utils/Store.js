class Store {
    constructor() {
        this.state = {
            sizes: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            particles: null
        };
        this.listeners = [];
    }

    getState() {
        return this.state;
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    subscribe(listener) {
        this.listeners.push(listener);
    }

    unsubscribe(listener) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }
}

const store = new Store();
export default store;