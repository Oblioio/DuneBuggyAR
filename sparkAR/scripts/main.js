//==============================================================================
// Welcome to scripting in Spark AR Studio! Helpful links:
//
// Scripting Basics - https://fb.me/spark-scripting-basics
// Reactive Programming - https://fb.me/spark-reactive-programming
// Scripting Object Reference - https://fb.me/spark-scripting-reference
// Changelogs - https://fb.me/spark-changelog
//==============================================================================

// How to load in modules
const Diagnostics = require('Diagnostics');
const Scene = require('Scene');
const Reactive = require('Reactive');
const Patches = require('Patches'); 
const Time = require('Time'); 

// How to access scene objects (uncomment line below to activate)
// const directionalLight = Scene.root.find('directionalLight0');

// How to access class properties (uncomment line below to activate)
// const directionalLightIntensity = directionalLight.intensity;

// How to log messages to the console (uncomment line below to activate)
// Diagnostics.log('Console message logged from the script.');

const masterContainer = Scene.root.find('masterContainer');
const XAxisUnit = Scene.root.find('XAxisUnit');
const ZAxisUnit = Scene.root.find('ZAxisUnit');

const XAxisUnitConvert = XAxisUnit.worldTransform.position.sub(masterContainer.worldTransform.toSignal().position);
const ZAxisUnitConvert = ZAxisUnit.worldTransform.position.sub(masterContainer.worldTransform.toSignal().position);

Patches.setPointValue('scene_position', masterContainer.worldTransform.toSignal().position);
Patches.setVectorValue('scene_xAxis', XAxisUnitConvert);
Patches.setVectorValue('scene_zAxis', ZAxisUnitConvert);

// Diagnostics.log(sparkARShared.DuneBuggy());
// Time.ms.sub(Time.ms.pin()).trigger(delay).subscribeWithSnapshot(snapshot, callback)

const terrainContainer = Scene.root.find('terrainContainer');

var that = {};
function init(){
    Diagnostics.log(sparkARShared)

    that.terrain = new sparkARShared.DynamicTerrain(25, 50);
    that.duneBuggy = new sparkARShared.DuneBuggy();
    that.buggyScale = 0.5;

    var timer = Time.ms.sub(Time.ms.pin()).interval(30).subscribe(bindFn(animate, that));

    // this.terrain.setPosition(-176.2560000000046/5.12, -375.8159999999982/5.12);

}

// why do we have to create a stupid polyfill for function.bind()? ask the facebook devs
function bindFn(fn, scope){
    if(fn.bind)return fn.bind(scope);

    /// v1
    return function () {
        var args = Array.prototype.slice.call(arguments, 0);
        return fn.apply(scope, args);
    };  
}

function wrapVal(val, range){
    if(val >=0){
        return val%range;
    } else {
        return range-(Math.abs(val)%range)
    }
}

function animate(elapsedTime) {

    this.terrain.move(this.duneBuggy.velocity[0], -this.duneBuggy.velocity[1]);
    // terrainContainer.transform.position.x = wrapVal(this.terrain.currentPosition[0], 100);
    // terrainContainer.transform.position.z = wrapVal(this.terrain.currentPosition[1], 100);

    // we need to adjust the coordinate
    // if the car is at 0,0, then we need to be at 50,50
    // if the car is at 25,25, then we need to be at 50,50
    Patches.setScalarValue('terrain_xPos', Reactive.val(wrapVal(this.terrain.currentPosition[0], 100)-50));
    Patches.setScalarValue('terrain_zPos', Reactive.val(wrapVal(this.terrain.currentPosition[1], 100)-50));


    this.duneBuggy.rotate(0.00675);
    
    this.duneBuggy.setWheelHeights(
        this.terrain.getPt(this.terrain.currentPosition[0]+this.duneBuggy.wheelPositions[0][0]*this.buggyScale, this.terrain.currentPosition[1]-this.duneBuggy.wheelPositions[0][1]*this.buggyScale).z,
        this.terrain.getPt(this.terrain.currentPosition[0]+this.duneBuggy.wheelPositions[1][0]*this.buggyScale, this.terrain.currentPosition[1]-this.duneBuggy.wheelPositions[1][1]*this.buggyScale).z,
        this.terrain.getPt(this.terrain.currentPosition[0]+this.duneBuggy.wheelPositions[2][0]*this.buggyScale, this.terrain.currentPosition[1]-this.duneBuggy.wheelPositions[2][1]*this.buggyScale).z,
        this.terrain.getPt(this.terrain.currentPosition[0]+this.duneBuggy.wheelPositions[3][0]*this.buggyScale, this.terrain.currentPosition[1]-this.duneBuggy.wheelPositions[3][1]*this.buggyScale).z
    );

    
    // this.buggySpin.rotation.y = Math.PI-this.duneBuggy.rotation;
    // this.buggy_frame.rotation.x = this.duneBuggy.tilt; // tilt
    // this.buggy_frame.rotation.z = this.duneBuggy.roll; // roll
    // this.buggy_frame.position.y = this.duneBuggy.midHeight/this.buggyScale;
    
    // this.buggy_frontLeftWheel.position.set(this.duneBuggy.wheelPositions[0][0], this.duneBuggy.wheelPositions[0][2]/this.buggyScale, this.duneBuggy.wheelPositions[0][1]);
    // this.buggy_frontRightWheel.position.set(this.duneBuggy.wheelPositions[1][0], this.duneBuggy.wheelPositions[1][2]/this.buggyScale, this.duneBuggy.wheelPositions[1][1]);
    // this.buggy_backLeftWheel.position.set(this.duneBuggy.wheelPositions[2][0], this.duneBuggy.wheelPositions[2][2]/this.buggyScale, this.duneBuggy.wheelPositions[2][1]);
    // this.buggy_backRightWheel.position.set(this.duneBuggy.wheelPositions[3][0], this.duneBuggy.wheelPositions[3][2]/this.buggyScale, this.duneBuggy.wheelPositions[3][1]);

    // this.buggy_frontLeftWheel.rotation.y = Math.PI-this.duneBuggy.rotation;
    // this.buggy_frontRightWheel.rotation.y = Math.PI-this.duneBuggy.rotation;
    // this.buggy_backLeftWheel.rotation.y = Math.PI-this.duneBuggy.rotation;
    // this.buggy_backRightWheel.rotation.y = Math.PI-this.duneBuggy.rotation;
}

init();
