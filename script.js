//Sets up the scene, camera, and renderer
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera();
renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);
//Add lighting
light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);
//Add ground
ground = new THREE.PlaneGeometry(50, 50);
ground_foundation = new THREE.MeshStandardMaterial({color: 0x007700});
final_ground = new THREE.Mesh(ground, ground_foundation);
//Make ground horizontal
final_ground.rotation.x = -Math.pi/2;
scene.add(final_ground);

light = new THREE.DirectionalLight(0xffffff,1);
light.position.set(10, 10, 10);
scene.add(light);

ambient_light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient_light)

function start_animation(){
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}



start_animation();