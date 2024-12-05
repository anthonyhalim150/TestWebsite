import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';



export function create_object(path = null, scale_factor = 0.5, body_shape = [2, 1, 4], body_color = 0x000000, position = [0, 0.5, 5]) {
    return new Promise((resolve, reject) => {
        const loading = document.getElementById('loading-screen');
        loading.style.display = 'flex';  // Show loading screen
        if (path) {
            const loader = new GLTFLoader();
            loader.load(
                path,
                function (gltf) {
                    const object = gltf.scene;
                    object.scale.set(scale_factor, scale_factor, scale_factor);
                    object.position.set(...position);
                    loading.style.display = 'none';
                    resolve(object);
                },
                undefined,
                function (error) {
                    console.error('Error loading model:', error);
                    reject(error);
                }
            );
        } else {
            const shape = new THREE.BoxGeometry(...body_shape);
            const material = new THREE.MeshStandardMaterial({ color: body_color });
            const object = new THREE.Mesh(shape, material);
            loading.style.display = 'none';
            resolve(object);
        }
    });
}






export function create_camera(x = 0, y = 0, z = 0, aspectRatio = window.innerWidth / window.innerHeight) {
    const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    camera.position.set(x, y, z);
    return camera;
}

export function create_light(type = 'directional', color = 0xffffff, intensity = 1, position = [10, 10, 10]) {
    let light;
    if (type === 'directional') {
        light = new THREE.DirectionalLight(color, intensity);
    } else if (type === 'ambient') {
        light = new THREE.AmbientLight(color, intensity);
    }
    light.position.set(...position);
    return light;
}

export function create_ground(width = 50, height = 50, color = 0x007700) {
    const ground = new THREE.PlaneGeometry(width, height);
    const ground_color = new THREE.MeshStandardMaterial({ color });
    const ground_mesh = new THREE.Mesh(ground, ground_color);
    ground_mesh.rotation.x = -Math.PI / 2; // Make horizontal
    return ground_mesh;
}

export function create_door(dimensions = [5, 5, 0.4], color = 0x0000ff, position = [3, 0.25, 10]) {
    const door_shape = new THREE.BoxGeometry(...dimensions);
    const door_color = new THREE.MeshStandardMaterial({ color });
    const door = new THREE.Mesh(door_shape, door_color);
    door.position.set(...position);
    return door;
}

export function check_collision(object1, object2) {
    const box1 = new THREE.Box3().setFromObject(object1);
    const box2 = new THREE.Box3().setFromObject(object2);
    return box1.intersectsBox(box2);
}