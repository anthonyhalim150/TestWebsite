@ -1,38 +1,70 @@
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
export function map2(scene, car) {
    let light, ambientLight;
    let ground, ground_color, final_ground;
    let door_shape, door_color, door;
    // Clear the current scene
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
import { car_movement, check_car_movement, check_collision } from './map1.js';

// Variable declarations for map2
let scene_map2, camera_map2, renderer_map2;
let light_map2, ambientLight_map2;
let ground_map2, ground_color_map2, final_ground_map2;
let car_shape_map2, car_color_map2, car_map2;
let door_shape_map2, door_color_map2, door_map2;

// Function to create the scene and initialize variables for map2
export function create_map2() {
    scene_map2 = new THREE.Scene();
    camera_map2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer_map2 = new THREE.WebGLRenderer();
    renderer_map2.setSize(window.innerWidth, window.innerHeight);

    const container_map2 = document.getElementById('container');
    if (container_map2) {
        container_map2.appendChild(renderer_map2.domElement);
    } else {
        console.error("Container element not found");
    }
    light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    scene.add(light);

    ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add a new ground
    const newGround = new THREE.PlaneGeometry(50, 50);
    const newGroundMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa }); // Gray color for new ground
    const finalNewGround = new THREE.Mesh(newGround, newGroundMaterial);
    finalNewGround.rotation.x = -Math.PI / 2;
    scene.add(finalNewGround);

    // Add a new object (e.g., trees, obstacles)
    const treeGeometry = new THREE.CylinderGeometry(0.5, 0.5, 5);
    const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 }); // Green for trees
    const tree = new THREE.Mesh(treeGeometry, treeMaterial);
    tree.position.set(0, 2.5, 0); // Place the tree on the ground
    scene.add(tree);

    // Re-add the car to the new map
    car.position.set(0, 0.25, 0); // Reset car position
    scene.add(car);

    // Re-add lighting
    scene.add(light);
    scene.add(ambientLight);
}

    light_map2 = new THREE.DirectionalLight(0xffffff, 1);
    light_map2.position.set(10, 10, 10);
    scene_map2.add(light_map2);

    ambientLight_map2 = new THREE.AmbientLight(0xffffff, 0.5);
    scene_map2.add(ambientLight_map2);

    // New ground color (gray)
    ground_map2 = new THREE.PlaneGeometry(50, 50);
    ground_color_map2 = new THREE.MeshStandardMaterial({ color: 0x888888 }); // Gray color
    final_ground_map2 = new THREE.Mesh(ground_map2, ground_color_map2);
    final_ground_map2.rotation.x = -Math.PI / 2; // Make the ground horizontal
    scene_map2.add(final_ground_map2);

    // Car (no change to car color)
    car_shape_map2 = new THREE.BoxGeometry(2, 1, 4); // Main body
    car_color_map2 = new THREE.MeshStandardMaterial({ color: 0x000000 }); // Black color
    car_map2 = new THREE.Mesh(car_shape_map2, car_color_map2);
    car_map2.position.set(0, 0.5, 0); // Position the car body
    scene_map2.add(car_map2);

    // Camera setup
    camera_map2.position.set(0, 10, 20); // Position camera above and behind the ground
    camera_map2.lookAt(0, 0, 0); // Make the camera look at the scene center

    // New door color (red)
    door_shape_map2 = new THREE.BoxGeometry(5, 5, 0.4);
    door_color_map2 = new THREE.MeshStandardMaterial({ color: 0xFF0000 }); // Red color
    door_map2 = new THREE.Mesh(door_shape_map2, door_color_map2);
    door_map2.position.set(3, 0.25, 10);
    scene_map2.add(door_map2);
}

let keys_map2 = car_movement();

// Main animate function
export function animate_map2() {
    // Move car based on input
    check_car_movement();

    // Check for collision and switch to map1 if necessary

    // Render the scene
    renderer_map2.render(scene_map2, camera_map2);
    requestAnimationFrame(animate_map2);
}