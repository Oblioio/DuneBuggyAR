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
    directionalLight.shadow.camera.left = directionalLight.shadow.camera.bottom = -20;    // default    
    directionalLight.shadow.camera.right = directionalLight.shadow.camera.top = 20;    // default    
    
    // var helper = new CameraHelper( directionalLight.shadow.camera );
    // this.scene.add( helper );

    // directionalLight.rotation.z = Math.PI/4;
    this.scene.add( directionalLight );

    this.terrain = new DynamicTerrain(25, 50);
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
            // this.terrain.move(-0.00135, -0.00135);
            // this.terrain.move(-0.00135, -0.00135);
            this.terrain.setPosition(-176.2560000000046/5.12, -375.8159999999982/5.12)
            this.terrain.setPosition(-176.2560000000046/5.12, -375.8159999999982/5.12)
            this.terrain.setPosition(-176.2560000000046/5.12, -375.8159999999982/5.12)
            // this.terrain.setPosition(-176.2560000000046/5.12, -375.8159999999982/5.12)
            // this.terrain.setPosition(-176.2560000000046/5.12, -375.8159999999982/5.12)
            // this.terrain.move(-0.00135, -0.00135);
            // this.terrain.move(-0.00135, -0.00135);
            
            this.animate();
        }.bind(this)
    );
    
    this.timer = 0;
    this.terrain.setPosition(-176.2560000000046/5.12, -375.8159999999982/5.12)
}

function animate() {

    requestAnimationFrame( animate.bind(this) );

    
    this.terrain.move(this.duneBuggy.velocity[0], -this.duneBuggy.velocity[1]);
    // this.terrain.move(0.135, 0.135);
    // this.terrain.move(-0.000135, -0.000135);

    // this.terrain.setPosition(this.terrain.currentPosition[0]+0, this.terrain.currentPosition[1]+0.15)

    // this.buggy.position.z = this.terrain.getPt(this.terrain.currentPosition[0], this.terrain.currentPosition[1]).z;
    // this.buggy.position.z = 18;

    // first we apply rotation
    this.duneBuggy.rotate(0.00675);
    // this.duneBuggy.rotate(0.05);
    this.timer += 0.01;
    // this.masterGroup.rotation.z += 0.001;
    // this.masterGroup.rotation.z += 0.001;

    // next set wheelHeights
    this.duneBuggy.setWheelHeights(
        // this.terrain.getPt(this.terrain.currentPosition[0], this.terrain.currentPosition[1]).z,
        this.terrain.getPt(this.terrain.currentPosition[0]+this.duneBuggy.wheelPositions[0][0]*this.buggyScale, this.terrain.currentPosition[1]-this.duneBuggy.wheelPositions[0][1]*this.buggyScale).z,
        this.terrain.getPt(this.terrain.currentPosition[0]+this.duneBuggy.wheelPositions[1][0]*this.buggyScale, this.terrain.currentPosition[1]-this.duneBuggy.wheelPositions[1][1]*this.buggyScale).z,
        this.terrain.getPt(this.terrain.currentPosition[0]+this.duneBuggy.wheelPositions[2][0]*this.buggyScale, this.terrain.currentPosition[1]-this.duneBuggy.wheelPositions[2][1]*this.buggyScale).z,
        this.terrain.getPt(this.terrain.currentPosition[0]+this.duneBuggy.wheelPositions[3][0]*this.buggyScale, this.terrain.currentPosition[1]-this.duneBuggy.wheelPositions[3][1]*this.buggyScale).z
    );
    // console.log(this.terrain.currentPosition[0]*5.12, this.terrain.currentPosition[1]*5.12);
    // this.timer += 0.001;
    // console.log(Math.sin(this.timer)*5.12, this.terrain.getPt(0, Math.sin(this.timer)).z*10);
    // this.terrain.getPt(0, Math.sin(this.timer), true)

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

