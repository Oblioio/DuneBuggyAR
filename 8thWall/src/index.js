import { Main } from "./main.js";
console.log('INDEX PRE ALL');
let main;// = new Main();

const placeScenePipelineModule = () => {
const raycaster = new THREE.Raycaster()
const tapPosition = new THREE.Vector2()
let surface  // Transparent surface for raycasting for object placement.

// Populates some object into an XR scene and sets the initial camera position. The scene and
// camera come from xr3js, and are only available in the camera loop lifecycle onStart() or later.
const initXrScene = ({ scene, camera }) => {
    console.log('initXrScene')
    surface = new THREE.Mesh(
        new THREE.PlaneGeometry( 100, 100, 1, 1 ),
        new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.0,
            side: THREE.DoubleSide
        })
    )

    surface.rotateX(-Math.PI / 2)
    surface.position.set(0, 0, 0)
    scene.add(surface)

    // Set the initial camera position relative to the scene we just laid out. This must be at a
    // height greater than y=0.
    camera.position.set(0, 3, 0)

    main = new Main(camera);
}

// Load the glb model at the requested point on the surface.
const placeObject = (pointX, pointZ) => {
    // main.scene.rotation.set(0.0, yDegrees, 0.0)
    main.scene.position.set(pointX, 0.0, pointZ)
    // debugger;
    main.scene.scale.set(0.05, 0.05, 0.05)
    XR.Threejs.xrScene().scene.add(main.scene)
}

const placeObjectTouchHandler = (e) => {
    console.log('placeObjectTouchHandler')
    // debugger;
    // Call XrController.recenter() when the canvas is tapped with two fingers. This resets the
    // AR camera to the position specified by XrController.updateCameraProjectionMatrix() above.
    if (e.touches.length == 2) {
    XR.XrController.recenter()
    }

    if (e.touches.length > 2) {
    return
    }

    // If the canvas is tapped with one finger and hits the "surface", spawn an object.
    const {scene, camera} = XR.Threejs.xrScene()

    // calculate tap position in normalized device coordinates (-1 to +1) for both components.
    tapPosition.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1
    tapPosition.y = - (e.touches[0].clientY / window.innerHeight) * 2 + 1

    // Update the picking ray with the camera and tap position.
    raycaster.setFromCamera(tapPosition, camera)

    // Raycast against the "surface" object.
    const intersects = raycaster.intersectObject(surface)

    if (intersects.length == 1 && intersects[0].object == surface) {
    placeObject(intersects[0].point.x, intersects[0].point.z)
    }
}

return {
    // Pipeline modules need a name. It can be whatever you want but must be unique within your app.
    name: 'placescene',

    // onStart is called once when the camera feed begins. In this case, we need to wait for the
    // XR.Threejs scene to be ready before we can access it to add content. It was created in
    // XR.Threejs.pipelineModule()'s onStart method.
    onStart: ({canvas, canvasWidth, canvasHeight}) => {
    const {scene, camera} = XR.Threejs.xrScene()  // Get the 3js sceen from xr3js.

    initXrScene({ scene, camera }) // Add objects to the scene and set starting camera position.

    canvas.addEventListener('touchstart', placeObjectTouchHandler, true)  // Add touch listener.

    // Enable TWEEN animations.
    // animate()
    // function animate(time) {
    //     requestAnimationFrame(animate)
    //     TWEEN.update(time)
    // }

    // Sync the xr controller's 6DoF position and camera paremeters with our scene.
    XR.XrController.updateCameraProjectionMatrix({
        origin: camera.position,
        facing: camera.quaternion,
    })
    },
}
}

const onxrloaded = () => {
    console.log('ON XR LOADED!');
    XR.addCameraPipelineModules([  // Add camera pipeline modules.
      // Existing pipeline modules.
      XR.GlTextureRenderer.pipelineModule(),       // Draws the camera feed.
      XR.Threejs.pipelineModule(),                 // Creates a ThreeJS AR Scene.
      XR.XrController.pipelineModule(),            // Enables SLAM tracking.
      XRExtras.AlmostThere.pipelineModule(),       // Detects unsupported browsers and gives hints.
      XRExtras.FullWindowCanvas.pipelineModule(),  // Modifies the canvas to fill the window.
      XRExtras.Loading.pipelineModule(),           // Manages the loading screen on startup.
      XRExtras.RuntimeError.pipelineModule(),      // Shows an error image on runtime error.
      // Custom pipeline modules.
      placeScenePipelineModule(),
    ])
  
    // Open the camera and start running the camera run loop.
    XR.run({canvas: document.getElementById('camerafeed')})
  }
  console.log('INDEX PRE LOAD');
  // // Show loading screen before the full XR library has been loaded.
  const load = () => { XRExtras.Loading.showLoading({onxrloaded}) }
  window.onload = () => { window.XRExtras ? load() : window.addEventListener('xrextrasloaded', load) }