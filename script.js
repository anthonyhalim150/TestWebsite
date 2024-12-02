import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { map2 } from './map2.js';


// Variable declarations
let scene, camera, renderer;
let light, ambientLight;
let ground, ground_color, final_ground;
let car_shape, car_color, car;
let door_shape, door_color, door;

scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);


const container = document.getElementById('container');
if (container) {
    container.appendChild(renderer.domElement);
} else {
    console.error("Container element not found");
}

light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

ground = new THREE.PlaneGeometry(50, 50);
ground_color = new THREE.MeshStandardMaterial({ color: 0x007700 });
final_ground = new THREE.Mesh(ground, ground_color);
final_ground.rotation.x = -Math.PI / 2; // Make the ground horizontal
scene.add(final_ground);

car_shape = new THREE.BoxGeometry(2, 1, 4); // Main body
car_color = new THREE.MeshStandardMaterial({ color: 0x000000 }); // Black color
car = new THREE.Mesh(car_shape, car_color);
car.position.set(0, 0.5, 0); // Position the car body
scene.add(car);

camera.position.set(0, 10, 20); // Position camera above and behind the ground
camera.lookAt(0, 0, 0); // Make the camera look at the scene center

door_shape = new THREE.BoxGeometry(5, 5, 0.4);
door_color = new THREE.MeshStandardMaterial({ color: 0x0000ff });
door = new THREE.Mesh(door_shape, door_color);
door.position.set(3, 0.25, 10);
scene.add(door);

// Movement variables
let movement_speed = 0.1; // Movement speed
let rotation_movement_speed = 0.05; // Rotation speed

// Handle keyboard input for car movement
// Function to track keyboard input
function car_movement() {
    const keys = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
    };

    // Listen for keydown event
    document.addEventListener('keydown', (event) => {
        if (keys.hasOwnProperty(event.key)) {
            keys[event.key] = true;
        }
    });

    // Listen for keyup event
    document.addEventListener('keyup', (event) => {
        if (keys.hasOwnProperty(event.key)) {
            keys[event.key] = false;
        }
    });

    // Return the keys object to allow access from outside the function
    return keys;
}


function check_collision(object1, object2) {
    const box1 = new THREE.Box3().setFromObject(object1); // Bounding box for object 1
    const box2 = new THREE.Box3().setFromObject(object2); // Bounding box for object 2
    return box1.intersectsBox(box2); // Check if the boxes intersect
}
let keys = car_movement();
function check_car_movement(){
    if (keys.ArrowUp) {
        car.position.z -= movement_speed * Math.cos(car.rotation.y);
        car.position.x -= movement_speed * Math.sin(car.rotation.y);
    }
    if (keys.ArrowDown) {
        car.position.z += movement_speed * Math.cos(car.rotation.y);
        car.position.x += movement_speed * Math.sin(car.rotation.y);
    }
    if (keys.ArrowLeft) {
        car.rotation.y += rotation_movement_speed;
    }
    if (keys.ArrowRight) {
        car.rotation.y -= rotation_movement_speed;
    }
}
function animate() {
    // Move car based on input
    check_car_movement();
    
    if (check_collision(car, door)) {
        map2(scene, car)
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate(); // Start the animation loop
