import * as THREE from "three";

const moonDiffuseMap = require('./assets/lroc_color_poles_2k.jpg');
const moonBumpMap = require('./assets/lroc_color_poles_2k_disp.jpg');

// TODO: pass as constructor arguments?
const sphere = new THREE.SphereGeometry(0.5, 24, 24);
const loader = new THREE.TextureLoader();

const moonTex = loader.load(moonDiffuseMap);
moonTex.encoding = THREE.sRGBEncoding;

export class Moon extends THREE.Group {
    private rotationRate: number;

    constructor() {
        super();

        this.rotationRate = 0.001;

        // Surface
        const mat = new THREE.MeshStandardMaterial({
            map: moonTex,
            bumpMap: loader.load(moonBumpMap),
            bumpScale: 10000.0,
        });
        const body = new THREE.Mesh(sphere, mat);
        this.add(body);
    }

    update() {
        this.rotation.y += this.rotationRate;
    }
}
