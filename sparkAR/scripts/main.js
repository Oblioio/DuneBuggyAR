
const Diagnostics = require('Diagnostics');
const Scene = require('Scene');
const Reactive = require('Reactive');
const Patches = require('Patches'); 
const Time = require('Time'); 
const TouchGestures = require('TouchGestures');

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

function init(){

    this.terrain = new sparkARShared.DynamicTerrain(25, 50);
    this.duneBuggy = new sparkARShared.DuneBuggy();
    this.buggyScale = 0.5;

    this.buggy_frontLeftWheel = Scene.root.find('duneBuggy_frontWheelLeft');
    this.buggy_frontRightWheel = Scene.root.find('duneBuggy_frontWheelRight');
    this.buggy_backLeftWheel = Scene.root.find('duneBuggy_backWheelLeft');
    this.buggy_backRightWheel = Scene.root.find('duneBuggy_backWheelRight');

    Time.ms.interval(33).subscribeWithSnapshot({'ms':Time.ms}, bindFn(animate, this));
    this.currTime = Time.ms.pinLastValue();
    
    this.terrain.setPosition(50,50);
    this.duneBuggy.rotate(Math.PI/2);

    this.autoDrive = false;
    this.accelerate = 1;
    this.dragVector = [0,0];
    this.touching = false;

    
    Patches.getBooleanValue("isTouching").monitor().subscribe(bindFn(function(event) {
        this.touching = event.newValue;
    }, this));

    
    // Diagnostics.watch("Gesture state", TouchGestures.Gesture.state)
    // Patches.getVectorValue("touchPosition")

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
    var _elapsedTime = snapshot.ms-this.currTime;
    this.currTime = snapshot.ms;

    if(_elapsedTime == 0)return;

    ////////// Update terrain and dune buggy //////////
    this.terrain.move(
        this.duneBuggy.vectorXY[0]*this.duneBuggy.speedXY*_elapsedTime/1000, 
        -this.duneBuggy.vectorXY[1]*this.duneBuggy.speedXY*_elapsedTime/1000
    );

    if(this.autoDrive){
        this.duneBuggy.accelerationXY_Mult = 1;
        this.duneBuggy.rotate(((Math.sin(3+this.currTime/8000)+Math.sin(this.currTime/800))*0.65)*_elapsedTime/1000);
    } else {
        // Diagnostics.log(TouchGestures.Gesture.State.BEGAN)
        // TouchGestures.Gesture.state == TouchGestures.Gesture.State.BEGAN
        this.duneBuggy.accelerationXY_Mult = ((this.touching)?1:0);
        this.duneBuggy.rotate( Patches.getScalarValue("touchRotation").pinLastValue()/20 );

    }

    // we need to adjust the coordinate
    // if the car is at 0,0, then we need to be at 50,50
    // if the car is at 25,25, then we need to be at 50,50
    Patches.setScalarValue('terrain_xPos', Reactive.val(wrapVal(this.terrain.currentPosition[0], 100)-50));
    Patches.setScalarValue('terrain_zPos', Reactive.val(wrapVal(this.terrain.currentPosition[1], 100)-50));

    this.duneBuggy.update(
        _elapsedTime/1000,
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

    Patches.setVectorValue('buggy_FL_Position', Reactive.vector(
        Reactive.val(-this.duneBuggy.wheelPositions[0][0]), 
        Reactive.val(this.duneBuggy.wheelPositions[0][2]/this.buggyScale),
        Reactive.val(-this.duneBuggy.wheelPositions[0][1])
    ));
    Patches.setVectorValue('buggy_FR_Position', Reactive.vector(
        Reactive.val(-this.duneBuggy.wheelPositions[1][0]), 
        Reactive.val(this.duneBuggy.wheelPositions[1][2]/this.buggyScale), 
        Reactive.val(-this.duneBuggy.wheelPositions[1][1])
    ));
    Patches.setVectorValue('buggy_BL_Position', Reactive.vector(
        Reactive.val(-this.duneBuggy.wheelPositions[2][0]), 
        Reactive.val(this.duneBuggy.wheelPositions[2][2]/this.buggyScale), 
        Reactive.val(-this.duneBuggy.wheelPositions[2][1])
    ));
    Patches.setVectorValue('buggy_BR_Position', Reactive.vector(
        Reactive.val(-this.duneBuggy.wheelPositions[3][0]), 
        Reactive.val(this.duneBuggy.wheelPositions[3][2]/this.buggyScale), 
        Reactive.val(-this.duneBuggy.wheelPositions[3][1])
    ));

    Patches.setScalarValue('buggy_FrontWheel_rotationY', Reactive.val(rad2Deg*(Math.PI-this.duneBuggy.rotation)));
    Patches.setScalarValue('buggy_BackWheel_rotationY', Reactive.val(rad2Deg*(Math.PI-this.duneBuggy.rotation)));
}

init.call({});
