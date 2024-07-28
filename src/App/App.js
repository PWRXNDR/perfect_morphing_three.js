import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import Renderer from './Renderer.js';
import Camera from './Camera.js';
import World from './World/World.js';
import Loop from './Utils/Loop.js';
import Resize from './Utils/Resize.js';
import store from './Utils/Store.js';

class App {
    constructor() {
        this.gui = new GUI();
        this.canvas = document.querySelector('canvas.webgl');
        this.scene = new THREE.Scene();
        this.state = store.getState();
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.world = null;
    }

    init() {
        this.setCamera();
        this.setRenderer();
        this.setControls();
        this.setLights();
        this.setWorld();
        this.setResizeHandler();
        this.setAnimationLoop();
        store.subscribe(this.onStoreUpdate.bind(this));
    }

    onStoreUpdate(newState) {
        this.state = newState;
        this.camera.resize(this.state.sizes);
        this.renderer.resize(this.state.sizes.width, this.state.sizes.height, Math.min(window.devicePixelRatio, 2));
    }

    setCamera() {
        this.camera = new Camera(this.state.sizes, this.scene);
    }

    setRenderer() {
        this.renderer = new Renderer(this.canvas, this.state.sizes);
    }

    setControls() {
        this.controls = new OrbitControls(this.camera.instance, this.canvas);
        this.controls.enableDamping = true;
    }

    setLights() {
        const ambientLight = new THREE.AmbientLight('#ffffff', 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight('#ffffff', 1.5);
        directionalLight.position.set(4, 2, 0);
        this.scene.add(directionalLight);
    }

    setWorld() {
        this.world = new World(this.scene, this.gui);
        this.world.loadParticles();
    }

    setResizeHandler() {
        new Resize(this.camera, this.renderer, store);
    }

    setAnimationLoop() {
        new Loop(() => {
            this.controls.update();
            this.renderer.render(this.scene, this.camera.instance);
        });
    }
}

export default App;