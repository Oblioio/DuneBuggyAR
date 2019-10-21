//@input SceneObject IconOverlay

var frontHint = script.getSceneObject().createComponent( "Component.HintsComponent" );
script.createEvent("CameraFrontEvent").bind( setVisibilities.bind(this) );
script.createEvent("CameraBackEvent").bind( setVisibilities.bind(this) );

function setVisibilities(eventData){
    var camType = global.scene.getCameraType();
    if(camType == "front"){
        frontHint.showHint("lens_hint_swap_camera", 3);
        script.IconOverlay.enabled = false;
    } else {
        frontHint.hideHint("lens_hint_swap_camera");
        script.IconOverlay.enabled = true;
    } 
}