//@input Asset.RenderMesh DuneBuggy_Frame
//@input Asset.RenderMesh DuneBuggy_FL
//@input Asset.RenderMesh DuneBuggy_FR
//@input Asset.RenderMesh DuneBuggy_BL
//@input Asset.RenderMesh DuneBuggy_BR
//@input Asset.Material DuneBuggy_mat
//@input Component.ScriptComponent sharedScript
//@input SceneObject YAxisPlaneTracker
//@input SceneObject YAxisUnit_Cam
//@input SceneObject terrainContainer
//@input SceneObject terrain_NE
//@input SceneObject terrain_NW
//@input SceneObject terrain_SE
//@input SceneObject terrain_SW

var DynamicTerrain = script.sharedScript.api.DynamicTerrain;
var DuneBuggy = script.sharedScript.api.DuneBuggy;

function init(){
    // FIND THE MASTER GROUP OBJECT
    for(var i=0; i<global.scene.getRootObjectsCount(); i++){
        if(global.scene.getRootObject(i).name == "WorldObjectController")
            this.masterGroup = global.scene.getRootObject(i).getChild(0);
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
    this.terrain = new DynamicTerrain(Math.round(25*1.75), 50);
    this.terrain.setPosition(0,0);

    // this.terrainObj = createEmptyObject("terrain", this.masterGroup);
    // this.terrainObj.mv = this.terrainObj.obj.createComponent("Component.MeshVisual");
    // this.terrainObj.mv.meshShadowMode = 2;
    
    // this.terrainObj.mb = new MeshBuilder([
    //     { name: "position", components: 3 },
    //     { name: "normal", components: 3, normalized: true },
    //     { name: "texture0", components: 2 }
    // ]);
    // this.terrainObj.mb.topology = MeshTopology.Triangles;
    // this.terrainObj.mb.indexType = MeshIndexType.UInt16;
    // this.terrainObj.mb.appendVerticesInterleaved(this.terrain.returnPackedArray());
    // this.terrainObj.mb.appendIndices(this.terrain.returnIndiceArraySnap());

    // if(this.terrainObj.mb.isValid()){
    //     this.terrainObj.mv.mesh = this.terrainObj.mb.getMesh();
    //     this.terrainObj.mb.updateMesh();
    //     // terrainObj.obj.enabled = false;
        

    // } else{
    //     print("Mesh data invalid!");
    // }

    var event = script.createEvent("UpdateEvent");
    event.bind( onUpdate.bind(this) );
    
    this.currTime = 0;
    this.autoDrive = true;
    this.terrain.setPosition(50,50);
    this.duneBuggy.rotate(Math.PI/2);

    this.autoDrive = false;
    this.accelerate = 1;
    this.dragVector = [0,0];
    this.touching = false;
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

function moveTerrain(x, y){
    var X1 = (x>25)?-100:0;
    var X2 = (x<-25)?100:0;
    var Y1 = (y>25)?-100:0;
    var Y2 = (y<-25)?100:0;
    script.terrainContainer.getTransform().setLocalPosition(new vec3(x,0,y) );
    script.terrain_NE.getTransform().setLocalPosition( new vec3(X1,0,Y1) );
    script.terrain_NW.getTransform().setLocalPosition( new vec3(X2,0,Y1) );
    script.terrain_SE.getTransform().setLocalPosition( new vec3(X1,0,Y2) );
    script.terrain_SW.getTransform().setLocalPosition( new vec3(X2,0,Y2) );

    var divider = 100;
    script.terrain_NE.getFirstComponent("Component.MeshVisual").mainPass.uv2Offset = new vec2(0.5+((X1+x)/divider), 0.5+((Y1+y)/divider));
    script.terrain_NW.getFirstComponent("Component.MeshVisual").mainPass.uv2Offset = new vec2(((X2+x)/divider), 0.5+((Y1+y)/divider));
    script.terrain_SE.getFirstComponent("Component.MeshVisual").mainPass.uv2Offset = new vec2(0.5+((X1+x)/divider), ((Y2+y)/divider));
    script.terrain_SW.getFirstComponent("Component.MeshVisual").mainPass.uv2Offset = new vec2(((X2+x)/divider), ((Y2+y)/divider));
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

    moveTerrain( -(wrapVal(this.terrain.currentPosition[0], 100)-50), (wrapVal(this.terrain.currentPosition[1], 100)-50) );

    // this.terrainObj.mb.eraseVertices(0, this.terrainObj.mb.getVerticesCount());
    // this.terrainObj.mb.appendVerticesInterleaved(this.terrain.returnPackedArray());
    // this.terrainObj.mb.updateMesh()


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
