import * as THREE from "three";
import {Mesh, MeshPhongMaterial, SphereGeometry} from "three";

// https://www.solarsystemscope.com/textures/
const earthDiffuseMap = require('./assets/8k_earth_daymap.jpg');
const earthSpecularMap = require('./assets/8k_earth_specular_map.png');
const earthCloudsAlphaMap = require('./assets/2k_earth_clouds.jpg');
// http://www.shadedrelief.com/natural3/pages/textures.html
const earthDiffuseMap2 = require('./assets/8k_earth_4_no_ice_clouds_mts.jpg');
const earthSpecularMap2 = require('./assets/8k_earth_water.png');
const earthBumpMap = require('./assets/8k_earth_bump.jpg');

// const s = {
//     label: 'Earth (12,700 km)',
//     size: 12742000,
//     scale: 1.0,
//     material: new THREE.MeshPhongMaterial({
//         map: earthTex,
//         specularMap: loader.load(earthSpecularMap2),
//         shininess: 50.0,
//         // roughnessMap: loader.load(earthSpecularMap2),
//         // reflectivity: 0.5,
//         bumpMap: loader.load(earthBumpMap),
//         bumpScale: 10000.0,
//     }),
//     material2: new THREE.MeshPhongMaterial({
//         color: 0xFFFFFF,
//         alphaMap: loader.load(earthCloudsAlphaMap),
//     }),
// };

// TODO: pass as constructor arguments?
const sphere = new THREE.SphereGeometry(0.5, 24, 24);
const loader = new THREE.TextureLoader();

const earthTex = loader.load(earthDiffuseMap2);
earthTex.encoding = THREE.sRGBEncoding;
const cloudTex = loader.load(earthCloudsAlphaMap);

// console.log('cloud data:', cloudTex.source.data);
// cloudTex.encoding = THREE.sRGBEncoding; // Too dark

export class Earth extends THREE.Group {
    private rotationRate: number;
    private clouds: Mesh<SphereGeometry, MeshPhongMaterial>;

    constructor() {
        super();

        this.rotationRate = 0.0005;

        // Surface
        const mat = new THREE.MeshPhongMaterial({
            map: earthTex,
            specularMap: loader.load(earthSpecularMap2),
            shininess: 50.0,
            // roughnessMap: loader.load(earthSpecularMap2),
            // reflectivity: 0.5,
            bumpMap: loader.load(earthBumpMap),
            bumpScale: 10000.0,
        });
        const earth = new THREE.Mesh(sphere, mat);
        // earth.scale.multiplyScalar(EARTH_DIAMETER);
        this.add(earth);

        // Clouds
        const cloudMat = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            alphaMap: cloudTex,
            transparent: true,
        });
        this.clouds = new THREE.Mesh(sphere, cloudMat);
        this.clouds.scale.multiplyScalar(1.01);
        this.add(this.clouds);
    }

    update() {
        this.rotation.y += this.rotationRate;
        this.clouds.rotation.y -= this.rotationRate * 0.5;
    }
}
