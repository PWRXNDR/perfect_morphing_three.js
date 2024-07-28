import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer.js';

class Renderer {
    constructor(canvas, sizes) {
        this.canvas = canvas;
        this.sizes = sizes;
        this.instance = null;

        this.setInstance();
    }

    setInstance() {
        this.instance = new WebGPURenderer({
            canvas: this.canvas
        });
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.instance.setClearColor('#000000');
    }

    render(scene, camera) {
        this.instance.renderAsync(scene, camera);
    }

    resize(width, height, pixelRatio) {
        this.instance.setSize(width, height);
        this.instance.setPixelRatio(pixelRatio);
    }
}

export default Renderer;