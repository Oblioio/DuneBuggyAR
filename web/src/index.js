import { DynamicTerrain, DuneBuggy} from "./shared.js";

import { 
    Scene,
    PerspectiveCamera, 
    WebGLRenderer,
    BufferGeometry,
    BufferAttribute,
    Float32BufferAttribute,
    MeshBasicMaterial,
    MeshStandardMaterial,
    Mesh,
    TextureLoader,
    RepeatWrapping,
    DirectionalLight,
    Vector2,
    Group,
    PCFSoftShadowMap,
    CameraHelper
} from 'three';

import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'

'use strict';

console.log(DynamicTerrain);

function Main () {
    console.log("what up ")
    console.log(DynamicTerrain)
    this.renderer = new WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;

    this.canvas = this.renderer.domElement;
    document.body.appendChild(this.canvas);
    console.log(document.body)

    this.scene = new Scene();
    this.camera = new PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
    this.camera.position.z = 100;
    this.camera.position.y = 100;
    // this.camera.rotation.x = -Math.PI/4;
    this.camera.lookAt(0,0,0);

    // this.camera.position.y = 0;
    // this.camera.rotation.x = 0;
    // this.camera.position.z = 150;
    window.addEventListener( 'resize', onWindowResize.bind(this), false );

    var directionalLight = new DirectionalLight( 0xffffff, 1.5 );
    directionalLight.position.set(50,50,-50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 512;  // default
    directionalLight.shadow.mapSize.height = 512; // default
    directionalLight.shadow.camera.near = 0.5;    // default    
    directionalLight.shadow.camera.far = 100;     // default
    directionalLight.shadow.camera.left = directionalLight.shadow.camera.bottom = -30;    // default    
    directionalLight.shadow.camera.right = directionalLight.shadow.camera.top = 30;    // default
    this.directionalLight = directionalLight;
    
    // var helper = new CameraHelper( directionalLight.shadow.camera );
    // this.scene.add( helper );

    // directionalLight.rotation.z = Math.PI/4;
    this.scene.add( directionalLight );

    this.terrain = new DynamicTerrain(Math.round(25*1.75), 50);
    // this.terrain = new DynamicTerrain(50, 100);
    this.masterGroup = new Group();
    this.masterGroup.scale.set(2,2,2);

    // console.log(this.terrain.returnIndiceArraySnap());

    this.terrainGeo = new BufferGeometry();
    this.terrainGeo.addAttribute( 'position', new Float32BufferAttribute( this.terrain.returnPtArray(), 3 ) );
    this.terrainGeo.addAttribute( 'uv', new Float32BufferAttribute( this.terrain.returnUVArray(), 2 ) );
    this.terrainGeo.addAttribute( 'normal', new Float32BufferAttribute( this.terrain.returnNormalArray(), 3 ) );
    this.geoPositions = this.terrainGeo.attributes.position;
    this.geoUVs = this.terrainGeo.attributes.uv;
    this.terrainGeo.setIndex( this.terrain.returnIndiceArraySnap() );

    var texture = new TextureLoader().load( 'images/Desert_Albedo.png' );
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    var ntexture = new TextureLoader().load( 'images/Desert_Normal.png' );
    ntexture.wrapS = RepeatWrapping;
    ntexture.wrapT = RepeatWrapping;
    this.terrainMat = new MeshStandardMaterial( {
        map: texture,
        normalMap: ntexture,
        normalScale: new Vector2( 0.8, 0.8 ),
        metalness: 0,
        roughness: 0.75
    } );
    // this.terrainMat = new MeshBasicMaterial({
    //     map: texture
    // })

    this.duneBuggy = new DuneBuggy();
    this.buggyScale = 0.5;

    this.terrainMesh = new Mesh(this.terrainGeo, this.terrainMat);
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
            this.buggy_frontRightWheel = gltf.scene.getObjectByName("FrontRightWheel");
            this.buggy_backLeftWheel = gltf.scene.getObjectByName("BackLeftWheel");
            this.buggy_backRightWheel = gltf.scene.getObjectByName("BackRightWheel");
            this.buggy = new Group();
            this.buggy.scale.set(this.buggyScale, this.buggyScale, this.buggyScale);
            this.masterGroup.add(this.buggy);
            this.buggySpin = new Group();
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
    this.duneBuggy.rotate(Math.PI/2);
}

function animate() {
    var _currTime = new Date().getTime();
    var _elapsedTime = _currTime-this.currTime;
    this.currTime = _currTime;

    requestAnimationFrame( animate.bind(this) );
    // console.log(_currTime);

    this.terrain.move(this.duneBuggy.velocity[0]*_elapsedTime/1000, -this.duneBuggy.velocity[1]*_elapsedTime/1000);
    this.duneBuggy.rotate(0.475*_elapsedTime/1000);
    // this.terrain.move(this.duneBuggy.velocity[0]/10, -this.duneBuggy.velocity[1]/10);
// 
    // this.terrain.move(0.135, 0.135);
    // this.terrain.move(0, -0.135);

    // this.terrain.setPosition(this.terrain.currentPosition[0]+0, this.terrain.currentPosition[1]+0.15)

    // this.buggy.position.z = this.terrain.getPt(this.terrain.currentPosition[0], this.terrain.currentPosition[1]).z;
    // this.buggy.position.z = 18;

    // first we apply rotation
    // this.duneBuggy.rotate(0.00675);
    // this.duneBuggy.rotate(0.05);
    // this.masterGroup.rotation.z += 0.001;
    // this.masterGroup.rotation.z += 0.001;

    // next set wheelHeights
    this.duneBuggy.update(
        _elapsedTime/1000,
        // this.terrain.getPt(this.terrain.currentPosition[0], this.terrain.currentPosition[1]).z,
        this.terrain.getPt(this.terrain.currentPosition[0]+this.duneBuggy.wheelPositions[0][0]*this.buggyScale, this.terrain.currentPosition[1]-this.duneBuggy.wheelPositions[0][1]*this.buggyScale).z,
        this.terrain.getPt(this.terrain.currentPosition[0]+this.duneBuggy.wheelPositions[1][0]*this.buggyScale, this.terrain.currentPosition[1]-this.duneBuggy.wheelPositions[1][1]*this.buggyScale).z,
        this.terrain.getPt(this.terrain.currentPosition[0]+this.duneBuggy.wheelPositions[2][0]*this.buggyScale, this.terrain.currentPosition[1]-this.duneBuggy.wheelPositions[2][1]*this.buggyScale).z,
        this.terrain.getPt(this.terrain.currentPosition[0]+this.duneBuggy.wheelPositions[3][0]*this.buggyScale, this.terrain.currentPosition[1]-this.duneBuggy.wheelPositions[3][1]*this.buggyScale).z
    );
    // console.log(this.terrain.currentPosition[0]*5.12, this.terrain.currentPosition[1]*5.12);

    this.buggySpin.rotation.y = Math.PI-this.duneBuggy.rotation;
    this.buggy_frame.rotation.x = this.duneBuggy.tilt; // tilt
    this.buggy_frame.rotation.z = this.duneBuggy.roll; // roll
    this.buggy_frame.position.y = this.duneBuggy.midHeight/this.buggyScale;
    this.directionalLight.position.y = 50+this.buggy_frame.position.y;
    this.directionalLight.target.y = this.buggy_frame.position.y;
    
    this.buggy_frontLeftWheel.position.set(this.duneBuggy.wheelPositions[0][0], this.duneBuggy.wheelPositions[0][2]/this.buggyScale, this.duneBuggy.wheelPositions[0][1]);
    this.buggy_frontRightWheel.position.set(this.duneBuggy.wheelPositions[1][0], this.duneBuggy.wheelPositions[1][2]/this.buggyScale, this.duneBuggy.wheelPositions[1][1]);
    this.buggy_backLeftWheel.position.set(this.duneBuggy.wheelPositions[2][0], this.duneBuggy.wheelPositions[2][2]/this.buggyScale, this.duneBuggy.wheelPositions[2][1]);
    this.buggy_backRightWheel.position.set(this.duneBuggy.wheelPositions[3][0], this.duneBuggy.wheelPositions[3][2]/this.buggyScale, this.duneBuggy.wheelPositions[3][1]);

    this.buggy_frontLeftWheel.rotation.y = Math.PI-this.duneBuggy.rotation;
    this.buggy_frontRightWheel.rotation.y = Math.PI-this.duneBuggy.rotation;
    this.buggy_backLeftWheel.rotation.y = Math.PI-this.duneBuggy.rotation;
    this.buggy_backRightWheel.rotation.y = Math.PI-this.duneBuggy.rotation;


    this.geoPositions.set(this.terrain.returnPtArray(), 0);
    this.geoPositions.needsUpdate = true;
    this.geoUVs.set(this.terrain.returnUVArray(), 0);
    this.geoUVs.needsUpdate = true;

    this.render();
}

function render() {
    this.renderer.render( this.scene, this.camera );
}

function onWindowResize() {

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );

}

Main.prototype.render = render;
Main.prototype.animate = animate;
Main.prototype.render = render;
Main.prototype.onWindowResize = onWindowResize;

window.main = new Main();

