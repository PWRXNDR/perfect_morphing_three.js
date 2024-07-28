class Resize {
    constructor(camera, renderer, store) {
        this.camera = camera;
        this.renderer = renderer;
        this.store = store;
        this.init();
    }

    init() {
        window.addEventListener('resize', () => {
            // Update sizes in the store
            const newSizes = {
                width: window.innerWidth,
                height: window.innerHeight
            };
            this.store.setState({ sizes: newSizes });

            // Update camera
            this.camera.instance.aspect = newSizes.width / newSizes.height;
            this.camera.instance.updateProjectionMatrix();

            // Update renderer
            this.renderer.instance.setSize(newSizes.width, newSizes.height);
            this.renderer.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });
    }
}

export default Resize;