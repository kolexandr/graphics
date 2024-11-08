/* ----------------------------------------------------------
WebGL App, Vytautas Magnus University, faculty of Informatics
---------------------------------------------------------- */


import * as THREE from './build/three.module.js';
import Stats from './libs/stats.module.js';
import { OrbitControls } from './controls/OrbitControls.js';
import { GUI } from './libs/lil-gui.module.min.js'; //lib for control menu
import TWEEN from './libs/tween.module.js';
import { createMultiMaterialObject } from './utils/SceneUtils.js';
import { GLTFLoader } from './loaders/GLTFLoader.js';
// import { FBXLoader } from './loaders/FBXLoader.js';

const mainContainer = document.getElementById('webgl-scene');
const fpsContainer = document.getElementById('fps');
let stats = null;
let scene, camera, renderer = null;
let camControls = null;

let plane, box, sphere, wheel, capsule, shirt, pants, nose, cone, house, cylinder, grass, roof, road1, road2 = null;

let wheel_pant1, wheel_pant2, eye1, eye2, eye1_blue, eye2_blue, eye1_black, eye2_black, wheel_shirt1, wheel_shirt2, leg1, leg2, arm1, arm2, cheek1, cheek2 = null;

let smile, tie_sphere, tie_conus1, tie_conus2, tooth1, tooth2, sphere_boot1, sphere_boot2, sphere_boot3, sphere_boot4, box_boot1, box_boot2, eye_brow1, eye_brow2, eye_brow3, eye_brow4, eye_brow5, eye_brow6, belt1, belt2, belt3, shirt_plane1, shirt_plane2 = null;

let shell, body_gary, eye_capsule1, eye_capsule2, gary_eye1, gary_eye2, gary_eye_red1, gary_eye_red2, gary_eye_black1, gary_eye_black2, gary_smile = null;

let cylinder_hat, bottom_hat, rope_hat, rope_hat_torus1, rope_hat_torus2, ghost= null;

let witch_hat= new THREE.Group();

let right_hand= new THREE.Group();

let gary_character = new THREE.Group();

// mr krab
let krab = new THREE.Group();
const mixers = [];
const clock = new THREE.Clock();

//sound
let listener=null;
let sound = null;
let sound_2 = null;
let audioLoader = null;
// let audioLoader_2 = null; 
// let controlBoxParams = {
// 	soundon: false
// };

//raycasting
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let intersects;

// control menu
let menu = new GUI();
let menuParams = {
	//rotationSpeed: 10,
	ghostPosX: 0,
	ghost_size: 50,
	soundon: false
};


// Light sources
let dirLight, spotLight, ambientLight = null;

// Scene
function createScene(){
	scene = new THREE.Scene();
	const background = new THREE.TextureLoader().load("textures/sky.png")
	background.colorSpace = THREE.SRGBColorSpace;
	let skyGeometry = new THREE.SphereGeometry(700, 32, 32);
	let skyMaterial = new THREE.MeshBasicMaterial({map : background, side: THREE.BackSide});
	let skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
	skyBox.position.y=50;
	scene.add(skyBox);
	//scene.background = new THREE.Color( 0x1F85DE );
}

// FPS counter
function createStats(){
	stats = new Stats();
	stats.showPanel( 0 );	// 0: fps, 1: ms, 2: mb, 3+: custom
	fpsContainer.appendChild( stats.dom );
}

// Camera
function createPerspectiveCamera(){
	const fov = 45;
	const aspect =  mainContainer.clientWidth / mainContainer.clientHeight;
	const near = 0.1;
	const far = 1400;	
	camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	// camera.position.x = 300;
	// camera.position.y = 250;
	// camera.position.z = 300;
	camera.position.x = -150;
	camera.position.y = 50;
	camera.position.z = 100;
	camera.lookAt(scene.position); // 50, 40, 70 scene.position
}

// Interactive controls
function createControls(){
	camControls = new OrbitControls(camera, mainContainer);
	camControls.autoRotate = false;
}

// Create directional - sun light
function createDirectionalLight(){
	dirLight = new THREE.DirectionalLight( 0xffffff); //0xffffff
	dirLight.position.set( -50, 150, 70 ); // -10 20 10
	dirLight.intensity = 1; 
	// set light coverag`e
	dirLight.shadow.camera.near = 0.5;      // default
	dirLight.shadow.camera.far = 300;   //50   	 default
	dirLight.shadow.camera.left = -200; //-20
	dirLight.shadow.camera.top = 200;
	dirLight.shadow.camera.right = 200;
	dirLight.shadow.camera.bottom = -200;
	dirLight.shadow.mapSize.width = 1024;  	// default 512
	dirLight.shadow.mapSize.height = 1024; 	// default 512
	dirLight.castShadow = true;
	scene.add( dirLight );

	// adds helping lines
	// const dirLightHelper = new THREE.DirectionalLightHelper( dirLight, 3, 0xcc0000 );
	// scene.add( dirLightHelper );
	// scene.add(new THREE.CameraHelper(dirLight.shadow.camera));
}

function createSpotLight(){
	spotLight = new THREE.SpotLight( 0xffffff );
	spotLight.position.set( -7, 53, 10 );
	// lighting params
	spotLight.intensity = 10; //5
	spotLight.distance = 60; //50
	spotLight.angle = Math.PI/4;
	//spotLight.angle = Math.PI/3;
	spotLight.penumbra = 0.7; 	// 0 - 1
	spotLight.decay = 0.2; 		// how quickly light dimishes
	// Makes the shadows with less blurry edges
	spotLight.shadow.mapSize.width = 512; // default 512 1024
	spotLight.shadow.mapSize.height = 512;	//default 512 1024
	// enable shadows for light source
	spotLight.castShadow = true;
	scene.add( spotLight );
	// set light target to sphere
	// if(sphere != null){
	// 	spotLight.target = sphere;
	// 	spotLight.target.updateMatrixWorld();
	// }

	// adds helping lines
	//const spotLightHelper = new THREE.SpotLightHelper( spotLight, 0xcc0000 );
	//scene.add( spotLightHelper );	
}

// Create ambient light
function createAmbientLight(){
	ambientLight = new THREE.AmbientLight( 0xffffff, 0.2 ); 
	scene.add( ambientLight );
}

// add axes (red – x, green – y, blue - z)
function createAxes(){
	const axes = new THREE.AxesHelper( 10 );
	scene.add(axes);
}

// creating plane
function createPlane(){
	// const texture= new THREE.TextureLoader().load("textures/sand_true.png");
	const texture= new THREE.TextureLoader().load("textures/snow_2.jpg");
	texture.colorSpace= THREE.SRGBColorSpace;
	texture.anisotropy= 16;
	texture.magFilter = THREE.LinearFilter;
	texture.minFilter = THREE.LinearMipMapLinearFilter;
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(4, 4);
	const geometry = new THREE.PlaneGeometry(520, 520); //100, 80
	const material =  new THREE.MeshStandardMaterial({map: texture, side: THREE.DoubleSide});
	plane = new THREE.Mesh(geometry, material);
	plane.rotation.x = -0.5*Math.PI;
	plane.position.x = 0;
	plane.position.y = 0;
	plane.position.z = 0;
  // make the plane to receive shadows from other objects
	plane.receiveShadow = true;
	// add plane to the scene
	scene.add(plane);	
}

function createHouse(){
	const texture = new THREE.TextureLoader().load("textures/spongebobs_house.png");
	texture.colorSpace= THREE.SRGBColorSpace;
	texture.anisotropy= 16;
	const geometry = new THREE.CapsuleGeometry(80, 80, 20, 20);
	//const geometry_2 = new THREE.CylinderGeometry(44, 53, 70, 20, 20 );
	const geometry_2 = new THREE.CylinderGeometry(49.5, 49.5, 70, 20, 20 );
	const material = new THREE.MeshPhongMaterial({map : texture});
	house = new THREE.Mesh(geometry, material);
	texture.repeat.set( 4, 4 );
	house.material.map.wrapS= THREE.RepeatWrapping;
	house.material.map.wrapT= THREE.RepeatWrapping;
	house.position.set(90, 64, -80);
	house.rotation.y= Math.PI/2;

	house.castShadow= true;
	house.receiveShadow= true;
	scene.add(house);
}

function createRoof(){
	const texture= new THREE.TextureLoader().load("textures/roof.png");
	texture.colorSpace= THREE.SRGBColorSpace;
	const material= new THREE.SpriteMaterial({map : texture, color: 0xffffff});
	roof= new THREE.Sprite(material);
	roof.scale.set(160,120,1);
	roof.position.set(90, 220, -80);
	scene.add(roof);
}


function createDoor(){
	const texture = new THREE.TextureLoader().load("textures/door.png");
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.anisotropy = 16;

	const bump = new THREE.TextureLoader().load("textures/bump.jpg", function(texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(0.25, 0.25);
    });
    bump.wrapS = THREE.RepeatWrapping;
    bump.wrapT = THREE.RepeatWrapping;
    bump.repeat.set(0.25, 0.25);
	

	const geometry = new THREE.BoxGeometry(37, 53, 4, 5, 5 );
	const material = new THREE.MeshPhongMaterial({map : texture,bumpMap: bump,
        bumpScale: 10 });

	box=new THREE.Mesh(geometry, material);
	box.material.map.wrapS= THREE.RepeatWrapping;
	box.material.map.wrapT= THREE.RepeatWrapping;
	box.position.set(90, 30, -1.8);
	scene.add(box);
}

function createFlowers(){
	const texture= new THREE.TextureLoader().load("textures/grass.png");
	texture.colorSpace= THREE.SRGBColorSpace;
	const material= new THREE.SpriteMaterial({map : texture, color: 0xffffff});
	grass= new THREE.Sprite(material);
	grass.scale.set(50,50,1);
	grass.position.set(50, 25, -3);
	scene.add(grass);

	grass= new THREE.Sprite(material);
	grass.scale.set(50,50,1);
	grass.position.set(25, 25, -20);
	scene.add(grass);

	grass= new THREE.Sprite(material);
	grass.scale.set(50,50,1);
	grass.position.set(135, 25, -3);
	scene.add(grass);

	grass= new THREE.Sprite(material);
	grass.scale.set(50,50,1);
	grass.position.set(150, 25, -20);
	scene.add(grass);

}

function createGhost(){
	const texture = new THREE.TextureLoader().load("textures/ghost_black.png");
	texture.colorSpace= THREE.SRGBColorSpace;
	const material = new THREE. SpriteMaterial({map:texture, color: 0xffffff});
	ghost = new THREE.Sprite(material);
	ghost.scale.set(50,50,1);
	ghost.position.set(-50, 20, -50);
	scene.add(ghost);
}

function createRoad(){
	const texture= new THREE.TextureLoader().load("textures/stone.jpg");
	texture.colorSpace= THREE.SRGBColorSpace;
	texture.anisotropy= 16;
	texture.magFilter = THREE.LinearFilter;
	texture.minFilter = THREE.LinearMipMapLinearFilter;
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	//texture.repeat.set(2, 2);
	const geometry = new THREE.PlaneGeometry(100, 360); 
	const geometry_2 = new THREE.PlaneGeometry(100, 520);
	const material =  new THREE.MeshPhongMaterial({map: texture, side: THREE.DoubleSide});
	road1 = new THREE.Mesh(geometry, material);
	road1.rotation.x = -0.5*Math.PI;
	road1.position.x = 90;
	road1.position.y = 1;
	road1.position.z = -80;
	road1.receiveShadow = true;
	scene.add(road1);
	road2 = new THREE.Mesh(geometry_2, material);
	road2.rotation.x = -0.5*Math.PI;
	road2.receiveShadow= true;
	road2.rotation.z = -0.5*Math.PI;
	road2.position.x = 0;
	road2.position.y = 1;
	road2.position.z = 150;
	scene.add(road2);
}

function createWindows(){
	const geometry = new THREE.TorusGeometry(15, 3);
	const material = new THREE.MeshLambertMaterial({color : 0x437ba4});
	wheel = new THREE.Mesh(geometry, material);
	wheel.castShadow= true;
	wheel.receiveShadow= true;
	wheel.position.set(40, 30, 10);
	const geometry_2 = new THREE.CircleGeometry(14, 128, 6);
	const material_2 =  new THREE.MeshPhongMaterial({color: 0x30abc5, opacity: 0.5, flatShading:true});
	material_2.transparent=true;
	sphere= new THREE.Mesh(geometry_2, material_2);
	sphere.position.set(40, 30, 10);
	sphere.castShadow= true;
	sphere.receiveShadow= true;
	//scene.add(sphere);
	const group= new THREE.Group();
	group.add(wheel);
	group.add(sphere);
	group.position.set(20, 55, -44);
	group.rotation.y=-Math.PI/5;
	scene.add(group);

	wheel = new THREE.Mesh(geometry, material);
	wheel.castShadow= true;
	wheel.receiveShadow= true;
	sphere= new THREE.Mesh(geometry_2, material_2);
	sphere.castShadow= true;
	sphere.receiveShadow= true;
	const group_2= new THREE.Group();
	group_2.add(wheel);
	group_2.add(sphere);
	group_2.position.set(135, 55, -13);
	group_2.rotation.y=Math.PI/7;
	scene.add(group_2);
}



function createSmoke(){
	const geometry = new THREE.CylinderGeometry( 5, 5, 35, 32 ); 
	const geometry_2 = new THREE.CylinderGeometry( 5, 5, 17, 32 );
	const material = new THREE.MeshPhongMaterial( {color: 0x8ab4cc} );
	const group = new THREE.Group(); 
	cylinder = new THREE.Mesh( geometry, material );
	cylinder.rotation.z= Math.PI/2;
	cylinder.castShadow= true;
	cylinder.receiveShadow= true;
	group.add(cylinder);
	cylinder= new THREE.Mesh(geometry_2, material);
	cylinder.castShadow= true;
	cylinder.receiveShadow= true;
	cylinder.position.set(12, 8, 0);
	group.add(cylinder);
	group.position.set(180, 120, -60);
	scene.add(group);
}

function createBody(){	
	const texture = new THREE.TextureLoader().load("textures/Skin.png");
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.anisotropy = 16;

	const bump = new THREE.TextureLoader().load("textures/bump.jpg", function(texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(0.25, 0.25);
    });
	
	const geometry = new THREE.BoxGeometry(16, 16, 7, 5,5);
	const material =  new THREE.MeshPhongMaterial({ map: texture, bumpMap: bump,
        bumpScale: 10 });
	box = new THREE.Mesh(geometry, material);
	box.material.map.wrapS= THREE.RepeatWrapping;
	box.material.map.wrapT= THREE.RepeatWrapping;
	box.position.x=0;
	box.position.y=22.5;
	box.position.z=0;
	box.castShadow = true;
	box.receiveShadow = true;
	scene.add(box);	
}

function createShirt(){
	const geometry= new THREE.BoxGeometry(16, 2, 7, 5, 5);
	const material= new THREE.MeshPhongMaterial({color: 0xffffff});
	shirt= new THREE.Mesh(geometry, material);
	shirt.position.x=0;
	shirt.position.y=13.5;
	shirt.position.z=0;
	shirt.castShadow = true;
	shirt.receiveShadow=true; 
	scene.add(shirt);
}

function createShirt_plane(){
	const geometry = new THREE.PlaneGeometry(2, 2);
	const material =  new THREE.MeshPhongMaterial({color: 0xe7e7e7, side:THREE.DoubleSide});

	shirt_plane1 = new THREE.Mesh(geometry, material);
	shirt_plane1.rotation.z = 2/Math.PI;
	shirt_plane1.rotation.x=-1/Math.PI;
	shirt_plane1.position.set(-2, 14.5, 3.5);
	shirt_plane1.castShadow=true;
	shirt_plane1.receiveShadow = true;
	scene.add(shirt_plane1);

	shirt_plane2 = new THREE.Mesh(geometry, material);
	shirt_plane2.rotation.z = 2/Math.PI;
	shirt_plane2.rotation.x=-1/Math.PI;
	shirt_plane2.position.set(2, 14.5, 3.5);
	shirt_plane2.castShadow=true;
	shirt_plane2.receiveShadow = true;
	scene.add(shirt_plane2);
}

function createPants(){
	const geometry= new THREE.BoxGeometry(16, 3, 7, 5, 5);
	const material= new THREE.MeshPhongMaterial({color: 0x946300});
	pants= new THREE.Mesh(geometry, material);
	pants.position.x=0;
	pants.position.y=11;
	pants.position.z=0;
	pants.castShadow = true;
	pants.receiveShadow=true;
	scene.add(pants);
}
 
function createEyes(){	
	const geometry = new THREE.SphereGeometry(3,20,20);
	const material= new THREE.MeshPhongMaterial({color: 0xffffff});
	eye1 = new THREE.Mesh(geometry, material);
	eye1.castShadow = true;
	eye1.receiveShadow = true;
	eye1.position.set(-2.5, 24, 2);
	scene.add(eye1);	

	eye2 = new THREE.Mesh(geometry, material);
	eye2.castShadow = true;
	eye2.receiveShadow = true;
	eye2.position.set(2.5, 24, 2);
	scene.add(eye2);
}

function createBlue_eyes(){	
	const geometry = new THREE.SphereGeometry(1.2,20,20); 
	const material= new THREE.MeshPhongMaterial({color: 0x1F85DE}); 

	eye1_blue = new THREE.Mesh(geometry, material);
	eye1_blue.castShadow = true;
	eye1_blue.receiveShadow= true;
	eye1_blue.position.set(-2.5, 24, 4);
	scene.add(eye1_blue);	

	eye2_blue = new THREE.Mesh(geometry, material);
	eye2_blue.castShadow = true;
	eye2_blue.receiveShadow= true;
	eye2_blue.position.set(2.5, 24, 4);
	scene.add(eye2_blue);	
}

function createBlack_eyes(){	
	const geometry = new THREE.SphereGeometry(1,20,20); // 3 20 20
	const material= new THREE.MeshPhongMaterial({color: 0x000000});

	eye1_black = new THREE.Mesh(geometry, material);
	eye1_black.castShadow = true;
	eye1_black.receiveShadow=true;
	eye1_black.position.set(-2.5, 24, 4.238);
	scene.add(eye1_black);

	eye2_black = new THREE.Mesh(geometry, material);
	eye2_black.castShadow = true;
	eye2_black.receiveShadow=true;
	eye2_black.position.set(2.5, 24, 4.238);
	scene.add(eye2_black);
}

function createEyeBrows(){
	const geometry = new THREE.BoxGeometry(0.7, 1.3, 0.5, 5,5);
	const material= new THREE.MeshPhongMaterial({color: 0x000000});
	let rotation=2;

	eye_brow1= new THREE.Mesh(geometry, material);
	eye_brow1.rotation.z= rotation/Math.PI;
	eye_brow1.position.set(-4.1, 26.5, 3.5);
	eye_brow1.castShadow=true;
	eye_brow1.receiveShadow = true;
	rotation-=4;
	scene.add(eye_brow1);

	eye_brow2= new THREE.Mesh(geometry, material);
	eye_brow2.castShadow=true;
	eye_brow2.receiveShadow = true;
	eye_brow2.position.set(-0.9, 26.5, 3.5);
	eye_brow2.rotation.z= rotation/Math.PI;
	scene.add(eye_brow2);
	rotation=2;

	eye_brow3= new THREE.Mesh(geometry, material);
	eye_brow3.rotation.z= rotation/Math.PI;
	eye_brow3.position.set(0.9, 26.5, 3.5);
	eye_brow3.castShadow=true;
	eye_brow3.receiveShadow = true;
	rotation-=4;
	scene.add(eye_brow3);

	eye_brow4= new THREE.Mesh(geometry, material);
	eye_brow4.castShadow=true;
	eye_brow4.receiveShadow = true;
	eye_brow4.position.set(4.1, 26.5, 3.5);
	eye_brow4.rotation.z= rotation/Math.PI;
	scene.add(eye_brow4);

	eye_brow5= new THREE.Mesh(geometry, material);
	eye_brow5.castShadow=true;
	eye_brow5.receiveShadow = true;
	eye_brow5.position.set(-2.5, 27, 3.5);

	eye_brow5= new THREE.Mesh(geometry, material);
	eye_brow5.castShadow=true;
	eye_brow5.receiveShadow = true;
	eye_brow5.position.set(2.5, 27, 3.5);
}

function createPants_wheel(){	
	const geometry = new THREE.TorusGeometry( 1, 1, 5, 50 ); 
	const material= new THREE.MeshPhongMaterial({color: 0x946300}); 

	wheel_pant1 = new THREE.Mesh( geometry, material );
	wheel_pant1.rotation.x = -0.5*Math.PI;
	wheel_pant1.position.set(-3.5, 9.3, 0);
	wheel_pant1.castShadow = true;
	wheel_pant1.receiveShadow= true;
	scene.add(wheel_pant1);	

	wheel_pant2 = new THREE.Mesh( geometry, material );
	wheel_pant2.rotation.x = -0.5*Math.PI;
	wheel_pant2.position.set(3.5, 9.3, 0);
	wheel_pant2.castShadow = true;
	wheel_pant2.receiveShadow= true;
	scene.add(wheel_pant2);	
}

function createShirt_wheel(){	
	const geometry = new THREE.TorusGeometry( 1, 1, 5, 50 );  // 4 1 5 100
	const material= new THREE.MeshPhongMaterial({color: 0xffffff});
	let x=-8.5;
	let y=15;
	let z=0;

	wheel_shirt1 = new THREE.Mesh( geometry, material );
	wheel_shirt1.rotation.x = -0.5*Math.PI;
	wheel_shirt1.rotation.y= 5/Math.PI;
	wheel_shirt1.position.set(-8.5, 15, 0);
	wheel_shirt1.castShadow = true;
	wheel_shirt1.receiveShadow= true;
	right_hand.add(wheel_shirt1);
	// scene.add(wheel_shirt1);	

	wheel_shirt2 = new THREE.Mesh( geometry, material );
	wheel_shirt2.rotation.x = -0.5*Math.PI;
	wheel_shirt2.rotation.y= 5/Math.PI;
	wheel_shirt2.position.set(8.5, 15, 0);
	wheel_shirt2.castShadow = true;
	wheel_shirt2.receiveShadow= true;
	scene.add(wheel_shirt2);
}

function createTie(){	 
	let geometry = new THREE.SphereGeometry(1,20,20);
	const material= new THREE.MeshPhongMaterial({color: 0xa10000});
	
	tie_sphere = new THREE.Mesh(geometry, material);
	tie_sphere.position.set(0, 14, 3);
  tie_sphere.castShadow = true;
	tie_sphere.receiveShadow= true;
	scene.add(tie_sphere);

	let geometry_1 = new THREE.ConeGeometry( 1, 5, 32 ); 
	tie_conus1 = new THREE.Mesh(geometry_1, material ); 
	tie_conus1.position.set(0,14,3);
	tie_conus1.castShadow=true;
	tie_conus1.receiveShadow=true;
	scene.add( tie_conus1 );

	let geometry_2 = new THREE.ConeGeometry( 1.1, 2, 32 );
	tie_conus2 = new THREE.Mesh(geometry_2, material ); 
	tie_conus2.position.set(0, 10.5, 2.8);
	tie_conus2.rotation.x=3*Math.PI;
	tie_conus2.castShadow=true;
	tie_conus2.receiveShadow=true;
	scene.add( tie_conus2 );
}

function createBelt(){
	const geometry = new THREE.BoxGeometry(3.5, 1, 0.5, 5,5);
	const material= new THREE.MeshPhongMaterial({color: 0xe240000});

	belt1= new THREE.Mesh(geometry, material)
	belt1.position.set(-4.5, 11.5, 3.3);
	belt1.castShadow= true;
	belt1.receiveShadow= true;
	scene.add(belt1);

	belt2= new THREE.Mesh(geometry, material)
	belt2.position.set(0, 11.5, 3.3);
	belt2.castShadow= true;
	belt2.receiveShadow= true;
	scene.add(belt2);

	belt3= new THREE.Mesh(geometry, material)
	belt3.position.set(4.5, 11.5, 3.3);
	belt3.castShadow= true;
	belt3.receiveShadow= true;
	scene.add(belt3);
}

function createLegs(){
	const geometry = new THREE.CapsuleGeometry( 0.7, 9, 5, 8 );
	const bump = new THREE.TextureLoader().load("textures/bump.jpg", function(texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(0.25, 0.25);
    });
	const material= new THREE.MeshPhongMaterial({color: 0xFEF52A, bumpMap: bump,
        bumpScale: 10 });

	leg1= new THREE.Mesh(geometry, material);
	leg1.position.set(-3.5, 6, 0);
	leg1.castShadow= true;
	leg1.receiveShadow=true;
	scene.add(leg1);

	leg2= new THREE.Mesh(geometry, material);
	leg2.position.set(3.5, 6, 0);
	leg2.castShadow= true;
	leg2.receiveShadow=true;
	scene.add(leg2);
}

function createArms(){
	const geometry = new THREE.CapsuleGeometry( 0.7, 8, 4, 8 );
	const bump = new THREE.TextureLoader().load("textures/bump.jpg", function(texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(0.25, 0.25);
    });
	const material= new THREE.MeshPhongMaterial({color: 0xFEF52A});

	arm1 = new THREE.Mesh(geometry, material);
	arm1.rotation.z=Math.PI/2;
	arm1.position.set(-13, 15, 0);
	arm1.castShadow= true;
	arm1.receiveShadow=true;
	right_hand.add(arm1);
	// scene.add(arm1);

	arm2 = new THREE.Mesh(geometry, material);
	arm2.rotation.z=Math.PI/2;
	arm2.position.set(13, 15, 0);
	arm2.castShadow= true;
	arm2.receiveShadow=true;
	scene.add(arm2);
}

function createSmile(){
	const geometry = new THREE.CapsuleGeometry( 0.6, 8, 4, 8 );
	const material= new THREE.MeshPhongMaterial({color: 0xe240000});
	smile= new THREE.Mesh(geometry, material);
	smile.position.set(0, 18, 3);
	smile.rotation.z=Math.PI/2;
	smile.castShadow= true;
	smile.receiveShadow=true;
	scene.add(smile);
}

function createCheeks(){
	const geometry = new THREE.SphereGeometry(2,10,10); // 3 20 20
	const bump = new THREE.TextureLoader().load("textures/bump.jpg", function(texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(0.25, 0.25);
    });
	const material= new THREE.MeshPhongMaterial({color : 0xFEF52A, bumpMap: bump,
        bumpScale: 10 });

	cheek1 = new THREE.Mesh(geometry, material);
	cheek1.position.set(-6, 20, 2);
	cheek1.castShadow = true;
	cheek1.receiveShadow= true;
	scene.add(cheek1);	

	cheek2 = new THREE.Mesh(geometry, material);
	cheek2.position.set(6, 20, 2);
	cheek2.castShadow = true;
	cheek2.receiveShadow= true;
	scene.add(cheek2);	
}

function createTeeth(){
	const geometry = new THREE.BoxGeometry(1.8, 2, 0.5, 5,5);
	const material= new THREE.MeshPhongMaterial({color: 0xffffff});

	tooth1= new THREE.Mesh(geometry, material);
	tooth1.position.set(-1.3, 17.5, 3.5);
	tooth1.rotation.x=-0.7/Math.PI;
	tooth1.castShadow=true;
	tooth1.receiveShadow=true;
	scene.add(tooth1); 

	tooth2= new THREE.Mesh(geometry, material);
	tooth2.position.set(1.2, 17.5, 3.5);
	tooth2.rotation.x=-0.7/Math.PI;
	tooth2.castShadow=true;
	tooth2.receiveShadow=true;
	scene.add(tooth2); 
}

function createNose(){
	const geometry = new THREE.CapsuleGeometry( 0.9, 4, 4, 8 );
	const bump = new THREE.TextureLoader().load("textures/bump.jpg", function(texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(0.25, 0.25);
    });
	const material= new THREE.MeshPhongMaterial({color: 0xFEF52A, bumpMap: bump,
        bumpScale: 10 });
	
	nose= new THREE.Mesh(geometry, material);
	nose.position.set(0, 22, 6);
	nose.rotation.x=Math.PI/2;
	nose.castShadow= true;
	nose.receiveShadow=true;
	scene.add(nose);
}

function createBoots(){
	const material= new THREE.MeshPhongMaterial({color: 0x000000});
	let geometry= new THREE.SphereGeometry(1.5, 10, 10);
	const group = new THREE.Group();

	sphere_boot1= new THREE.Mesh(geometry, material);
	sphere_boot1.castShadow=true;
	sphere_boot1.receiveShadow=true;
	sphere_boot1.position.set(-3.5, 1.5, 2);
	group.add(sphere_boot1);

	sphere_boot2= new THREE.Mesh(geometry, material);
	sphere_boot2.castShadow=true;
	sphere_boot2.receiveShadow=true;
	sphere_boot2.position.set(3.5, 1.5, 2);
	group.add(sphere_boot2);

	sphere_boot3= new THREE.Mesh(geometry, material);
	sphere_boot3.castShadow=true;
	sphere_boot3.receiveShadow=true;
	sphere_boot3.position.set(-3.5, 2.5, 0);
	group.add(sphere_boot3);

	sphere_boot4= new THREE.Mesh(geometry, material);
	sphere_boot4.castShadow=true;
	sphere_boot4.receiveShadow=true;
	sphere_boot4.position.set(3.5, 2.5, 0);
	group.add(sphere_boot4);

	geometry = new THREE.BoxGeometry(2, 3, 2, 5,5);

	box_boot1= new THREE.Mesh(geometry, material);
	box_boot1.castShadow=true;
	box_boot1.receiveShadow= true;
	box_boot1.position.set(-3.5, 1.6, 0);
	group.add(box_boot1);

	box_boot2= new THREE.Mesh(geometry, material);
	box_boot2.castShadow=true;
	box_boot2.receiveShadow= true;
	box_boot2.position.set(3.5, 1.6, 0);
	group.add(box_boot2);
	scene.add(group);
}

function createShell(){

	const bump = new THREE.TextureLoader().load("textures/bump.jpg",);

	const material = new THREE.MeshPhongMaterial({color : 0xe79683, bumpMap: bump}); //0xfda2ff
	const geometry = new THREE.SphereGeometry(12, 20, 20);
	
	shell = new THREE.Mesh(geometry, material);
	shell.receiveShadow = true;
	shell.castShadow = true;
	shell.position.set(-45,10,30);
	gary_character.add(shell);
	// scene.add(shell);
}

function createBody_Gary(){
	const material = new THREE.MeshPhongMaterial({color : 0x87c7e2});
	const geometry= new THREE.BoxGeometry(30, 5 , 15);
	body_gary= new THREE.Mesh(geometry, material);
	body_gary.receiveShadow = true;
	body_gary.castShadow = true;
	body_gary.position.set(-58,3,30);
	gary_character.add(body_gary);
	// scene.add(body_gary);
}

function createEye_capsule(){
	const material = new THREE.MeshPhongMaterial({color : 0x87c7e2});
	const geometry = new THREE.CapsuleGeometry(1.3, 13, 20, 20);
	eye_capsule1= new THREE.Mesh(geometry, material);
	eye_capsule1.receiveShadow = true;
	eye_capsule1.castShadow = true;
	eye_capsule1.position.set(-68, 10, 35);
	gary_character.add(eye_capsule1);
	// scene.add(eye_capsule1);

	eye_capsule2= new THREE.Mesh(geometry, material);
	eye_capsule2.receiveShadow = true;
	eye_capsule2.castShadow = true;
	eye_capsule2.position.set(-68, 10, 25);
	gary_character.add(eye_capsule2);
	// scene.add(eye_capsule2);
}

function createGary_eyes(){
	const geometry= new THREE.SphereGeometry(4, 20, 20);
	const material = new THREE.MeshPhongMaterial({color : 0xc4df90});
	gary_eye1= new THREE.Mesh(geometry, material);
	gary_eye1.receiveShadow= true;
	gary_eye1.castShadow= true;
	gary_eye1.position.set(-68, 17, 35);
	gary_character.add(gary_eye1);
	// scene.add(gary_eye1);

	gary_eye2= new THREE.Mesh(geometry, material);
	gary_eye2.receiveShadow= true;
	gary_eye2.castShadow= true;
	gary_eye2.position.set(-68, 17, 25);
	gary_character.add(gary_eye2);
	// scene.add(gary_eye2);
}

function createGary_red_eyes(){
	const geometry= new THREE.SphereGeometry(1.5, 20, 20);
	const material = new THREE.MeshPhongMaterial({color : 0xea3303});
	gary_eye_red1= new THREE.Mesh(geometry, material);
	gary_eye_red1.receiveShadow= true;
	gary_eye_red1.castShadow= true;
	gary_eye_red1.position.set(-71, 17, 35);
	gary_character.add(gary_eye_red1);
	// scene.add(gary_eye_red1);

	gary_eye_red2= new THREE.Mesh(geometry, material);
	gary_eye_red2.receiveShadow= true;
	gary_eye_red2.castShadow= true;
	gary_eye_red2.position.set(-71, 17, 25);
	gary_character.add(gary_eye_red2);
	// scene.add(gary_eye_red2);
}

function createGary_black_eyes(){
	const geometry= new THREE.SphereGeometry(0.7, 20, 20);
	const material = new THREE.MeshPhongMaterial({color : 0x020202});
	gary_eye_black1= new THREE.Mesh(geometry, material);
	gary_eye_black1.receiveShadow= true;
	gary_eye_black1.castShadow= true;
	gary_eye_black1.position.set(-72, 17, 35);
	gary_character.add(gary_eye_black1);
	// scene.add(gary_eye_black1);

	gary_eye_black2= new THREE.Mesh(geometry, material);
	gary_eye_black2.receiveShadow= true;
	gary_eye_black2.castShadow= true;
	gary_eye_black2.position.set(-72, 17, 25);
	gary_character.add(gary_eye_black2);
	// scene.add(gary_eye_black2);
}

function createGary_smile(){
	const geometry = new THREE.CapsuleGeometry(0.7, 4.5);
	const material = new THREE.MeshPhongMaterial({color : 0x000000});
	gary_smile=new THREE.Mesh(geometry, material);
	gary_smile.receiveShadow = true;
	gary_smile.castShadow = true;
	gary_smile.rotation.x= -Math.PI/2;
	gary_smile.position.set(-73,3,30);
	gary_character.add(gary_smile);
	// scene.add(gary_smile);
}

function gary(){
	gary_character.name = "gary";
	scene.add(gary_character);
	let settings = {
		garyPosition: 0,
		garyRotation: 0
	};
	let tween = new TWEEN.Tween(gary_character.position).to({x : -50}, 1500);
	tween.easing(TWEEN.Easing.Quadratic.InOut);
	tween.delay(1000);
	tween.yoyo(true);
	tween.repeat(Infinity);
	// tween.onUpdate(() => {
	// 	gary_character.position.x -= 0.05;
	// });
	// tween.repeat(Infinity);
	
	// let tween2 = new TWEEN.Tween(gary_character.position).to({z : -30}, 1500);
	// tween2.easing(TWEEN.Easing.Quadratic.InOut);

	// let tween3 = new TWEEN.Tween(gary_character.position).to({x : 20}, 1500);
	// tween3.easing(TWEEN.Easing.Quadratic.InOut);

	// let tween4 = new TWEEN.Tween(gary_character.position).to({z : 15}, 1500);
	// tween4.easing(TWEEN.Easing.Quadratic.InOut);

	// tween2.repeat(Infinity);
	// tween.chain(tween2);
	// tween2.chain(tween3);
	// tween3.chain(tween4);
	// tween4.chain(tween);
	tween.start();
}

function createWitch_hat(){
	const geometry_1= new THREE.CylinderGeometry(15,15, 3, 64, 64);
	const material = new THREE.MeshLambertMaterial({color : 0x1d1f20});
	bottom_hat = new THREE.Mesh(geometry_1, material);
	bottom_hat.receiveShadow = true;
	bottom_hat.castShadow = true;
	bottom_hat.position.set(0,31,0);

	const geometry_2 = new THREE.CylinderGeometry(1, 10, 20, 64, 64)
	cylinder_hat= new THREE.Mesh(geometry_2, material);
	cylinder_hat.receiveShadow = true;
	cylinder_hat.castShadow = true;
	cylinder_hat.position.set(0, 40, 0);

	const geometry_3 = new THREE.TorusGeometry(7, 1.7, 30, 200);
	const material_rope= new THREE.MeshLambertMaterial({color : 0x6c008a});
	rope_hat = new THREE.Mesh(geometry_3, material_rope);
	rope_hat.receiveShadow = true;
	rope_hat.castShadow = true;
	rope_hat.rotateX(Math.PI/2);
	rope_hat.position.set(0, 33, 0);

	const geometry_4 = new THREE.TorusGeometry(1, 0.5, 30, 200);
	rope_hat_torus1= new THREE.Mesh(geometry_4, material_rope);
	rope_hat_torus1.receiveShadow = true;
	rope_hat_torus1.castShadow= true;
	rope_hat_torus1.rotateX(-Math.PI/7);
	rope_hat_torus1.position.set(-1, 34, 8.8);

	rope_hat_torus2= new THREE.Mesh(geometry_4, material_rope);
	rope_hat_torus2.receiveShadow = true;
	rope_hat_torus2.castShadow= true;
	rope_hat_torus2.rotateX(-Math.PI/7);
	rope_hat_torus2.position.set(1, 34, 8.8);

	witch_hat.add(bottom_hat);
	witch_hat.add(cylinder_hat);
	witch_hat.add(rope_hat);
	witch_hat.add(rope_hat_torus1);
	witch_hat.add(rope_hat_torus2);
	scene.add(witch_hat);
}

function createKrab(){
	const loader = new GLTFLoader();
	loader.load('./models/mr_krabs/scene.gltf',
		function (gltf){
			const model = gltf.scene;
			model.traverse(function (child){
				if (child instanceof THREE.Mesh ){
					child.castShadow = true;
				}
			});
			model.scale.set(0.1, 0.1, 0.1);

			const animation = gltf.animations[0];
			const mixer = new THREE.AnimationMixer( model );
			mixers.push(mixer);
			const action = mixer.clipAction(animation);
			action.setDuration(2);
			action.play();

			krab.add(model);
			krab.name="Krab";
		},
		function(xhr){
			console.log((xhr.loaded / xhr.total * 100) + '% loaded');
		},
		function(errorMessage){
			console.log(errorMessage);
		}
	);
	krab.position.set(175, 18.2, 0);
	scene.add(krab);
}

// Renderer object and features
function createRenderer(){
	// renderer = new THREE.WebGLRenderer();
	// set antialiasing true to remove jagged edges
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize(mainContainer.clientWidth, mainContainer.clientHeight);
	renderer.setPixelRatio( window.devicePixelRatio );
  // Turn on shadows
	renderer.shadowMap.enabled = true;
	// choose shadow type
	renderer.shadowMap.type = THREE.PCFSoftShadowMap; // THREE.BasicShadowMap | THREE.PCFShadowMap | THREE.PCFSoftShadowMap
	mainContainer.appendChild( renderer.domElement );
}

function createSound(){
	listener = new THREE.AudioListener();
	camera.add(listener);
	sound = new THREE.Audio(listener);
	audioLoader = new THREE.AudioLoader();
	audioLoader.load('sounds/spongebob_music.mp3', function (buffer){
		sound.setBuffer(buffer);
		sound.setLoop(true);
		sound.setVolume(0.3);
	});

	let sb = menu.add(menuParams, 'soundon').name('Sound On/Off').listen();
	sb.onChange(function(value){
		if (value == true)sound.play();
		else sound.stop();
	});
}

function createGary_Sound(){
	listener = new THREE.AudioListener();
	camera.add( listener );

	// create a global audio source
	sound_2 = new THREE.Audio( listener );
	// load a sound and set it as the Audio object's buffer
	audioLoader = new THREE.AudioLoader();
	// https://www.youtube.com/watch?v=5JDpV6sXfuk
	audioLoader.load( 'sounds/gary_meow.mp3', function( buffer ) {
		sound_2.setBuffer( buffer );
		// sound.setLoop( true );
		sound_2.setVolume( 0.3 );
		sound_2.play();
	});

	// // sound control
	// let sb = gui.add( controlBoxParams, 'soundon').name('Sound On/Off').listen();
	// sb.onChange( function ( value ) {
	// 	if(value == true)sound.play();
	// 	else sound.stop();
	// });
}

let moveStep= 0;
let rotateStep=0;
let bounceStep = 0;
let cameraStep = 0;
let gary_speed= 0;

//control menu
function createMenu(){
	// menu.add(menuParams, 'rotationSpeed').min(10).max(100).step(1).name('Rotation speed');
	menu.add(menuParams, 'ghostPosX').min(-10).max(10).step(0.1).name('Ghost position X').onChange( value => {
		ghost.position.x = menuParams.ghostPosX;
	} );
	menu.add(menuParams, 'ghost_size').min(50).max(100).step(1).name("Size of the ghost").onChange(value =>{
		ghost.scale.set(menuParams.ghost_size, menuParams.ghost_size,1);
		ghost.position.set(-50, menuParams.ghost_size - 30, -50);
	});
}

// Animations
function update(){
	// witch hat animation
	// if (typeof witch_hat !== 'undefined'){
	// 	rotateStep -= menuParams.rotationSpeed/10000;
	// 	witch_hat.rotation.y=rotateStep;
	// }

	// mr krabs animation
	const delta = clock.getDelta();
	for (const mixer of mixers){
		mixer.update(delta);
	}

	// ghost animation
	if (typeof ghost !== 'undefined'){
		if (moveStep < 800){
			ghost.position.y+=0.1;
			moveStep++;
		} else if (moveStep < 1600){
			ghost.position.y-=0.1
			moveStep++;
		} else{
			moveStep = 0;
		}
	}
	TWEEN.update();
}

function init(){
	// https://threejs.org/docs/index.html#manual/en/introduction/Color-management
	THREE.ColorManagement.enabled = true;
	
	// Create scene
	createScene();

	// FPS counter
	createStats();
	
	// Create camera:
	createPerspectiveCamera();
	
	// Create interactive controls:	
  createControls();
	
	// Create meshes and other visible objects:
  //createAxes();
  createPlane();
	
	// House creation
	createHouse();
	createRoof();
	createDoor();
	createWindows();
	createSmoke();
	createFlowers();
	createRoad();

	// SpongeBob creation
  createBody();
	createShirt();
	createShirt_plane();
	createPants();
  createEyes();
	createBlue_eyes();
	createBlack_eyes();
	createEyeBrows();
  createPants_wheel();
	createShirt_wheel();
	createTie();
	createBelt();
	createLegs();
	createArms();
	createCheeks();
	createTeeth();
	createNose();
	createBoots();
	createSmile();
	//createWitch_hat();

	createGhost();

	createKrab();

	// Create Garry
	createShell();
	createBody_Gary();
	createEye_capsule();
	createGary_eyes();
	createGary_red_eyes();
	createGary_black_eyes();
	createGary_smile();
	gary();
	scene.add(right_hand);
	
	createSound();

	createMenu();

	// Create lights:	
  createDirectionalLight();
	//createSpotLight();
	createAmbientLight();

	// Render elements
	createRenderer();

	// Create animations
	renderer.setAnimationLoop( () => {
		update();
		stats.begin();
		renderer.render( scene, camera );
		stats.end();
  	});
}

init();

// Auto resize window
window.addEventListener('resize', e => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
});

// mouse coordinate
mainContainer.addEventListener('mousemove', e =>{
	mouse.x = 2 * (e.clientX / window.innerWidth) - 1;
	mouse.y = 1-2 * (e.clientY / window.innerHeight);
});

// action when user clicks
mainContainer.addEventListener('mousedown', e => {
	e.preventDefault();
	raycaster.setFromCamera(mouse, camera);
	intersects = raycaster.intersectObjects(scene.children, true)
	for (var i = 0; i<intersects.length; i++){
		if (intersects[i].object.parent.name == "gary"){
			// window.location.href = 'https://www.pexels.com/photo/1-us-bank-note-47344/';
			createGary_Sound();
			console.log("Clicked for redirect");
		}
	}
});