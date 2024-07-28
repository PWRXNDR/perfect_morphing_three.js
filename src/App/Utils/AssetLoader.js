import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

class AssetLoader {
    constructor() {
        this.gltfLoader = null;
        this.init();
    }

    init() {
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('./draco/');
        this.gltfLoader = new GLTFLoader();
        this.gltfLoader.setDRACOLoader(dracoLoader);
    }

    loadModel(url, onLoad) {
        this.gltfLoader.load(url, (gltf) => {
            onLoad(gltf);
        });
    }
}

export default AssetLoader;
