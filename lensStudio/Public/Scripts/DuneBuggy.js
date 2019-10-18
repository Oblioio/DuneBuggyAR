//@input Asset.RenderMesh unitCube
//@input Asset.Material terrainMat
//@input Asset.RenderMesh DuneBuggy_Frame
//@input Asset.RenderMesh DuneBuggy_FL
//@input Asset.RenderMesh DuneBuggy_FR
//@input Asset.RenderMesh DuneBuggy_BL
//@input Asset.RenderMesh DuneBuggy_BR
//@input Asset.Material DuneBuggy_mat
//@input Component.ScriptComponent sharedScript
//@input SceneObject YAxisPlaneTracker
//@input SceneObject YAxisUnit_Cam

var DynamicTerrain = script.sharedScript.api.DynamicTerrain;
var DuneBuggy = script.sharedScript.api.DuneBuggy;

function init(){
    // FIND THE MASTER GROUP OBJECT
    for(var i=0; i<global.scene.getRootObjectsCount(); i++){
        if(global.scene.getRootObject(i).name == "masterGroup")
            this.masterGroup = global.scene.getRootObject(i);
        if(global.scene.getRootObject(i).name == "Camera")
            this.camera = global.scene.getRootObject(i);
    }

    // DUNE BUGGY
    this.duneBuggy = new DuneBuggy();
    this.buggyScale = 0.5;
    
    this.buggy = createEmptyObject("buggySpin", this.masterGroup);
    this.buggy.transform.setLocalScale(new vec3(this.buggyScale, this.buggyScale, this.buggyScale));
    this.buggySpin = createEmptyObject("buggySpin", this.buggy.obj);
    this.buggy_frame = createObject("buggyFrame", script.DuneBuggy_Frame, script.DuneBuggy_mat, this.buggySpin.obj);

    this.buggy_frontLeftWheel = createObject("buggyFrame", script.DuneBuggy_FL, script.DuneBuggy_mat, this.buggy.obj);
    this.buggy_frontRightWheel = createObject("buggyFrame", script.DuneBuggy_FR, script.DuneBuggy_mat, this.buggy.obj);
    this.buggy_backLeftWheel = createObject("buggyFrame", script.DuneBuggy_BL, script.DuneBuggy_mat, this.buggy.obj);
    this.buggy_backRightWheel = createObject("buggyFrame", script.DuneBuggy_BR, script.DuneBuggy_mat, this.buggy.obj);
    
    this.buggy_frame.mv.meshShadowMode = 1;
    this.buggy_frontLeftWheel.mv.meshShadowMode = 1;
    this.buggy_frontRightWheel.mv.meshShadowMode = 1;
    this.buggy_backLeftWheel.mv.meshShadowMode = 1;
    this.buggy_backRightWheel.mv.meshShadowMode = 1;

    
    // TERRAIN
    // this.terrain = new DynamicTerrain(50, 50)
    this.terrain = new DynamicTerrain(Math.round(25*1.75), 50);
    // this.terrain = new DynamicTerrain(25, 50);
    this.terrain.setPosition(0,0);

    this.terrainObj = createEmptyObject("terrain", this.masterGroup);
    this.terrainObj.mv = this.terrainObj.obj.createComponent("Component.MeshVisual");
    this.terrainObj.mv.addMaterial(script.terrainMat);
    this.terrainObj.mv.meshShadowMode = 2;
    
    this.terrainObj.mb = new MeshBuilder([
        { name: "position", components: 3 },
        { name: "normal", components: 3, normalized: true },
        { name: "texture0", components: 2 }
    ]);
    this.terrainObj.mb.topology = MeshTopology.Triangles;
    this.terrainObj.mb.indexType = MeshIndexType.UInt16;
    this.terrainObj.mb.appendVerticesInterleaved(this.terrain.returnPackedArray());
    this.terrainObj.mb.appendIndices(this.terrain.returnIndiceArraySnap());

    if(this.terrainObj.mb.isValid()){
        this.terrainObj.mv.mesh = this.terrainObj.mb.getMesh();
        this.terrainObj.mb.updateMesh();
        // terrainObj.obj.enabled = false;
        
        var event = script.createEvent("UpdateEvent");
        event.bind( onUpdate.bind(this) );

    } else{
        print("Mesh data invalid!");
    }
    
    this.currTime = 0;
    this.autoDrive = true;
    this.terrain.setPosition(50,50);
    this.duneBuggy.rotate(Math.PI/2);

    this.autoDrive = false;
    this.accelerate = 1;
    this.dragVector = [0,0];
    this.touching = false;

    this.hintComponent = script.getSceneObject().createComponent( "Component.HintsComponent" );

    // var camEvent = script.createEvent("UpdateEvent");
    script.createEvent("CameraFrontEvent").bind( setVisibilities.bind(this) );
    script.createEvent("CameraBackEvent").bind( setVisibilities.bind(this) );
    script.createEvent("SurfaceTrackingResetEvent").bind( setVisibilities.bind(this) );   

}

function createEmptyObject(id, parent){
    var sObj = global.scene.createSceneObject(id);
    if(parent)sObj.setParent(parent);
    return {
        obj: sObj,
        transform: sObj.getTransform()
    }
}

function createObject(id, meshObj, mat, parent){
    var sObj = global.scene.createSceneObject(id);
    var MV = sObj.createComponent("Component.MeshVisual");
    MV.addMaterial(mat);
    MV.mesh = meshObj;

    if(parent)sObj.setParent(parent);

    return {
        obj: sObj,
        mv: MV,
        transform: MV.getTransform()
    }
}

function setVisibilities(eventData){
    global.logToScreen(eventData);
}

function getCameraRotation(){
    var camPos = this.camera.getTransform().getWorldPosition();
    var YAxisPlane = script.YAxisPlaneTracker.getTransform().getWorldPosition().sub(this.masterGroup.getTransform().getWorldPosition()).normalize();
    var CamUpVector = script.YAxisUnit_Cam.getTransform().getWorldPosition().sub(camPos).normalize();

    var CamToScene_ForwardVec = this.buggy_frame.obj.getTransform().getWorldPosition().sub(camPos);
    var CamToScene_SideVec = CamToScene_ForwardVec.normalize().cross(YAxisPlane).normalize();
    var CamToScene_UpVec = CamToScene_ForwardVec.normalize().cross(CamToScene_SideVec).normalize();

    var CamSceneRotationPtX = CamUpVector.dot(CamToScene_SideVec);
    var CamSceneRotationPtY = CamUpVector.dot(CamToScene_UpVec);

    return Math.atan(CamSceneRotationPtX/Math.abs(CamSceneRotationPtY));
}


function onUpdate(e){
    var _elapsedTime = e.getDeltaTime()*1000;
    this.currTime += _elapsedTime;
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

        var rotValue = Math.min(1, getCameraRotation.call(this)*1.75 )/20;
        if(rotValue) this.duneBuggy.rotate( rotValue );


    }

    this.terrainObj.mb.eraseVertices(0, this.terrainObj.mb.getVerticesCount());
    this.terrainObj.mb.appendVerticesInterleaved(this.terrain.returnPackedArray());
    this.terrainObj.mb.updateMesh()


    // next set wheelHeights
    this.duneBuggy.update(
        _elapsedTime/1000,
        this.terrain.getPt(this.terrain.currentPosition[0]+this.duneBuggy.wheelPositions[0][0]*this.buggyScale, this.terrain.currentPosition[1]-this.duneBuggy.wheelPositions[0][1]*this.buggyScale).z,
        this.terrain.getPt(this.terrain.currentPosition[0]+this.duneBuggy.wheelPositions[1][0]*this.buggyScale, this.terrain.currentPosition[1]-this.duneBuggy.wheelPositions[1][1]*this.buggyScale).z,
        this.terrain.getPt(this.terrain.currentPosition[0]+this.duneBuggy.wheelPositions[2][0]*this.buggyScale, this.terrain.currentPosition[1]-this.duneBuggy.wheelPositions[2][1]*this.buggyScale).z,
        this.terrain.getPt(this.terrain.currentPosition[0]+this.duneBuggy.wheelPositions[3][0]*this.buggyScale, this.terrain.currentPosition[1]-this.duneBuggy.wheelPositions[3][1]*this.buggyScale).z
    );

    var buggyRotation = quat.fromEulerVec(new vec3(0, Math.PI-this.duneBuggy.rotation,0));
    this.buggySpin.transform.setLocalRotation(buggyRotation);
    this.buggy_frame.transform.setLocalRotation(quat.fromEulerVec(new vec3(this.duneBuggy.tilt, 0, this.duneBuggy.roll)));
    this.buggy_frame.transform.setLocalPosition(new vec3(0, this.duneBuggy.midHeight/this.buggyScale, 0));
    
    // this.buggy_frontLeftWheel.transform.setLocalPosition(new vec3(this.duneBuggy.wheelPositions[0][0], this.duneBuggy.wheelPositions[0][2]/this.buggyScale, this.duneBuggy.wheelPositions[0][1]));
    
    this.buggy_frontLeftWheel.transform.setLocalPosition(new vec3(this.duneBuggy.wheelPositions[0][0], this.duneBuggy.wheelPositions[0][2]/this.buggyScale, this.duneBuggy.wheelPositions[0][1]));
    this.buggy_frontRightWheel.transform.setLocalPosition(new vec3(this.duneBuggy.wheelPositions[1][0], this.duneBuggy.wheelPositions[1][2]/this.buggyScale, this.duneBuggy.wheelPositions[1][1]));
    this.buggy_backLeftWheel.transform.setLocalPosition(new vec3(this.duneBuggy.wheelPositions[2][0], this.duneBuggy.wheelPositions[2][2]/this.buggyScale, this.duneBuggy.wheelPositions[2][1]));
    this.buggy_backRightWheel.transform.setLocalPosition(new vec3(this.duneBuggy.wheelPositions[3][0], this.duneBuggy.wheelPositions[3][2]/this.buggyScale, this.duneBuggy.wheelPositions[3][1]));
    
    
    // this.buggy_frontLeftWheel.transform.setLocalPosition(new vec3(0, this.terrain.getPt(this.terrain.currentPosition[0], this.terrain.currentPosition[1]).z/this.buggyScale, 0));

    // global.logToScreen(this.buggy_frontLeftWheel.transform.getLocalPosition().y);
    // global.logToScreen(this.duneBuggy.wheelPositions[1][2]/this.buggyScale);
    // global.logToScreen(this.duneBuggy.wheelPositions[2][2]/this.buggyScale);
    // global.logToScreen(this.duneBuggy.wheelPositions[3][2]/this.buggyScale);

    this.buggy_frontLeftWheel.transform.setLocalRotation(buggyRotation);
    this.buggy_frontRightWheel.transform.setLocalRotation(buggyRotation);
    this.buggy_backLeftWheel.transform.setLocalRotation(buggyRotation);
    this.buggy_backRightWheel.transform.setLocalRotation(buggyRotation);

}




init();