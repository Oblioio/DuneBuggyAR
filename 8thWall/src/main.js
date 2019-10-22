import { DynamicTerrain, DuneBuggy } from "./shared.js";
import {OBJLoader2} from 'three/examples/jsm/loaders/OBJLoader2'

'use strict';

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
    this.camera = camera;

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


    this.duneBuggy = new DuneBuggy();
    this.duneBuggy.rotate(Math.PI); // default start direction

    this.buggyScale = 0.5;

    this.scene.add(this.masterGroup);
    this.terrainContainer = new THREE.Group();
    this.terrainContainer.scale.y = 1.1333333;
    this.masterGroup.add(this.terrainContainer);

    this.currTime = new Date().getTime();
    
    this.terrain.setPosition(50,50);
    this.autoDrive = false;
    this.accelerate = 1;
    this.dragVector = [0,0];
    this.touching = false;
}

function addBuggy (buggy) {
    console.log('BUGGY!', buggy);
    this.buggy_frame = buggy.children.find((child) => {
        return child.name === 'Frame';
    });

    this.buggy_frontLeftWheel = buggy.children.find((child) => {
        return child.name === 'FrontLeftWheel';
    });
    this.buggy_frontRightWheel = this.buggy_frontLeftWheel.clone();
    this.buggy_backLeftWheel = this.buggy_frontLeftWheel.clone();
    this.buggy_backRightWheel = this.buggy_frontLeftWheel.clone();

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

    // new OBJLoader2().load("models/terrain_NE.obj", function(terrainNEGroup){
    //     new OBJLoader2().load("models/terrain_NW.obj", function(terrainNWGroup){
    //         new OBJLoader2().load("models/terrain_SE.obj", function(terrainSEGroup){
    //             new OBJLoader2().load("models/terrain_SW.obj", function(terrainSWGroup){
    //                 console.log(terrainSWGroup);
    //                 var setupObj = function(obj, textureURL){
    //                     // obj.material = new THREE.MeshLambertMaterial({
    //                         // map: new THREE.TextureLoader().load( textureURL ),
    //                         // alphaMap: new THREE.TextureLoader().load( 'images/alphaMask.jpg', function(texture){
    //                         //     texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    //                         //     texture.magFilter = THREE.NearestFilter;
    //                         //     texture.repeat = new THREE.Vector2(2.5, 2.5);
    //                         // } ),
    //                         // alphaTest: 0.5
    //                     // })
                        
    //                     // materials only use on set of UV offsets so I'm manually adding
    //                     // UV2 and a uniform to adjust UV2
    //                     // obj.material.onBeforeCompile = function ( shader ) {
    //                     //     // i binded the function scope to the material so "this" is the material
    //                     //     // lets save the shader as variable so we can mod values later
    //                     //     this.shader = shader;

    //                     //     shader.uniforms.uv2Offset = { value: new THREE.Vector2(0,0) };
    //                     //     shader.vertexShader = 'uniform vec2 uv2Offset;\n' + shader.vertexShader;

    //                     //     shader.vertexShader = shader.vertexShader.replace('#include <uv2_pars_vertex>', 'varying vec2 vUv2; \n');
    //                     //     shader.vertexShader = shader.vertexShader.replace('#include <uv2_vertex>', 'vUv2 = (uv*0.5)+uv2Offset; \n');
    //                     //     shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex> \n');                             
                            
    //                     //     shader.fragmentShader = shader.fragmentShader.replace('#include <uv2_pars_fragment>','varying vec2 vUv2; \n');
    //                     //     shader.fragmentShader = shader.fragmentShader.replace('#include <alphamap_fragment>', 'diffuseColor.a *= texture2D( alphaMap, vUv2 ).g; \n');
    //                     // }.bind(obj.material);

    //                     obj.receiveShadow = true;
    //                     this.terrainContainer.add(obj);
    //                 }

    //                 this.terrain_NE = terrainNEGroup.children[0];
    //                 setupObj.call(this, this.terrain_NE, 'images/albedo_NE.jpg');

    //                 this.terrain_NW = terrainNWGroup.children[0];
    //                 setupObj.call(this, this.terrain_NW, 'images/albedo_NW.jpg');

    //                 this.terrain_SE = terrainSEGroup.children[0];
    //                 setupObj.call(this, this.terrain_SE, 'images/albedo_SE.jpg');

    //                 this.terrain_SW = terrainSWGroup.children[0];
    //                 setupObj.call(this, this.terrain_SW, 'images/albedo_SW.jpg');

    //                 this.animate();

    //             }.bind(this))
    //         }.bind(this))
    //     }.bind(this))
    // }.bind(this))

    // // this.animate();
}

function setupObj (obj, textureURL) {
    obj.material = new THREE.MeshLambertMaterial({
        map: new THREE.TextureLoader().load( textureURL ),
        alphaMap: new THREE.TextureLoader().load( 'images/alphaMask.jpg', function(texture){
            texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.magFilter = THREE.NearestFilter;
            texture.repeat = new THREE.Vector2(2.5, 2.5);
        } ),
        alphaTest: 0.5
    })
    
    // materials only use on set of UV offsets so I'm manually adding
    // UV2 and a uniform to adjust UV2
    obj.material.onBeforeCompile = function ( shader ) {
        // i binded the function scope to the material so "this" is the material
        // lets save the shader as variable so we can mod values later
        this.shader = shader;

        shader.uniforms.uv2Offset = { value: new THREE.Vector2(0,0) };
        shader.vertexShader = 'uniform vec2 uv2Offset;\n' + shader.vertexShader;

        shader.vertexShader = shader.vertexShader.replace('#include <uv2_pars_vertex>', 'varying vec2 vUv2; \n');
        shader.vertexShader = shader.vertexShader.replace('#include <uv2_vertex>', 'vUv2 = (uv*0.5)+uv2Offset; \n');
        shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex> \n');                             
        
        shader.fragmentShader = shader.fragmentShader.replace('#include <uv2_pars_fragment>','varying vec2 vUv2; \n');
        shader.fragmentShader = shader.fragmentShader.replace('#include <alphamap_fragment>', 'diffuseColor.a *= texture2D( alphaMap, vUv2 ).g; \n');
    }.bind(obj.material);

    obj.receiveShadow = true;
    this.terrainContainer.add(obj);
}

function addTerrain (terrain_id, terrain) {
    

    switch (terrain_id) {
        case 'ne':
            this.terrain_NE = terrain.children[0];
            setupObj.call(this, this.terrain_NE, 'images/albedo_NE.jpg');
            break;
        case 'nw':
            this.terrain_NW = terrain.children[0];
            setupObj.call(this, this.terrain_NW, 'images/albedo_NW.jpg');
            break;
        case 'se':
            this.terrain_SE = terrain.children[0];
            setupObj.call(this, this.terrain_SE, 'images/albedo_SE.jpg');
            break;
        case 'sw':
            this.terrain_SW = terrain.children[0];
            setupObj.call(this, this.terrain_SW, 'images/albedo_SW.jpg');
            break;
    }

    if (this.terrain_NE, this.terrain_NW, this.terrain_SE, this.terrain_SW) {
        console.log('ANIMATE!!!');
        this.animate();
    }
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

function moveTerrain(x, y){
    // terrain peices need to wrap around when panning
    var X1 = (x>25)?-100:0;
    var X2 = (x<-25)?100:0;
    var Y1 = (y>25)?-100:0;
    var Y2 = (y<-25)?100:0;

    // move the terrain container and peices
    this.terrainContainer.position.set(x,0,y);
    this.terrain_NE.position.set(X1,0,Y1);
    this.terrain_NW.position.set(X2,0,Y1);
    this.terrain_SE.position.set(X1,0,Y2);
    this.terrain_SW.position.set(X2,0,Y2);

    // update the uv offset for the alpha texture
    var divider = 100;    
    if(this.terrain_NE.material.shader)
        this.terrain_NE.material.shader.uniforms.uv2Offset.value.set(0.5+((X1+x)/divider), 0.5+((Y1+y)/divider));
    if(this.terrain_NW.material.shader)
        this.terrain_NW.material.shader.uniforms.uv2Offset.value.set(((X2+x)/divider), 0.5+((Y1+y)/divider));
    if(this.terrain_SE.material.shader)
        this.terrain_SE.material.shader.uniforms.uv2Offset.value.set(0.5+((X1+x)/divider), ((Y2+y)/divider));
    if(this.terrain_SW.material.shader)
        this.terrain_SW.material.shader.uniforms.uv2Offset.value.set(((X2+x)/divider), ((Y2+y)/divider));
}

var frameIndex = 0;
function animate() {
    requestAnimationFrame( animate.bind(this) );

    // get elapsed time
    var _currTime = Date.now();
    var _elapsedTime = _currTime-this.currTime;
    this.currTime = _currTime;

    ////////// Update terrain and dune buggy //////////
    this.terrain.move(
        this.duneBuggy.vectorXY[0]*this.duneBuggy.speedXY*_elapsedTime/1000, 
        -this.duneBuggy.vectorXY[1]*this.duneBuggy.speedXY*_elapsedTime/1000
    );
    moveTerrain.call(this, -(wrapVal(this.terrain.currentPosition[0], 100)-50), (wrapVal(this.terrain.currentPosition[1], 100)-50) );

    if(this.autoDrive){
        this.duneBuggy.accelerationXY_Mult = 1;
        this.duneBuggy.rotate(((Math.sin(3+this.currTime/8000)+Math.sin(this.currTime/800))*0.65)*_elapsedTime/1000);
    } else {
        let timescale = (1/60) / (_elapsedTime / 1000);
        this.duneBuggy.accelerationXY_Mult = 1; // ((this.touching)?1:0)+(this.interaction.arrows.up?1:0)-(this.interaction.arrows.down?1:0);
        let rot = getCameraRotation.call(this);

        let rotValue = Math.min(1, rot*1.75 );
        // console.log(rotValue);
        if (!isNaN(rotValue)) this.duneBuggy.rotate( rotValue * timescale );
        // this.duneBuggy.rotate( (this.dragVector[0]/20)+((this.interaction.arrows.left?-1:0)+(this.interaction.arrows.right?1:0))/20 );
    }

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

}

Main.prototype.animate = animate;
Main.prototype.addBuggy = addBuggy;
Main.prototype.addTerrain = addTerrain;

export { Main };


//////////////////// HELPER FUNCTIONS ////////////////////
// (I put these at the bottom to keep them out of the way)

// this is basically Modulo, but it works with negative numbers
function wrapVal(val, range){
    if(val >=0){
        return val%range;
    } else {
        return range-(Math.abs(val)%range)
    }
}