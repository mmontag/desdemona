import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import starfieldVert from './starfield_vert.glsl';
import starfieldFrag from './starfield_frag.glsl';
import gridVert from './grid_vert.glsl';
import gridFrag from './grid_frag.glsl';
import {VRButton} from 'three/examples/jsm/webxr/VRButton.js';

const nearClip = 1e-7;
const farClip = 1e8;
const minDistance = 1.01e0;  // Just above threshold
const maxDistance = 0.99e27; // Just below threshold

const params = (new URL(document.URL)).searchParams;
const isVrEnabled = !!params.get('vr');
const scene = new THREE.Scene();

const origin = new THREE.Vector3(0, 0, 0);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, nearClip, farClip);
camera.position.z = 500;
camera.position.y = 500;

const renderer = new THREE.WebGLRenderer({antialias: true, logarithmicDepthBuffer: true});
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotateSpeed = 0.2;
controls.minDistance = minDistance;
controls.maxDistance = maxDistance;

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

function getStarMaterial(color: number, farplane: number, size: number) {
    return new THREE.ShaderMaterial({
        uniforms: {
            color: {value: new THREE.Color(color)},
            farplane: {value: farplane},
            size: {value: size},
        },
        vertexShader: starfieldVert,
        fragmentShader: starfieldFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });
}

const starMatBig = getStarMaterial(0xffffff, 200000, 1000.0);
const starMatTiny = getStarMaterial(0xffffff, 200, 0.01);

const plane = new THREE.PlaneGeometry(1e4, 1e4, 100, 100);

plane.rotateX(-Math.PI / 2);
const gridMat = new THREE.ShaderMaterial({
    uniforms: {
        logDist: {value: 1}
    },
    vertexShader: gridVert,
    fragmentShader: gridFrag,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
});
const planeMesh = new THREE.Mesh(plane, gridMat);
scene.add(planeMesh);

// Point Cubes (size reference)

// const geometry = new THREE.BoxGeometry(5, 5, 5, 9, 9, 9);
// scene.add(new THREE.Points(geometry, starMatBig));
//
// const geo2 = new THREE.BoxGeometry(.05, .05, .05, 5, 5, 5);
// scene.add(new THREE.Points(geo2, starMatTiny));


const points = makePoints(500000, 1e6);
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

    const logDist = Math.log10(camera.position.distanceTo(origin));
    gridMat.uniforms.logDist.value = logDist;
    const gridSize = Math.pow(10, Math.floor(logDist));
    planeMesh.scale.set(gridSize, 1, gridSize);

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


function makePoints(numPoints: number, boundingSize: number) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const magnitude = [];
    const color = new THREE.Color();
    const n = boundingSize;
    const n2 = n / 2; // particles spread in the cube

    for (let i = 0; i < numPoints; i++) {
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

    return new THREE.Points(geometry, starMatBig);
}
