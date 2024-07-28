import * as THREE from 'three';

class Camera {
    constructor(sizes, scene) {
        this.sizes = sizes;
        this.scene = scene;
        this.instance = null;

        this.setInstance();
    }

    setInstance() {
        this.instance = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height, 0.1, 100);
        this.instance.position.set(0, 2, 15);
        this.scene.add(this.instance);
    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height;
        this.instance.updateProjectionMatrix();
    }
}

export default Camera;