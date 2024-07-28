import AssetLoader from '../Utils/AssetLoader.js';
import AssetStore from '../Utils/AssetStore.js';
import ParticleManager from './ParticleManager.js';

class World {
    constructor(scene, gui) {
        this.scene = scene;
        this.gui = gui;
        this.assetLoader = new AssetLoader();
        this.assetStore = new AssetStore();
        this.particleManager = new ParticleManager(scene, gui);
    }

    loadParticles() {
        this.assetLoader.loadModel('./models.glb', (gltf) => {
            this.assetStore.addAsset('particles', gltf);
            this.particleManager.loadParticles(gltf);
        });
    }
}

export default World;