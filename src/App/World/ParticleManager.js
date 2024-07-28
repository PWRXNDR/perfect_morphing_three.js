import * as THREE from 'three';
import { SpriteNodeMaterial, color, float, mix, smoothstep, storage, tslFn, uniform, uv, varying, vec3, vec4 } from 'three/examples/jsm/nodes/Nodes.js';
import StorageInstancedBufferAttribute from 'three/examples/jsm/renderers/common/StorageInstancedBufferAttribute.js';
import gsap from 'gsap';
import { simplexNoise3d } from '.././tsl/simplexNoise3d.js';
import store from '../Utils/Store.js';

class ParticleManager {
    constructor(scene, gui) {
        this.scene = scene;
        this.gui = gui;
        this.particles = null;
        this.store = store;
        this.store.subscribe(this.onStoreUpdate.bind(this));
    }

    onStoreUpdate(newState) {
        this.particles = newState.particles;
    }

    loadParticles(gltf) {
        let particles = {};
        particles.index = 0;

        // Normalize and collect positions
        const positions = gltf.scene.children
            .filter(child => child.geometry && child.geometry.attributes && child.geometry.attributes.position)
            .map(child => {
                // Normalize scale
                const boundingBox = new THREE.Box3().setFromObject(child);
                const size = new THREE.Vector3();
                boundingBox.getSize(size);
                const maxDimension = Math.max(size.x, size.y, size.z);
                const scaleFactor = 1 / maxDimension;
                child.scale.setScalar(scaleFactor);
                child.updateMatrixWorld(true);
                return child.geometry.attributes.position;
            });

        particles.maxCount = 0;
        for (const position of positions) {
            if (position.count > particles.maxCount) {
                particles.maxCount = position.count;
            }
        }

        particles.positions = [];
        for (const position of positions) {
            const originalArray = position.array;
            const newArray = new Float32Array(particles.maxCount * 3);

            for (let i = 0; i < particles.maxCount; i++) {
                const i3 = i * 3;

                if (i3 < originalArray.length) {
                    newArray[i3 + 0] = originalArray[i3 + 0];
                    newArray[i3 + 1] = originalArray[i3 + 1];
                    newArray[i3 + 2] = originalArray[i3 + 2];
                } else {
                    const randomIndex = Math.floor(position.count * Math.random()) * 3;
                    newArray[i3 + 0] = originalArray[randomIndex + 0];
                    newArray[i3 + 1] = originalArray[randomIndex + 1];
                    newArray[i3 + 2] = originalArray[randomIndex + 2];
                }
            }

            particles.positions.push(storage(new StorageInstancedBufferAttribute(newArray, 3), 'vec3', particles.maxCount).toAttribute());
        }

        // Scale
        const scalesArray = new Float32Array(particles.maxCount);
        for (let i = 0; i < particles.maxCount; i++) {
            scalesArray[i] = Math.random();
        }
        const scalesAttribute = storage(new StorageInstancedBufferAttribute(scalesArray, 1), 'float', particles.maxCount).toAttribute();

        /**
         * Material
         */
        const material = new SpriteNodeMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });

        const colorOriginUniform = uniform(color('#0f2166'));
        const colorTargetUniform = uniform(color('#2b0d59'));
        const progressUniform = uniform(0);
        const noiseScaleUniform = uniform(0.2);
        const transitionRatioUniform = uniform(0.4);
        const scaleUniform = uniform(0.4);

        // Mixed position
        const getMixedPosition = tslFn(([origin, target]) => {
            // Noises
            const noiseOrigin = simplexNoise3d(vec3(origin.mul(noiseScaleUniform)));
            const noiseTarget = simplexNoise3d(vec3(target.mul(noiseScaleUniform)));
            const noise = mix(noiseOrigin, noiseTarget, progressUniform).smoothstep(-1, 1);

            // Transition
            const duration = transitionRatioUniform;
            const delay = duration.oneMinus().mul(noise);
            const end = delay.add(duration);
            const progress = smoothstep(delay, end, progressUniform);

            // Color varying
            const colorVarying = varying(vec3(), 'colorVarying').assign(mix(colorOriginUniform, colorTargetUniform, noise));

            // Output
            return mix(origin, target, progress);
        });
        material.positionNode = getMixedPosition(particles.positions[0], particles.positions[1]);

        // Scale
        material.scaleNode = scalesAttribute.mul(scaleUniform);

        // Color
        material.colorNode = tslFn(() => {
            const colorVarying = varying(vec3(), 'colorVarying');
            const intensity = float(0.05).div(uv().sub(0.5).length()).sub(0.1);
            return vec4(colorVarying.mul(intensity.pow(2)), 1);
        })();

        /**
         * Mesh
         */
        const geometry = new THREE.PlaneGeometry(1, 1);
        const mesh = new THREE.InstancedMesh(geometry, material, particles.maxCount);
        this.scene.add(mesh);

        // Methods
        particles.morph = (index) => {
            if (particles.positions[index] && particles.positions[particles.index]) {
                material.positionNode = getMixedPosition(particles.positions[particles.index], particles.positions[index]);
                material.needsUpdate = true;

                gsap.fromTo(
                    progressUniform,
                    { value: 0 },
                    { value: 1, duration: 3, ease: 'linear' }
                );

                particles.index = index;
            } else {
                console.error('Invalid particle positions for morphing:', particles.index, index);
            }
        };

        particles.morph0 = () => { particles.morph(0); };
        particles.morph1 = () => { particles.morph(1); };
        particles.morph2 = () => { particles.morph(2); };
        particles.morph3 = () => { particles.morph(3); };
        particles.morph4 = () => { particles.morph(4); };

        this.store.setState({ particles });

        /**
         * Debug
         */
        this.gui.addColor({ color: colorOriginUniform.value.getHexString(THREE.SRGBColorSpace) }, 'color').onChange((value) => { colorOriginUniform.value.set(value); }).name('colorOrigin');
        this.gui.addColor({ color: colorTargetUniform.value.getHexString(THREE.SRGBColorSpace) }, 'color').onChange((value) => { colorTargetUniform.value.set(value); }).name('colorTarget');
        this.gui.add(progressUniform, 'value', 0, 1, 0.01).name('progress');
        this.gui.add(noiseScaleUniform, 'value', 0, 1, 0.01).name('noiseScale');
        this.gui.add(transitionRatioUniform, 'value', 0, 1, 0.01).name('transitionRatio');
        this.gui.add(scaleUniform, 'value', 0, 1, 0.01).name('scaleUniform');

        this.gui.add(particles, 'morph0');
        this.gui.add(particles, 'morph1');
        this.gui.add(particles, 'morph2');
        this.gui.add(particles, 'morph3');
        this.gui.add(particles, 'morph4');
    }
}

export default ParticleManager;