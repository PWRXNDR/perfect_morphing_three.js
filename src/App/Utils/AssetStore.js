class AssetStore {
    constructor() {
        this.assets = {};
    }

    addAsset(key, asset) {
        this.assets[key] = asset;
    }

    getAsset(key) {
        return this.assets[key];
    }
}

export default AssetStore;
