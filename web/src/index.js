import { DynamicTerrain, DuneBuggy} from "./shared.js";
import { Interaction} from "./interaction.js";

import { 
    Scene,
    PerspectiveCamera, 
    WebGLRenderer,
    MeshLambertMaterial,
    Mesh,
    TextureLoader,
    DirectionalLight,
    Vector2,
    Group,
    PCFSoftShadowMap,
    ClampToEdgeWrapping,
    NearestFilter
} from 'three';

import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {OBJLoader2} from 'three/examples/jsm/loaders/OBJLoader2'
import { AmbientLight } from "three/build/three.module";

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
    this.camera = new PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
    this.camera.position.z = 100;
    this.camera.position.y = 100;
    // this.camera.rotation.x = -Math.PI/4;
    this.camera.lookAt(0,0,0);

    // this.camera.position.y = 0;
    // this.camera.rotation.x = 0;
    // this.camera.position.z = 150;
    window.addEventListener( 'resize', onWindowResize.bind(this), false );

    var directionalLight = new DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set(50,50,50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 512;  // default
    directionalLight.shadow.mapSize.height = 512; // default
    directionalLight.shadow.camera.near = 0.5;    // default
    directionalLight.shadow.camera.far = 1000;     // default
    directionalLight.shadow.camera.left = directionalLight.shadow.camera.bottom = -30;    // default    
    directionalLight.shadow.camera.right = directionalLight.shadow.camera.top = 30;    // default
    this.directionalLight = directionalLight;

    var ambientLight = new AmbientLight( 0xffffff, 0.5 );
    this.scene.add( ambientLight );

    
    // var helper = new CameraHelper( directionalLight.shadow.camera );
    // this.scene.add( helper );

    // directionalLight.rotation.z = Math.PI/4;
    this.scene.add( directionalLight );

    this.terrain = new DynamicTerrain(Math.round(25*1.75), 50);
    this.masterGroup = new Group();
    this.masterGroup.scale.set(2,2,2);
    

    this.duneBuggy = new DuneBuggy();
    this.duneBuggy.rotate(Math.PI); // default start direction

    this.buggyScale = 0.5;

    this.terrainMesh = new Mesh(this.terrainGeo, this.terrainMat);
    this.terrainMesh.receiveShadow = true;
    // this.terrainMesh.visible = false;


    this.scene.add(this.masterGroup);
    this.terrainContainer = new Group();
    this.terrainContainer.scale.y = 1.1333333;
    this.masterGroup.add(this.terrainContainer);
    // this.masterGroup.add(this.terrainMesh);

    new GLTFLoader().load(
        'models/duneBuggy.glb',
        function ( gltf ) {
            window.gltf = gltf;
            this.buggy_frame = gltf.scene.getObjectByName("Frame");
            this.directionalLight.target = this.buggy_frame;

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

            // Load the terrain model peices
            new OBJLoader2().load("models/terrain_NE.obj", function(terrainNEGroup){
                new OBJLoader2().load("models/terrain_NW.obj", function(terrainNWGroup){
                    new OBJLoader2().load("models/terrain_SE.obj", function(terrainSEGroup){
                        new OBJLoader2().load("models/terrain_SW.obj", function(terrainSWGroup){
                            
                            var setupObj = function(obj, textureURL){
                                obj.material = new MeshLambertMaterial({
                                    map: new TextureLoader().load( textureURL ),
                                    alphaMap: new TextureLoader().load( 'images/alphaMask.jpg', function(texture){
                                        texture.wrapS = texture.wrapT = ClampToEdgeWrapping;
                                        texture.magFilter = NearestFilter;
                                        texture.repeat = new Vector2(2.5, 2.5);
                                    } ),
                                    alphaTest: 0.5
                                })
                                
                                // materials only use on set of UV offsets so I'm manually adding
                                // UV2 and a uniform to adjust UV2
                                obj.material.onBeforeCompile = function ( shader ) {
                                    // i binded the function scope to the material so "this" is the material
                                    // lets save the shader as variable so we can mod values later
                                    this.shader = shader;
    
                                    shader.uniforms.uv2Offset = { value: new Vector2(0,0) };
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

                            this.terrain_NE = terrainNEGroup.children[0];
                            setupObj.call(this, this.terrain_NE, 'images/albedo_NE.jpg');

                            this.terrain_NW = terrainNWGroup.children[0];
                            setupObj.call(this, this.terrain_NW, 'images/albedo_NW.jpg');

                            this.terrain_SE = terrainSEGroup.children[0];
                            setupObj.call(this, this.terrain_SE, 'images/albedo_SE.jpg');

                            this.terrain_SW = terrainSWGroup.children[0];
                            setupObj.call(this, this.terrain_SW, 'images/albedo_SW.jpg');

                            this.animate();

                        }.bind(this))
                    }.bind(this))
                }.bind(this))
            }.bind(this))
        }.bind(this)
    );

    this.currTime = new Date().getTime();
    
    this.terrain.setPosition(50,50);
    this.autoDrive = false;
    this.accelerate = 1;
    this.dragVector = [0,0];
    this.touching = false;

    // this is a class I often reuse to capture user input
    this.interaction = new Interaction({
        onDown: onDown.bind(this),
        onDrag: onDown.bind(this),
        onUp: onUp.bind(this)
    });
}

function clamp(min, max, val){
    return Math.min(max, Math.max(min, val));
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
    var _currTime = new Date().getTime();
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
        
        this.duneBuggy.accelerationXY_Mult = ((this.touching)?1:0)+(this.interaction.arrows.up?1:0)-(this.interaction.arrows.down?1:0);
        this.duneBuggy.rotate( (this.dragVector[0]/20)+((this.interaction.arrows.left?-1:0)+(this.interaction.arrows.right?1:0))/20 );
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
    
    this.renderer.render( this.scene, this.camera );
}

function onDown(x, y){
    this.touching = true;
    this.dragVector[0] = (2*x/window.innerWidth)-1;
    // this.dragVector[1] -= dY;
}

function onUp(x, y, dX, dY){
    this.touching = false;
    this.dragVector = [0,0];
}



function onWindowResize() {
    this.size = [window.innerWidth, window.innerHeight]
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );

}

Main.prototype.animate = animate;
Main.prototype.onWindowResize = onWindowResize;

window.main = new Main();


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
