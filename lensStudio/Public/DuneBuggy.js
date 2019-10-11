//@input Asset.RenderMesh unitCube
//@input Asset.Material terrainMat
//@input Asset.RenderMesh DuneBuggy_Frame
//@input Asset.RenderMesh DuneBuggy_FL
//@input Asset.RenderMesh DuneBuggy_FR
//@input Asset.RenderMesh DuneBuggy_BL
//@input Asset.RenderMesh DuneBuggy_BR
//@input Asset.Material DuneBuggy_mat
//@input Component.ScriptComponent sharedScript

var DynamicTerrain = script.sharedScript.api.DynamicTerrain;
var DuneBuggy = script.sharedScript.api.DuneBuggy;

function init(){    
    this.masterGroup = createEmptyObject("masterGroup");
    this.masterGroup.transform.setLocalScale(new vec3(2,2,2));
    
    // DUNE BUGGY
    this.duneBuggy = new DuneBuggy();
    this.buggyScale = 0.5;
    
    this.buggy = createEmptyObject("buggySpin", this.masterGroup.obj);
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

    this.terrainObj = createEmptyObject("terrain", this.masterGroup.obj);
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
    

function onUpdate(e){
    var _elapsedTime = e.getDeltaTime()*1000;
    if(_elapsedTime == 0)return;

    this.terrain.move(this.duneBuggy.velocity[0]*_elapsedTime/1000, -this.duneBuggy.velocity[1]*_elapsedTime/1000);
    this.duneBuggy.rotate(0.475*_elapsedTime/1000);

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