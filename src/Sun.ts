import * as THREE from "three";
import sunVert from "./sun_vert.glsl";
import sunFrag from "./sun_frag.glsl";
import glowVert from "./glow_vert.glsl";
import glowFrag from "./glow_frag.glsl";
import {ShaderMaterial} from "three";

// TODO: pass as constructor arguments?
const sphere = new THREE.SphereGeometry(0.5, 24, 24);

export class Sun extends THREE.Group {
    private rotationRate: number;
    mat: ShaderMaterial;

    constructor() {
        super();

        this.rotationRate = 0.0001;

        // Surface
        this.mat = new THREE.ShaderMaterial({
            uniforms: {
                time: {value: 0},
                resolution: {value: new THREE.Vector4()},
                distance: {value: 1},
            },
            depthWrite: true,
            depthTest: true,
            transparent: false,
            opacity: 1.0,
            vertexShader: sunVert,
            fragmentShader: sunFrag,
        });
        const mesh = new THREE.Mesh(sphere, this.mat);
        this.add(mesh);

        // Glow
        const glowMat = new THREE.ShaderMaterial({
            depthWrite: false,
            depthTest: true,
            side: THREE.BackSide,
            transparent: true,
            opacity: 1.0,
            vertexShader: glowVert,
            fragmentShader: glowFrag,
            blending: THREE.AdditiveBlending,
        });
        const glowMesh = new THREE.Mesh(sphere, glowMat);
        glowMesh.scale.multiplyScalar(1.25);
        this.add(glowMesh);
    }

    update() {
        // Rotation causes glow to get messed up
        // this.rotation.y += this.rotationRate;
    }
}
