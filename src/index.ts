import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
// @ts-ignore
import starfieldVert from './starfield_vert.glsl';
import starfieldFrag from './starfield_frag.glsl';
import gridVert from './grid_vert.glsl';
import gridFrag from './grid_frag.glsl';
import {VRButton} from 'three/examples/jsm/webxr/VRButton.js';

const params = (new URL(document.URL)).searchParams;
const isVrEnabled = !!params.get('vr');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.00000001, 500000);
camera.position.z = 50;
// camera.far = 99999;

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotateSpeed = 0.2;

renderer.xr.enabled = isVrEnabled;
renderer.xr.setFramebufferScaleFactor(4.0);
renderer.xr.getCamera().far = 50000;
renderer.xr.getCamera().cameras.map(c => c.far = 50000);
if (isVrEnabled) {
    document.body.appendChild(VRButton.createButton(renderer));
    // renderer.xr.setFramebufferScaleFactor(4);

} else {
    controls.autoRotate = true;
}

document.body.appendChild(renderer.domElement);


// const geometry = new THREE.SphereGeometry(5);

// const material = new THREE.MeshBasicMaterial({
//     color: 0x00ffa0,
//     wireframe: true,
// });
// const numVerts = geometry.attributes.position.count;
// const alphas = new Float32Array(numVerts);
// for (let i = 0; i < numVerts; i++) {
//     // set alpha randomly
//     alphas[i] = 0.5;
// }
// geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

const shaderMat = new THREE.ShaderMaterial({
    uniforms: {
        color: {value: new THREE.Color(0xffffff)},
        farplane: {value: 200},
        size: {value: 1.0},
    },
    vertexShader: starfieldVert,
    fragmentShader: starfieldFrag,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
});

const shaderMat2 = new THREE.ShaderMaterial({
    uniforms: {
        color: {value: new THREE.Color(0xffffff)},
        farplane: {value: 200},
        size: {value: 0.01},
    },
    vertexShader: starfieldVert,
    fragmentShader: starfieldFrag,
    // transparent: true,
    // depthWrite: false,
    // blending: THREE.AdditiveBlending,
});

const plane = new THREE.PlaneGeometry(10000, 10000, 10, 10);
plane.rotateX(-Math.PI / 2);
// const glsl = x => x;
scene.add(new THREE.Mesh(plane, new THREE.ShaderMaterial({
    vertexShader: gridVert,
    fragmentShader: gridFrag,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
})));

const geometry = new THREE.BoxGeometry(5, 5, 5, 9, 9, 9);
scene.add(new THREE.Points(geometry, shaderMat));

const geo2 = new THREE.BoxGeometry(.05, .05, .05, 5, 5, 5);
scene.add(new THREE.Points(geo2, shaderMat2));


const points = makePoints();
scene.add(points);

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

function animate() {
    requestAnimationFrame(animate);

    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;

    controls.update();

    // const alphas = geometry.attributes.alpha;
    // const count = alphas.count;
    // for( var i = 0; i < count; i ++ ) {
    //     // dynamically change alphas
    //     // @ts-ignore
    //     alphas.array[ i ] *= 0.97;
    //     if ( alphas.array[ i ] < 0.1 ) {
    //         // @ts-ignore
    //         alphas.array[ i ] = .5;
    //     }
    // }
    // alphas.needsUpdate = true; // important!

    render();
}

if (isVrEnabled) {
    renderer.setAnimationLoop(function () {
        renderer.render(scene, camera);
    });
} else {
    animate();
}

function render() {
    renderer.render(scene, camera);
}


function makePoints() {
    const particles = 500000;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const magnitude = [];
    const color = new THREE.Color();
    const n = 1000,
        n2 = n / 2; // particles spread in the cube

    for (let i = 0; i < particles; i++) {
        // positions
        const x = Math.random() * n - n2;
        const y = Math.random() * n - n2;
        const z = Math.random() * n - n2;
        positions.push(x, y, z);

        // colors
        const vx = x / n + 0.5;
        const vy = y / n + 0.5;
        const vz = z / n + 0.5;
        color.setRGB(vx, vy, vz);
        colors.push(color.r, color.g, color.b, Math.random() * 0.7 + 0.3);

        magnitude.push(Math.random() * 0.7 + 0.3);
    }

    geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
    geometry.computeBoundingSphere();

    const material = new THREE.PointsMaterial({
        size: 2,
        sizeAttenuation: false,
        // opacity: 0.25,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    return new THREE.Points(geometry, shaderMat);
}
