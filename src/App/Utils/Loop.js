class Loop {
    constructor(callback) {
        this.callback = callback;
        this.start();
    }

    start() {
        const tick = () => {
            this.callback();
            window.requestAnimationFrame(tick);
        };
        tick();
    }
}

export default Loop;
