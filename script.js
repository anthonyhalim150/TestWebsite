import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/loaders/GLTFLoader.js';


const loader = new GLTFLoader();//For loading


// Sets up the scene, camera, and renderer
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);


ground = new THREE.PlaneGeometry(50, 50);
ground_color = new THREE.MeshStandardMaterial({ color: 0x007700 });
finalGround = new THREE.Mesh(ground, ground_color);
finalGround.rotation.x = -Math.PI / 2; // Make the ground horizontal
scene.add(finalGround);

let car;
// Load custom car model
loader.load('car.glb', (gltf) => {
    car = gltf.scene;
    car.position.set(0, 0.25, 0); // Position the car
    scene.add(car); // Add to scene
});


camera.position.set(0, 10, 20); // Position camera above and behind the ground
camera.lookAt(0, 0, 0); // Make the camera look at the scene center

door_shape = new THREE.BoxGeometry(5, 5, 0.4);
door_color = new THREE.MeshStandardMaterial({color: 0x0000ff});
door = new THREE.Mesh(door_shape, door_color);
door.position.set(3,0.25,10);
scene.add(door);
// Movement variables
let movement_speed = 0.1; // Movement speed
let rotation_movement_speed = 0.05; // Rotation speed

// Handle keyboard input for car movement
 keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
};

document.addEventListener('keydown', (event) => {
    if (keys.hasOwnProperty(event.key)) keys[event.key] = true;
});
//When the key is pressed AKA keydown, the key in keys is set to True depending on the key chosen
//When the key is released, it sets it to false.
document.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.key)) keys[event.key] = false;
});

function check_collision(object1, object2) {
    const box1 = new THREE.Box3().setFromObject(object1); // Bounding box for object 1
    const box2 = new THREE.Box3().setFromObject(object2); // Bounding box for object 2
    return box1.intersectsBox(box2); // Check if the boxes intersect
}
function map2() {
    // Clear the current scene
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

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

function animate() {
    // Move car based on input
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
    if (check_collision(car, door)){
        map2();
    }
    // Render the scene
    renderer.render(scene, camera);

    // Request the next frame
    requestAnimationFrame(animate);
}

animate(); // Start the animation loop
