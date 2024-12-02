import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
export function map2(scene, car, light, ambientLight) {
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