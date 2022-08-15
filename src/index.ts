import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import starfieldVert from './starfield_vert.glsl';
import starfieldFrag from './starfield_frag.glsl';
import gridVert from './grid_vert.glsl';
import gridFrag from './grid_frag.glsl';
import glowVert from './glow_vert.glsl';
import glowFrag from './glow_frag.glsl';
import sunVert from './sun_vert.glsl';
import sunFrag from './sun_frag.glsl';
import {VRButton} from 'three/examples/jsm/webxr/VRButton.js';
import GUI from 'lil-gui';
// @ts-ignore
import {Text} from 'troika-three-text';
import {BackSide, sRGBEncoding} from "three";
import {Earth} from "./Earth";
import {Moon} from "./Moon";
// @ts-ignore
// import ThreeMeshUI from 'three-mesh-ui';
// import * as ThreeMeshUI from 'three-mesh-ui/build/three-mesh-ui.module.js';

const sunDiffuseMap = require('./assets/2k_sun.jpg');

const gui = new GUI();

const nearClip = 1e-7;
const farClip = 1e27;
const minDistance = 1.01e0;  // Just above threshold
const maxDistance = 0.99e27; // Just below threshold

const params = (new URL(document.URL)).searchParams;
const isVrEnabled = !!params.get('vr');

const scene = new THREE.Scene();
// scene.add(new THREE.AmbientLight(0x111111));
const light = new THREE.DirectionalLight(0xffffff, 6);
light.position.set(100, 100, 100);
scene.add(light);

// const light2 = new THREE.PointLight(0xffffff, 2000000);
// light2.position.set(1000, 1000, 1000000);
// scene.add(light2);
// scene.background = new THREE.Color( 0xefd1b5 );
// scene.fog = new THREE.FogExp2( 0xefd1b5, 0.000001 );

const origin = new THREE.Vector3(0, 0, 0);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, nearClip, farClip);

// 1 meter
// camera.position.x = -1;
// camera.position.y = 0.75;
// camera.position.z = 2;

// Earth
camera.position.x = -10000000;
camera.position.y = 7500000;
camera.position.z = 20000000;


const renderer = new THREE.WebGLRenderer({antialias: true, logarithmicDepthBuffer: true});
renderer.setSize(window.innerWidth, window.innerHeight);

// See https://www.donmccurdy.com/2020/06/17/color-management-in-threejs/
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.physicallyCorrectLights = true;

const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotateSpeed = 0.0;
controls.minDistance = minDistance;
controls.maxDistance = maxDistance;

renderer.xr.enabled = isVrEnabled;
renderer.xr.setFramebufferScaleFactor(4.0);
renderer.xr.getCamera().far = maxDistance;
renderer.xr.getCamera().cameras.map(c => c.far = maxDistance);
if (isVrEnabled) {
    document.body.appendChild(VRButton.createButton(renderer));
} else {
    controls.autoRotate = true;
}

document.body.appendChild(renderer.domElement);


// const container = new ThreeMeshUI.Block({
//     width: 1.2,
//     height: 0.7,
//     padding: 0.2,
//     fontFamily: './assets/Roboto-msdf.json',
//     fontTexture: './assets/Roboto-msdf.png',
// });
//
// const text = new ThreeMeshUI.Text({
//     content: "Some text to be displayed"
// });
// container.add( text );
//
// // scene is a THREE.Scene (see three.js)
// scene.add( container );
//
// // This is typically done in the render loop :
// ThreeMeshUI.update();


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
        logDist: {value: 1},
        intensity: {value: 0.33}
    },
    vertexShader: gridVert,
    fragmentShader: gridFrag,
    transparent: true,
    depthWrite: true,
    depthTest: true,
    // blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    opacity: 1.0,
});
const planeMesh = new THREE.Mesh(plane, gridMat);
planeMesh.renderOrder = 1000;
scene.add(planeMesh);

// TODO: figure out ThreeJS idiomatic way to do this; propagate the update loop
const sceneGraph: Array<Earth|Moon> = [];

const loader = new THREE.TextureLoader();
const sunTex = loader.load(sunDiffuseMap);
sunTex.encoding = THREE.sRGBEncoding;
const sunMat = new THREE.ShaderMaterial({
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
const bodies = [
    // { size: .01, scale: 0.0001, label: 'microscopic (1µm)' }, // FIXME - triangulating text fails at this size, so we scale instead
    // { size: .01, scale: 0.1, label: 'minuscule (1mm)' },
    // { size: .01, scale: 1.0, label: 'tiny (1cm)' },
    {size: 1, scale: 1.0, label: '1 meter'},
    {size: 10, scale: 1.0, label: 'tree-sized (10m)'},
    {size: 100, scale: 1.0, label: 'building-sized (100m)'},
    {size: 1000, scale: 1.0, label: 'a kilometer (1km)'},
    {size: 10000, scale: 1.0, label: 'city-sized (10km)'},
    {
        label: 'Moon (3,400 km)',
        size: 3400000,
        model: new Moon(),
    },
    {
        label: 'Earth (12,700 km)',
        size: 12742000,
        model: new Earth(),
    },
    {
        label: 'Sun (1,391,000 km)',
        size: 1391000000,
        scale: 1.0,
        material: sunMat,
    },
    // {
    //     label: 'sun-sized (1,400,000 km)',
    //     size: 1391000000,
    //     scale: 1.0,
    //     material: new THREE.MeshPhongMaterial({
    //         map: sunTex,
    //         emissiveMap: sunTex,
    //         emissive: 0xffffff,
    //         shininess: 0,
    //     }),
    // },
    {size: 7.47e12, scale: 1.0, label: 'solar system-sized (50Au)'},
    {size: 9.4605284e15, scale: 1.0, label: 'gargantuan (1 light year)'},
    {size: 3.08567758e16, scale: 1.0, label: 'ludicrous (1 parsec)'},
    {size: 1e18, scale: 1.0, label: 'mind boggling (100 light years)'}
];

const sphere = new THREE.SphereGeometry(0.5, 24, 24);
let runningPosition = 0;
const spacingFactor = 1.0;
for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i];
    const group = new THREE.Group();
    // group.position.x += Math.pow(body.size, 0.96);
    group.position.y += body.size * 0.5;
    group.position.z = runningPosition - body.size * 0.5; //(Math.pow(body.size, 1) + lastSize);
    const spacing = body.size * spacingFactor;
    runningPosition = group.position.z - body.size * 0.5 - spacing;
    scene.add(group);

    const scale = body.scale || 1;
    const color = new THREE.Color().setHSL((i % 10) / 10, 0.5, 0.6).convertSRGBToLinear();
    const mat = new THREE.MeshPhongMaterial({
        color: color,
        specular: 0x050505,
        shininess: 50,
        emissive: 0,
    });
    // Text Label
    const label = new Text();
    label.position.y -= body.size * 0.5;
    label.position.z += body.size * 0.5;
    label.text = body.label;
    label.fontSize = body.size * 0.2;
    label.anchorY = 'bottom';
    label.anchorX = 'center';
    label.color = 0xc0c0c0;
    label.sync();
    group.add(label);

    // Sphere Geometry
    let bodymesh;
    if (body.model) {
        bodymesh = body.model;
        sceneGraph.push(body.model);
    } else if (body.material) {
        bodymesh = new THREE.Mesh(sphere, body.material);
        body.material.needsUpdate = true;

        if (body.label.includes('Sun')) {
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
            glowMesh.scale.multiplyScalar(body.size * 1.25);
            group.add(glowMesh);
        }
    } else {
        bodymesh = new THREE.Mesh(sphere, mat);
    }
    bodymesh.scale.multiplyScalar(body.size);
    group.add(bodymesh);
}


const gridFolder = gui.addFolder('Grid');
gridFolder.add(gridMat.uniforms.intensity, 'value', 0, 1).name('intensity');
gridFolder.add(planeMesh, 'visible');
gui.add(controls, 'autoRotateSpeed', 0, 1);

// Point Cubes (size reference)

// const geometry = new THREE.BoxGeometry(5, 5, 5, 9, 9, 9);
// scene.add(new THREE.Points(geometry, starMatBig));
//
// const geo2 = new THREE.BoxGeometry(.05, .05, .05, 5, 5, 5);
// scene.add(new THREE.Points(geo2, starMatTiny));


// const points = makePoints(5e5, 1e6);
// scene.add(points);

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

let speed = 0.1;

function animate() {
    requestAnimationFrame(animate);

    sceneGraph.forEach(s => s.update());

    controls.update();

    // Accelerate to speed of light.
    speed = Math.min(300000, speed * 1.01);
    // Fly away at speed of light.
    // camera.position.sub(camera.getWorldDirection(origin).multiplyScalar(speed));

    const logDist = Math.log10(camera.position.distanceTo(origin));
    gridMat.uniforms.logDist.value = logDist;
    const gridSize = Math.pow(10, Math.floor(logDist));
    planeMesh.scale.set(gridSize, 1, gridSize);

    sunMat.uniforms.distance.value = camera.position.distanceTo(origin);

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

    // for the Sun shader
    sunMat.uniforms.time.value += 0.05;
    sunMat.needsUpdate = true;

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
