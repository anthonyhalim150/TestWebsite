import * as THREE from 'three';
import { map2 } from './map2.js';
import { create_camera, create_object, create_light, create_ground, create_door, check_collision } from './create.js'; 


export function map1(scene = null, object_path = null, movementSpeed = 0.1, rotationSpeed = 0.05) {
    let camera, renderer, door, object;

    if (!scene) {
        scene = new THREE.Scene();
    }
    object = create_object(object_path);

    camera = create_camera(0, 10, 20);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    const container = document.getElementById('container');
    container.innerHTML = ''; // Clear the container DOM
    container.appendChild(renderer.domElement);

    // Clear any existing scene
    scene.clear();

    // Lighting
    const light = create_light('directional', 0xffffff, 1, [10, 10, 10]);
    scene.add(light);

    const ambientLight = create_light('ambient', 0xffffff, 0.5);
    scene.add(ambientLight);

    // Ground
    const ground = create_ground();
    scene.add(ground);

    // object
    object.position.set(0, 0.5, 0); // Reset object position
    scene.add(object);

    // Door
    door = create_door([5, 5, 0.4], 0x0000ff, [3, 0.25, 10]);
    scene.add(door);

    // Movement logic
    const keys = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        w: false, 
        a: false,  
        s: false,  
        d: false   
    };

    function handleKeyDown(event) {
        if (keys.hasOwnProperty(event.key)) keys[event.key] = true;
    }

    function handleKeyUp(event) {
        if (keys.hasOwnProperty(event.key)) keys[event.key] = false;
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    function animate_map1() {
        if (keys.ArrowUp || keys.w) {
            object.position.z += movementSpeed * Math.cos(object.rotation.y);
            object.position.x += movementSpeed * Math.sin(object.rotation.y);
        }
        if (keys.ArrowDown || keys.s) {
            object.position.z -= movementSpeed * Math.cos(object.rotation.y);
            object.position.x -= movementSpeed * Math.sin(object.rotation.y);
        }
        if (keys.ArrowLeft || keys.a) {
            object.rotation.y += rotationSpeed;
        }
        if (keys.ArrowRight || keys.d) {
            object.rotation.y -= rotationSpeed;
        }

        camera.position.set(
            object.position.x - 10 * Math.sin(object.rotation.y),
            object.position.y + 8, // Higher for top-down view
            object.position.z - 10 * Math.cos(object.rotation.y)
        );
        camera.lookAt(object.position);

        if (check_collision(object, door)) {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);

            scene.clear(); // Clear the scene fully
            map2(); // Switch to map2
            return;
        }

        renderer.render(scene, camera);
        requestAnimationFrame(animate_map1);
    }

    animate_map1();
}
map1();