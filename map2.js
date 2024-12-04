import * as THREE from 'three';
import { map1 } from './map1.js';
import { create_camera, create_object, create_light, create_ground, create_door, check_collision } from './create.js'; // Import utilities

export function map2(scene = null, object_path = null, movementSpeed = 0.1, rotationSpeed = 0.05) {
    let camera, renderer, door, object;

    if (!scene) {
        scene = new THREE.Scene();
    }

    object = create_object(object_path);

    camera = create_camera(0, 10, 20);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    const container = document.getElementById('container');
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    scene.clear();

    const light = create_light('directional', 0xffffff, 1, [10, 10, 10]);
    scene.add(light);

    const ambientLight = create_light('ambient', 0xffffff, 0.5);
    scene.add(ambientLight);

    const ground = create_ground(50, 50, 0xaaaaaa);
    scene.add(ground);

    object.position.set(0, 0.5, 0);
    scene.add(object);

    door = create_door([5, 5, 0.4], 0xff0000, [10, 0.25, 10]);
    scene.add(door);

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
    
    function animate_map2() {
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
            object.position.y + 5,
            object.position.z - 10 * Math.cos(object.rotation.y)
        );
        camera.lookAt(object.position);

        if (check_collision(object, door)) {
            scene.clear();
            map1();
            return;
        }

        renderer.render(scene, camera);
        requestAnimationFrame(animate_map2);
    }

    animate_map2();
}
