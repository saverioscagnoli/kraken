import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.127/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.127/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.127/examples/jsm/loaders/GLTFLoader.js";

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const loader = new GLTFLoader();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  screenWidth / screenHeight,
  0.1,
  1000
);
camera.position.y = 40;
camera.position.z = 67;
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canvas"),
  antialias: true,
});
const controls = new OrbitControls(camera, renderer.domElement);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(screenWidth, screenHeight);

const hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 1);
scene.add(hemiLight);

const sunlight = new THREE.DirectionalLight(0xffffff, 1);
sunlight.position.y = 50;
scene.add(sunlight);

const seaGeometry = new THREE.PlaneGeometry(400, 400, 50, 50);
const seaMaterial = new THREE.MeshPhongMaterial({
  color: "#00234A",
  side: THREE.DoubleSide,
  flatShading: THREE.FlatShading,
});
const seaMesh = new THREE.Mesh(seaGeometry, seaMaterial);
seaMesh.rotateX(-Math.PI / 2);
scene.add(seaMesh);

const seaVertices = seaMesh.geometry.attributes.position.array;
const randomValues = [];

for (let i = 0; i < seaVertices.length; i++) {
  const x = seaVertices[i];
  const y = seaVertices[i + 1];
  const z = seaVertices[i + 2];

  if (i % 3 == 0) {
    seaVertices[i] = x + Math.random() - 0.5;
    seaVertices[i + 1] = y + Math.random() - 0.5;
    seaVertices[i + 2] = (z + Math.random() - 0.5) * 3;
  }
  randomValues.push(Math.random() * Math.PI * 2);
}
seaMesh.geometry.attributes.position.randomValues = randomValues;
seaMesh.geometry.attributes.position.originalPosition =
  seaMesh.geometry.attributes.position.array;

const originalPosition = seaMesh.geometry.attributes.position.originalPosition;

let ship = new THREE.Object3D();
loader.load("assets/scene.gltf", (gltf) => {
  ship = gltf.scene.children[0].children[0].children[0];
  ship.remove(ship.children[0]);
  ship.scale.set(3, 3, 3);

  ship.position.x = 34;
  ship.position.y = 4;

  ship.rotation.y = Math.PI / 2;
  ship.rotation.x = -0.15;
  scene.add(ship);
});

const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
});

const starVertices = [];
for (let i = 0; i < 5000; i++) {
  let x = (Math.random() - 0.5) * 2000;
  let y = (Math.random() - 0.5) * 2000;
  let z = (Math.random() - 0.5) * 2000;

  starVertices.push(x, y, z);
}
starGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starVertices, 3)
);
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

let frame = 0;
function animate() {
  requestAnimationFrame(animate);
  frame += 0.01;

  for (let i = 0; i < seaVertices.length; i += 3) {
    seaVertices[i] =
      originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.01;

    seaVertices[i + 1] =
      originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.02;
  }
  seaMesh.geometry.attributes.position.needsUpdate = true;
  controls.update();
  renderer.render(scene, camera);
}

animate();
