import { DynamicTerrain, DuneBuggy } from "./shared.js";
import { Interaction} from "./interaction.js";

// import { 
//     Scene,
//     PerspectiveCamera, 
//     WebGLRenderer,
//     BufferGeometry,
//     BufferAttribute,
//     Float32BufferAttribute,
//     MeshBasicMaterial,
//     MeshStandardMaterial,
//     Mesh,
//     TextureLoader,
//     RepeatWrapping,
//     DirectionalLight,
//     Vector2,
//     Group,
//     PCFSoftShadowMap,
//     CameraHelper
// } from 'three';

import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'

'use strict';

// console.log(DynamicTerrain);

function Main (camera) {
    console.log("what up ")
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.canvas = this.renderer.domElement;
    // document.body.appendChild(this.canvas);
    console.log(document.body)

    this.scene = new THREE.Group();//new Scene();
    // this.scene.scale.set(0.25, 0.25, 0.25);

    // this.camera = new PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
    // this.camera.position.z = 100;
    // this.camera.position.y = 100;
    // // this.camera.rotation.x = -Math.PI/4;
    // this.camera.lookAt(0,0,0);
    this.camera = camera;

    // this.camera.position.y = 0;
    // this.camera.rotation.x = 0;
    // this.camera.position.z = 150;
    window.addEventListener( 'resize', onWindowResize.bind(this), false );

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.5 );
    directionalLight.position.set(50,50,-50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 512;  // default
    directionalLight.shadow.mapSize.height = 512; // default
    directionalLight.shadow.camera.near = 0.5;    // default    
    directionalLight.shadow.camera.far = 100;     // default
    directionalLight.shadow.camera.left = directionalLight.shadow.camera.bottom = -5;    // default    
    directionalLight.shadow.camera.right = directionalLight.shadow.camera.top = 5;    // default
    this.directionalLight = directionalLight;
    
    // var helper = new CameraHelper( directionalLight.shadow.camera );
    // this.scene.add( helper );

    // directionalLight.rotation.z = Math.PI/4;
    this.scene.add( directionalLight );
    directionalLight.target = this.scene;
    // this.scene.add( directionalLight.target );

    this.terrain = new DynamicTerrain(Math.round(25*1.75), 50);
    // this.terrain = new DynamicTerrain(50, 100);
    this.masterGroup = new THREE.Group();
    // this.masterGroup.scale.set(2,2,2);

    // console.log(this.terrain.returnIndiceArraySnap());

    this.terrainGeo = new THREE.BufferGeometry();
    this.terrainGeo.addAttribute( 'position', new THREE.Float32BufferAttribute( this.terrain.returnPtArray(), 3 ) );
    this.terrainGeo.addAttribute( 'uv', new THREE.Float32BufferAttribute( this.terrain.returnUVArray(), 2 ) );
    this.terrainGeo.addAttribute( 'normal', new THREE.Float32BufferAttribute( this.terrain.returnNormalArray(), 3 ) );
    this.geoPositions = this.terrainGeo.attributes.position;
    this.geoUVs = this.terrainGeo.attributes.uv;
    this.terrainGeo.setIndex( this.terrain.returnIndiceArraySnap() );

    var texture = new THREE.TextureLoader().load( 'images/Desert_Albedo.png' );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    var ntexture = new THREE.TextureLoader().load( 'images/Desert_Normal.png' );
    ntexture.wrapS = THREE.RepeatWrapping;
    ntexture.wrapT = THREE.RepeatWrapping;
    this.terrainMat = new THREE.MeshStandardMaterial( {
        map: texture,
        normalMap: ntexture,
        normalScale: new THREE.Vector2( 0.8, 0.8 ),
        metalness: 0,
        roughness: 0.75
    } );
    // this.terrainMat.wireframe = true;

    this.duneBuggy = new DuneBuggy();
    this.duneBuggy.rotate(Math.PI); // default start direction

    this.buggyScale = 0.5;

    this.terrainMesh = new THREE.Mesh(this.terrainGeo, this.terrainMat);
    this.terrainMesh.receiveShadow = true;
    // this.terrainMesh.visible = false;


    this.scene.add(this.masterGroup);
    this.masterGroup.add(this.terrainMesh);

    var loader = new GLTFLoader();
    loader.load(
        'models/duneBuggy.glb',
        function ( gltf ) {
            window.gltf = gltf;
            this.buggy_frame = gltf.scene.getObjectByName("Frame");

            this.buggy_frontLeftWheel = gltf.scene.getObjectByName("FrontLeftWheel");
            this.buggy_frontRightWheel = this.buggy_frontLeftWheel.clone(); // gltf.scene.getObjectByName("FrontRightWheel");
            this.buggy_backLeftWheel = gltf.scene.getObjectByName("BackLeftWheel");
            this.buggy_backRightWheel = this.buggy_backLeftWheel.clone(); // gltf.scene.getObjectByName("BackRightWheel");

            console.log(this.buggy_frontRightWheel);
            console.log(this.buggy_backRightWheel);

            this.buggy = new THREE.Group();
            this.buggy.scale.set(this.buggyScale, this.buggyScale, this.buggyScale);
            this.masterGroup.add(this.buggy);
            this.buggySpin = new THREE.Group();
            this.buggySpin.add(this.buggy_frame);
            this.buggy.add(this.buggySpin);
            this.buggy.add(this.buggy_frontLeftWheel);
            this.buggy.add(this.buggy_frontRightWheel);
            this.buggy.add(this.buggy_backLeftWheel);
            this.buggy.add(this.buggy_backRightWheel);
            
            this.buggy_frame.castShadow = true;
            this.buggy_frontLeftWheel.castShadow = true;
            this.buggy_frontRightWheel.castShadow = true;
            this.buggy_backLeftWheel.castShadow = true;
            this.buggy_backRightWheel.castShadow = true;

            this.buggy_frontLeftWheel.position.y = this.duneBuggy.frontWheelX;
            this.buggy_frontRightWheel.position.y = this.duneBuggy.frontWheelX;
            this.buggy_frontLeftWheel.position.x = -this.duneBuggy.frontWheelSpace;
            this.buggy_frontRightWheel.position.x = this.duneBuggy.frontWheelSpace;
            this.buggy_backLeftWheel.position.y = this.duneBuggy.backWheelX;
            this.buggy_backRightWheel.position.y = this.duneBuggy.backWheelX;

            this.animate();
        }.bind(this)
    );

    this.currTime = new Date().getTime();
    
    this.terrain.setPosition(50,50);
    this.autoDrive = false;
    this.accelerate = 1;
    this.dragVector = [0,0];
    this.touching = false;

    // // this is a class I often reuse to capture user input
    // this.interaction = new Interaction({
    //     onDown: onDown.bind(this),
    //     onDrag: onDown.bind(this),
    //     onUp: onUp.bind(this)
    // });
}

function clamp(min, max, val){
    return Math.min(max, Math.max(min, val));
}

const camPos = new THREE.Vector3();
const masterPos = new THREE.Vector3();
const CamUpVector = new THREE.Vector3();
const YAxisPlane = new THREE.Vector3();
const CamToScene_ForwardVec = new THREE.Vector3();
const CamToScene_SideVec = new THREE.Vector3();
const CamToScene_UpVec = new THREE.Vector3();

function getCameraRotation () {
    camPos.setFromMatrixPosition(this.camera.matrixWorld);
    masterPos.setFromMatrixPosition(this.masterGroup.matrixWorld);

    CamUpVector.set(0,1,0).applyMatrix4(this.camera.matrixWorld).sub(camPos);
    YAxisPlane.set(0,1,0).applyMatrix4(this.scene.matrixWorld).sub(masterPos);

    CamToScene_ForwardVec.setFromMatrixPosition(this.buggy_frame.matrixWorld).sub(camPos);
    CamToScene_SideVec.crossVectors(CamToScene_ForwardVec, YAxisPlane);
    CamToScene_UpVec.crossVectors(CamToScene_ForwardVec, CamToScene_SideVec);

    let CamSceneRotationPtX = CamUpVector.dot(CamToScene_SideVec);
    let CamSceneRotationPtY = CamUpVector.dot(CamToScene_UpVec);

    return Math.atan(CamSceneRotationPtX / Math.abs(CamSceneRotationPtY));
}

var frameIndex = 0;
function animate() {
    requestAnimationFrame( animate.bind(this) );

    // get elapsed time
    var _currTime = new Date().getTime();
    var _elapsedTime = _currTime-this.currTime;
    this.currTime = _currTime;

    ////////// Update terrain and dune buggy //////////
    this.terrain.move(
        this.duneBuggy.vectorXY[0]*this.duneBuggy.speedXY*_elapsedTime/1000, 
        -this.duneBuggy.vectorXY[1]*this.duneBuggy.speedXY*_elapsedTime/1000
    );

    if(this.autoDrive){
        this.duneBuggy.accelerationXY_Mult = 1;
        this.duneBuggy.rotate(((Math.sin(3+this.currTime/8000)+Math.sin(this.currTime/800))*0.65)*_elapsedTime/1000);
    } else {
        this.duneBuggy.accelerationXY_Mult = 1; // ((this.touching)?1:0)+(this.interaction.arrows.up?1:0)-(this.interaction.arrows.down?1:0);
        let rot = getCameraRotation.call(this);

        let rotValue = Math.min(1, rot*1.75 );
        // console.log(rotValue);
        if (!isNaN(rotValue)) this.duneBuggy.rotate( rotValue );
        // this.duneBuggy.rotate( (this.dragVector[0]/20)+((this.interaction.arrows.left?-1:0)+(this.interaction.arrows.right?1:0))/20 );
    }
    // this.terrain.setPosition(Math.sin((this.currTime-(Math.PI/4))/100), Math.sin(this.currTime/100));
    // this.terrain.setPosition(95, Math.sin(this.currTime/100));

    // next set wheelHeights
    this.duneBuggy.update(
        _elapsedTime/1000,
        this.terrain.getPt(this.terrain.currentPosition[0]+this.duneBuggy.wheelPositions[0][0]*this.buggyScale, this.terrain.currentPosition[1]-this.duneBuggy.wheelPositions[0][1]*this.buggyScale).z,
        this.terrain.getPt(this.terrain.currentPosition[0]+this.duneBuggy.wheelPositions[1][0]*this.buggyScale, this.terrain.currentPosition[1]-this.duneBuggy.wheelPositions[1][1]*this.buggyScale).z,
        this.terrain.getPt(this.terrain.currentPosition[0]+this.duneBuggy.wheelPositions[2][0]*this.buggyScale, this.terrain.currentPosition[1]-this.duneBuggy.wheelPositions[2][1]*this.buggyScale).z,
        this.terrain.getPt(this.terrain.currentPosition[0]+this.duneBuggy.wheelPositions[3][0]*this.buggyScale, this.terrain.currentPosition[1]-this.duneBuggy.wheelPositions[3][1]*this.buggyScale).z
    );

    ////////// Update Dune Buggy transforms //////////

    this.buggySpin.rotation.y = Math.PI-this.duneBuggy.rotation;
    this.buggy_frame.rotation.x = this.duneBuggy.tilt; // tilt
    this.buggy_frame.rotation.z = this.duneBuggy.roll; // roll
    this.buggy_frame.position.y = this.duneBuggy.midHeight/this.buggyScale;
    
    this.buggy_frontLeftWheel.position.set(this.duneBuggy.wheelPositions[0][0], this.duneBuggy.wheelPositions[0][2]/this.buggyScale, this.duneBuggy.wheelPositions[0][1]);
    this.buggy_frontRightWheel.position.set(this.duneBuggy.wheelPositions[1][0], this.duneBuggy.wheelPositions[1][2]/this.buggyScale, this.duneBuggy.wheelPositions[1][1]);
    this.buggy_backLeftWheel.position.set(this.duneBuggy.wheelPositions[2][0], this.duneBuggy.wheelPositions[2][2]/this.buggyScale, this.duneBuggy.wheelPositions[2][1]);
    this.buggy_backRightWheel.position.set(this.duneBuggy.wheelPositions[3][0], this.duneBuggy.wheelPositions[3][2]/this.buggyScale, this.duneBuggy.wheelPositions[3][1]);

    this.buggy_frontLeftWheel.rotation.y = Math.PI-this.duneBuggy.rotation;
    this.buggy_frontRightWheel.rotation.y = Math.PI-this.duneBuggy.rotation;
    this.buggy_backLeftWheel.rotation.y = Math.PI-this.duneBuggy.rotation;
    this.buggy_backRightWheel.rotation.y = Math.PI-this.duneBuggy.rotation;


    // update light position to follow the dune buggy
    // this keeps the shadow from clipping
    this.directionalLight.position.y = 50+this.buggy_frame.position.y;
    this.directionalLight.target.y = this.buggy_frame.position.y;

    ////////// Update terrain geometry //////////
    this.geoPositions.set(this.terrain.returnPtArray(), 0);
    this.geoPositions.needsUpdate = true;
    this.geoUVs.set(this.terrain.returnUVArray(), 0);
    this.geoUVs.needsUpdate = true;

    // this.renderer.render( this.scene, this.camera );
}

// function onDown(x, y){
//     this.touching = true;
//     this.dragVector[0] = (2*x/window.innerWidth)-1;
//     // this.dragVector[1] -= dY;
// }

// function onUp(x, y, dX, dY){
//     this.touching = false;
//     this.dragVector = [0,0];
// }



function onWindowResize() {
    this.size = [window.innerWidth, window.innerHeight]
    // this.camera.aspect = window.innerWidth / window.innerHeight;
    // this.camera.updateProjectionMatrix();

    // this.renderer.setSize( window.innerWidth, window.innerHeight );

}

Main.prototype.animate = animate;
Main.prototype.onWindowResize = onWindowResize;

export { Main };

