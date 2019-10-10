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
const YAxisUnit = Scene.root.find('YAxisUnit');
const ZAxisUnit = Scene.root.find('ZAxisUnit');

const XAxisUnitConvert = XAxisUnit.worldTransform.position.sub(masterContainer.worldTransform.toSignal().position);
const YAxisUnitConvert = YAxisUnit.worldTransform.position.sub(masterContainer.worldTransform.toSignal().position);
const ZAxisUnitConvert = ZAxisUnit.worldTransform.position.sub(masterContainer.worldTransform.toSignal().position);

Patches.setPointValue('scene_position', masterContainer.worldTransform.toSignal().position);
Patches.setVectorValue('scene_xAxis', XAxisUnitConvert);
Patches.setVectorValue('scene_yAxis', YAxisUnitConvert);
Patches.setVectorValue('scene_zAxis', ZAxisUnitConvert);

// Diagnostics.log(sparkARShared.DuneBuggy());
// Time.ms.sub(Time.ms.pin()).trigger(delay).subscribeWithSnapshot(snapshot, callback)

const terrainContainer = Scene.root.find('terrainContainer');


function init(){

    this.terrain = new sparkARShared.DynamicTerrain(25, 50);
    this.duneBuggy = new sparkARShared.DuneBuggy();
    this.buggyScale = 0.5;

    this.buggy_frontLeftWheel = Scene.root.find('duneBuggy_frontWheelLeft');
    this.buggy_frontRightWheel = Scene.root.find('duneBuggy_frontWheelRight');
    this.buggy_backLeftWheel = Scene.root.find('duneBuggy_backWheelLeft');
    this.buggy_backRightWheel = Scene.root.find('duneBuggy_backWheelRight');

    // var timer = Time.ms.sub(Time.ms.pin()).interval(30).subscribe(bindFn(animate, this));
    // var timer = Time.setInterval(bindFn(animate, this), 33);

    Time.ms.interval(33).subscribeWithSnapshot({'ms':Time.ms}, bindFn(animate, this));
    // Time.ms.interval(33).subscribe(bindFn(animate, this));

    // var timeInterval = Time.ms.sub(Time.ms.pin());
    // var timer = timeInterval.interval(33).subscribe(bindFn(animate, this));
    this.currTime = Time.ms.pinLastValue();
    
    this.terrain.setPosition(50,50);
    this.duneBuggy.rotate(Math.PI/2);

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

const rad2Deg = 180/Math.PI;

function animate(_currTime2, snapshot) {
    var _currTime = Time.ms.pinLastValue();
    var _elapsedTime = snapshot.ms-this.currTime;
    this.currTime = snapshot.ms;

    // Diagnostics.log(_elapsedTime);
    // Diagnostics.watch("elapsedTime", elapsedTime);
    this.terrain.move(this.duneBuggy.velocity[0]*_elapsedTime/1000, -this.duneBuggy.velocity[1]*_elapsedTime/1000);
    this.duneBuggy.rotate(0.675*_elapsedTime/1000);


    // we need to adjust the coordinate
    // if the car is at 0,0, then we need to be at 50,50
    // if the car is at 25,25, then we need to be at 50,50
    Patches.setScalarValue('terrain_xPos', Reactive.val(wrapVal(this.terrain.currentPosition[0], 100)-50));
    Patches.setScalarValue('terrain_zPos', Reactive.val(wrapVal(this.terrain.currentPosition[1], 100)-50));


    
    this.duneBuggy.setWheelHeights(
        this.terrain.getPt(this.terrain.currentPosition[0]+this.duneBuggy.wheelPositions[0][0]*this.buggyScale, this.terrain.currentPosition[1]-this.duneBuggy.wheelPositions[0][1]*this.buggyScale).z,
        this.terrain.getPt(this.terrain.currentPosition[0]+this.duneBuggy.wheelPositions[1][0]*this.buggyScale, this.terrain.currentPosition[1]-this.duneBuggy.wheelPositions[1][1]*this.buggyScale).z,
        this.terrain.getPt(this.terrain.currentPosition[0]+this.duneBuggy.wheelPositions[2][0]*this.buggyScale, this.terrain.currentPosition[1]-this.duneBuggy.wheelPositions[2][1]*this.buggyScale).z,
        this.terrain.getPt(this.terrain.currentPosition[0]+this.duneBuggy.wheelPositions[3][0]*this.buggyScale, this.terrain.currentPosition[1]-this.duneBuggy.wheelPositions[3][1]*this.buggyScale).z
    );

    
    Patches.setVectorValue('buggy_frame_position', Reactive.vector(
        Reactive.val(0), 
        Reactive.val(this.duneBuggy.midHeight/this.buggyScale), 
        Reactive.val(0)
    ));

    
    Patches.setScalarValue('buggy_frame_rotationY', Reactive.val(rad2Deg*(-this.duneBuggy.rotation)));
    Patches.setScalarValue('buggy_frame_rotationX', Reactive.val(rad2Deg*this.duneBuggy.tilt));
    Patches.setScalarValue('buggy_frame_rotationZ', Reactive.val(rad2Deg*this.duneBuggy.roll));

    // this.buggySpin.rotation.y = Math.PI-this.duneBuggy.rotation;
    // this.buggy_frame.rotation.x = this.duneBuggy.tilt; // tilt
    // this.buggy_frame.rotation.z = this.duneBuggy.roll; // roll
    // this.buggy_frame.position.y = this.duneBuggy.midHeight/this.buggyScale;
    
    // Patches.setVectorValue('buggy_FL_Position', Reactive.vector(
    //     Reactive.val(0), 
    //     Reactive.val(this.duneBuggy.wheelPositions[0][2]/this.buggyScale), 
    //     Reactive.val(0)
    // ));
    Patches.setVectorValue('buggy_FL_Position', Reactive.vector(
        Reactive.val(-this.duneBuggy.wheelPositions[0][0]), 
        Reactive.val(this.duneBuggy.wheelPositions[0][2]/this.buggyScale), 
        // Reactive.val(this.duneBuggy.midHeight/this.buggyScale), 
        Reactive.val(-this.duneBuggy.wheelPositions[0][1])
    ));
    Patches.setVectorValue('buggy_FR_Position', Reactive.vector(
        Reactive.val(-this.duneBuggy.wheelPositions[1][0]), 
        Reactive.val(this.duneBuggy.wheelPositions[1][2]/this.buggyScale), 
        // Reactive.val(this.duneBuggy.midHeight/this.buggyScale), 
        Reactive.val(-this.duneBuggy.wheelPositions[1][1])
    ));
    Patches.setVectorValue('buggy_BL_Position', Reactive.vector(
        Reactive.val(-this.duneBuggy.wheelPositions[2][0]), 
        Reactive.val(this.duneBuggy.wheelPositions[2][2]/this.buggyScale), 
        // Reactive.val(this.duneBuggy.midHeight/this.buggyScale), 
        Reactive.val(-this.duneBuggy.wheelPositions[2][1])
    ));
    Patches.setVectorValue('buggy_BR_Position', Reactive.vector(
        Reactive.val(-this.duneBuggy.wheelPositions[3][0]), 
        Reactive.val(this.duneBuggy.wheelPositions[3][2]/this.buggyScale), 
        // Reactive.val(this.duneBuggy.midHeight/this.buggyScale), 
        Reactive.val(-this.duneBuggy.wheelPositions[3][1])
    ));
    // this.buggy_frontLeftWheel.position.set(this.duneBuggy.wheelPositions[0][0], this.duneBuggy.wheelPositions[0][2]/this.buggyScale, this.duneBuggy.wheelPositions[0][1]);
    // this.buggy_frontRightWheel.position.set(this.duneBuggy.wheelPositions[1][0], this.duneBuggy.wheelPositions[1][2]/this.buggyScale, this.duneBuggy.wheelPositions[1][1]);
    // this.buggy_backLeftWheel.position.set(this.duneBuggy.wheelPositions[2][0], this.duneBuggy.wheelPositions[2][2]/this.buggyScale, this.duneBuggy.wheelPositions[2][1]);
    // this.buggy_backRightWheel.position.set(this.duneBuggy.wheelPositions[3][0], this.duneBuggy.wheelPositions[3][2]/this.buggyScale, this.duneBuggy.wheelPositions[3][1]);

    Patches.setScalarValue('buggy_FrontWheel_rotationY', Reactive.val(rad2Deg*(Math.PI-this.duneBuggy.rotation)));
    Patches.setScalarValue('buggy_BackWheel_rotationY', Reactive.val(rad2Deg*(Math.PI-this.duneBuggy.rotation)));
    // this.buggy_frontLeftWheel.rotation.y = Math.PI-this.duneBuggy.rotation;
    // this.buggy_frontRightWheel.rotation.y = Math.PI-this.duneBuggy.rotation;
    // this.buggy_backLeftWheel.rotation.y = Math.PI-this.duneBuggy.rotation;
    // this.buggy_backRightWheel.rotation.y = Math.PI-this.duneBuggy.rotation;

    // Patches.setVectorValue()
}

init.call({});
