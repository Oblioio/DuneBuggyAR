
const Diagnostics = require('Diagnostics');
const Scene = require('Scene');
const Reactive = require('Reactive');
const Patches = require('Patches'); 
const Time = require('Time'); 
const TouchGestures = require('TouchGestures');
const CameraInfo = require('CameraInfo');
const Materials = require('Materials');
const Shaders = require('Shaders');


/*
    Some of my shading patches need to know where the px it's drawing is.
    Not in world space, not in local space, but in my little AR scene's space.
    
    I can get world position of the masterContainer and in my shader I
    can use the vertex position and model matrix to get world position
    of the vertex. If I subtract those it will give me the vertex position relative to 
    the masterContainer. But that doesn't factor in the AR scene's scale and rotation.

    Adding nulls into my AR scene with a coord of 1 on each axis allows me to measure
    each axis as it is in the final scaled and rotated scene. I can use those measurments
    in the patch editor to finish calculating the coordinate in AR scene space

*/
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

/*
    I want to control the camera by turning your phone like a steering wheel.
    Unfortunately the camera transform isn't going to give me a number that is
    directly usable for that.

    I'm adding a null object ('YAxisUnit_Cam') underneath the camera with a coordinate of 
    (0,1,0) that will let me know what the UP vector is for the camera.
    I can then do some coordinate conversion to figure out what that vector
    is in relation to looking directly at the center of the AR scene.

    I can use this to isolate the camera's Z Axis "roll"
    (easier that euler order conversion!)
*/

const planeTracker = Scene.root.find('planeTracker0');
const YAxisUnit_Cam = Scene.root.find('YAxisUnit_Cam');
const duneBuggy_frameObj = Scene.root.find('duneBuggy_frame');
const cameraObj = Scene.root.find('Camera');


const YAxisPlaneTracker = Scene.root.find('YAxisPlaneTracker');
const YAxisPlane = YAxisPlaneTracker.worldTransform.position.sub(planeTracker.worldTransform.toSignal().position).normalize();

const CamUpVector = YAxisUnit_Cam.worldTransform.position.sub(cameraObj.worldTransform.toSignal().position).normalize();

const CamToScene_ForwardVec = duneBuggy_frameObj.worldTransform.position.sub(cameraObj.worldTransform.toSignal().position);
const CamToScene_SideVec = CamToScene_ForwardVec.normalize().cross(YAxisPlane).normalize();
const CamToScene_UpVec = CamToScene_ForwardVec.normalize().cross(CamToScene_SideVec).normalize();

const CamSceneRotationPtX = CamUpVector.dot(CamToScene_SideVec);
const CamSceneRotationPtY = CamUpVector.dot(CamToScene_UpVec);




TouchGestures.onTap().subscribe( function (gesture, snapshot) {

});

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

        
    // Diagnostics.watch("Gesture state", TouchGestures.Gesture.state)
    // Patches.getVectorValue("touchPosition")

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

        this.duneBuggy.accelerationXY_Mult = 1;
        if(CamSceneRotationPtX.pinLastValue() != NaN && CamSceneRotationPtY.pinLastValue() != NaN){
            var rotValue = Math.min(1, getCameraRotation.call(this)*1.75 );
            if(rotValue) this.duneBuggy.rotate( rotValue*_elapsedTime );

        }
        
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




//////////////////// HELPER FUNCTIONS ////////////////////
// (I put these at the bottom to keep them out of the way)


// why do we have to create a stupid polyfill for function.bind()? ask the facebook devs
function bindFn(fn, scope){
    if(fn.bind)return fn.bind(scope);

    /// v1
    return function () {
        var args = Array.prototype.slice.call(arguments, 0);
        return fn.apply(scope, args);
    };  
}

// this is basically Modulo, but it works with negative numbers
function wrapVal(val, range){
    if(val >=0){
        return val%range;
    } else {
        return range-(Math.abs(val)%range)
    }
}


// Debbuging visualizers
// function rotationDebugger(){
//     const sdfStar = Shaders.sdfStar(Reactive.pack2(0.5,0.5), 0.01, 0.001, 5);
//     const sdfRect = Shaders.sdfRectangle(Reactive.pack2(0.5,0.5), Reactive.pack2(0.1,0.1));
//     Shaders.sdfRotation(sdfRect)
//     const step = Reactive.step(sdfRect,0);
//     const sdfMix = Shaders.sdfMix(sdfStar,0,step);
//     const material = Materials.get('overlays');
//     material.setTexture(step, {textureSlotName: Shaders.DefaultMaterialTextures.DIFFUSE});
// }