import * as THREE from 'three';
import { map2 } from './map2.js';
import { create_camera, create_car, create_light, create_ground, create_door, check_collision } from './create.js'; 


export function map1(scene = null, car = null, movementSpeed = 0.1, rotationSpeed = 0.05) {
    let camera, renderer, door;

    if (!scene) {
        scene = new THREE.Scene();
    }

    if (!car) {
        car = create_car();
    }

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

    // Car
    car.position.set(0, 0.5, 0); // Reset car position
    scene.add(car);

    // Door
    door = create_door([5, 5, 0.4], 0x0000ff, [3, 0.25, 10]);
    scene.add(door);

    // Movement logic
    const keys = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
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
        if (keys.ArrowUp) {
            car.position.z += movementSpeed * Math.cos(car.rotation.y);
            car.position.x += movementSpeed * Math.sin(car.rotation.y);
        }
        if (keys.ArrowDown) {
            car.position.z -= movementSpeed * Math.cos(car.rotation.y);
            car.position.x -= movementSpeed * Math.sin(car.rotation.y);
        }
        if (keys.ArrowLeft) {
            car.rotation.y += rotationSpeed;
        }
        if (keys.ArrowRight) {
            car.rotation.y -= rotationSpeed;
        }

        camera.position.set(
            car.position.x - 10 * Math.sin(car.rotation.y),
            car.position.y + 8, // Higher for top-down view
            car.position.z - 10 * Math.cos(car.rotation.y)
        );
        camera.lookAt(car.position);

        if (check_collision(car, door)) {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);

            scene.clear(); // Clear the scene fully
            map2(scene, car, movementSpeed, rotationSpeed); // Switch to map2
            return;
        }

        renderer.render(scene, camera);
        requestAnimationFrame(animate_map1);
    }

    animate_map1();
}
map1();