import { Main } from "./main.js";
// console.log('INDEX PRE ALL');


// const placeScenePipelineModule = () => {
// const raycaster = new THREE.Raycaster()
// const tapPosition = new THREE.Vector2()
// let surface  // Transparent surface for raycasting for object placement.

// // Populates some object into an XR scene and sets the initial camera position. The scene and
// // camera come from xr3js, and are only available in the camera loop lifecycle onStart() or later.
// const initXrScene = ({ scene, camera }) => {
//     console.log('initXrScene')
//     surface = new THREE.Mesh(
//         new THREE.PlaneGeometry( 100, 100, 1, 1 ),
//         new THREE.MeshBasicMaterial({
//             color: 0xffff00,
//             transparent: true,
//             opacity: 0.0,
//             side: THREE.DoubleSide
//         })
//     )

//     surface.rotateX(-Math.PI / 2)
//     surface.position.set(0, 0, 0)
//     scene.add(surface)

//     // Set the initial camera position relative to the scene we just laid out. This must be at a
//     // height greater than y=0.
//     camera.position.set(0, 3, 0)

//     main = new Main(camera);
// }

// // Load the glb model at the requested point on the surface.
// const placeObject = (pointX, pointZ) => {
//     // main.scene.rotation.set(0.0, yDegrees, 0.0)
//     main.scene.position.set(pointX, 0.0, pointZ)
//     // debugger;
//     main.scene.scale.set(0.05, 0.05, 0.05)

//     let xrScene = XR.Threejs.xrScene();
//     xrScene.scene.add(main.scene)
//     xrScene.renderer.shadowMap.enabled = true;
//     // xrScene.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// }

// const placeObjectTouchHandler = (e) => {
//     console.log('placeObjectTouchHandler')
//     // debugger;
//     // Call XrController.recenter() when the canvas is tapped with two fingers. This resets the
//     // AR camera to the position specified by XrController.updateCameraProjectionMatrix() above.
//     if (e.touches.length == 2) {
//     XR.XrController.recenter()
//     }

//     if (e.touches.length > 2) {
//     return
//     }

//     // If the canvas is tapped with one finger and hits the "surface", spawn an object.
//     const {scene, camera} = XR.Threejs.xrScene()

//     // calculate tap position in normalized device coordinates (-1 to +1) for both components.
//     tapPosition.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1
//     tapPosition.y = - (e.touches[0].clientY / window.innerHeight) * 2 + 1

//     // Update the picking ray with the camera and tap position.
//     raycaster.setFromCamera(tapPosition, camera)

//     // Raycast against the "surface" object.
//     const intersects = raycaster.intersectObject(surface)

//     if (intersects.length == 1 && intersects[0].object == surface) {
//     placeObject(intersects[0].point.x, intersects[0].point.z)
//     }
// }

// return {
//     // Pipeline modules need a name. It can be whatever you want but must be unique within your app.
//     name: 'placescene',

//     // onStart is called once when the camera feed begins. In this case, we need to wait for the
//     // XR.Threejs scene to be ready before we can access it to add content. It was created in
//     // XR.Threejs.pipelineModule()'s onStart method.
//     onStart: ({canvas, canvasWidth, canvasHeight}) => {
//     const {scene, camera} = XR.Threejs.xrScene()  // Get the 3js sceen from xr3js.

//     initXrScene({ scene, camera }) // Add objects to the scene and set starting camera position.

//     canvas.addEventListener('touchstart', placeObjectTouchHandler, true)  // Add touch listener.

//     // Enable TWEEN animations.
//     // animate()
//     // function animate(time) {
//     //     requestAnimationFrame(animate)
//     //     TWEEN.update(time)
//     // }

//     // Sync the xr controller's 6DoF position and camera paremeters with our scene.
//     XR.XrController.updateCameraProjectionMatrix({
//         origin: camera.position,
//         facing: camera.quaternion,
//     })
//     },
// }
// }

// const onxrloaded = () => {
//     console.log('ON XR LOADED!');
//     XR.addCameraPipelineModules([  // Add camera pipeline modules.
//       // Existing pipeline modules.
//       XR.GlTextureRenderer.pipelineModule(),       // Draws the camera feed.
//       XR.Threejs.pipelineModule(),                 // Creates a ThreeJS AR Scene.
//       XR.XrController.pipelineModule(),            // Enables SLAM tracking.
//       XRExtras.AlmostThere.pipelineModule(),       // Detects unsupported browsers and gives hints.
//       XRExtras.FullWindowCanvas.pipelineModule(),  // Modifies the canvas to fill the window.
//       XRExtras.Loading.pipelineModule(),           // Manages the loading screen on startup.
//       XRExtras.RuntimeError.pipelineModule(),      // Shows an error image on runtime error.
//       // Custom pipeline modules.
//       placeScenePipelineModule(),
//     ])
  
//     // Open the camera and start running the camera run loop.
//     XR.run({canvas: document.getElementById('camerafeed')})
//   }
//   console.log('INDEX PRE LOAD');
//   // // Show loading screen before the full XR library has been loaded.
//   const load = () => { XRExtras.Loading.showLoading({onxrloaded}) }
//   window.onload = () => { window.XRExtras ? load() : window.addEventListener('xrextrasloaded', load) }

// Component that places trees where the ground is clicked
AFRAME.registerComponent('tap-place', {
    init: function() {
        const newElement = document.createElement('a-entity')
        newElement.setAttribute('visible', 'false')
        newElement.setAttribute('gltf-model', '#buggy')
        this.el.sceneEl.appendChild(newElement)

        this.el.renderer.shadowMap.enabled = true;
        newElement.addEventListener('model-loaded', () => {
            console.log('MODEL LOAD#EDDD!!!');
            // // Once the model is loaded, we are ready to show it popping in using an animation
            // newElement.setAttribute('visible', 'true')

            const main = new Main(this.el.camera);
            this.el.camera.el.id = 'camera';

            main.addBuggy(newElement.object3D.children[0]);

            const buggyElement = document.createElement('a-entity');
            buggyElement.classList.add('cantap');
            buggyElement.setAttribute('hold-drag', '');
            buggyElement.setAttribute('pinch-scale', '')
            buggyElement.setAttribute('visible', 'false')
            buggyElement.object3D.add(main.scene);
            
            this.el.sceneEl.appendChild(buggyElement)

            // buggyElement.setAttribute('visible', 'true')
            buggyElement.setAttribute('scale', '0.1 0.1 0.1')

            const ground = document.getElementById('ground')
            ground.addEventListener('click', event => {
                buggyElement.setAttribute('visible', 'true')

                // The raycaster gives a location of the touch in the scene
                const touchPoint = event.detail.intersection.point
                buggyElement.setAttribute('position', touchPoint)
            })
        })
    }
})

// Component that detects and emits events for touch gestures
AFRAME.registerComponent('gesture-detector', {
    schema: {
      element: { default: '' },
    },
    init: function() {
      this.targetElement = this.data.element && document.querySelector(this.data.element)
      if (!this.targetElement) {
        this.targetElement = this.el
      }
  
      this.internalState = {
        previousState: null,
      }
  
      this.emitGestureEvent = this.emitGestureEvent.bind(this)
  
      this.targetElement.addEventListener('touchstart', this.emitGestureEvent)
      this.targetElement.addEventListener('touchend', this.emitGestureEvent)
      this.targetElement.addEventListener('touchmove', this.emitGestureEvent)
    },
    remove: function() {
      this.targetElement.removeEventListener('touchstart', this.emitGestureEvent)
      this.targetElement.removeEventListener('touchend', this.emitGestureEvent)
      this.targetElement.removeEventListener('touchmove', this.emitGestureEvent)
    },
    emitGestureEvent(event) {
      const currentState = this.getTouchState(event)
      const previousState = this.internalState.previousState
  
      const gestureContinues = previousState &&
                               currentState  &&
                               currentState.touchCount == previousState.touchCount
  
      const gestureEnded = previousState && !gestureContinues
      const gestureStarted = currentState && !gestureContinues
  
      if (gestureEnded) {
        const eventName = this.getEventPrefix(previousState.touchCount) + 'fingerend'
        this.el.emit(eventName, previousState)
        this.internalState.previousState = null
      }
  
      if (gestureStarted) {
        currentState.startTime = performance.now()
        currentState.startPosition = currentState.position
        currentState.startSpread = currentState.spread
        const eventName = this.getEventPrefix(currentState.touchCount) + 'fingerstart'
        this.el.emit(eventName, currentState)
        this.internalState.previousState = currentState
      }
  
      if (gestureContinues) {
        const eventDetail = {
          positionChange: {
            x: currentState.position.x - previousState.position.x,
            y: currentState.position.y - previousState.position.y
          },
        }
  
        if (currentState.spread) {
          eventDetail.spreadChange = currentState.spread - previousState.spread
        }
  
        // Update state with new data
        Object.assign(previousState, currentState)
  
        // Add state data to event detail
        Object.assign(eventDetail, previousState)
  
        const eventName = this.getEventPrefix(currentState.touchCount) + 'fingermove'
        this.el.emit(eventName, eventDetail)
      }
    },
    getTouchState: function(event) {
  
      if (event.touches.length == 0) {
        return null
      }
  
      // Convert event.touches to an array so we can use reduce
      const touchList = []
      for (let i = 0; i < event.touches.length; i++) {
        touchList.push(event.touches[i])
      }
  
      const touchState = {
        touchCount: touchList.length,
      }
  
      // Calculate center of all current touches
      const centerPositionRawX = touchList.reduce((sum, touch) => sum + touch.clientX, 0) / touchList.length
      const centerPositionRawY = touchList.reduce((sum, touch) => sum + touch.clientY, 0) / touchList.length
  
      touchState.positionRaw = {x: centerPositionRawX, y: centerPositionRawY}
  
      // Scale touch position and spread by average of window dimensions
      const screenScale =  2 / (window.innerWidth + window.innerHeight)
  
      touchState.position = {x: centerPositionRawX * screenScale, y: centerPositionRawY * screenScale}
  
      // Calculate average spread of touches from the center point
      if (touchList.length >= 2 ) {
        const spread = touchList.reduce((sum, touch) => {
          return sum +
            Math.sqrt(
              Math.pow(centerPositionRawX - touch.clientX, 2) +
              Math.pow(centerPositionRawY - touch.clientY, 2))
        }, 0) / touchList.length
  
        touchState.spread = spread * screenScale
      }
  
      return touchState
    },
    getEventPrefix(touchCount) {
      const numberNames = ['one', 'two', 'three', 'many']
      return numberNames[Math.min(touchCount, 4) - 1]
    }
  })

// Component that uses the gesture-detector and raycaster to drag and drop an object
AFRAME.registerComponent('hold-drag', {
    schema: {
      cameraId: {default: 'camera'},
      groundId: {default: 'ground'},
      dragDelay: {default: 300 },
    },
    init: function() {
      this.camera = document.getElementById(this.data.cameraId)
      this.threeCamera = this.camera.getObject3D('camera')
      this.ground = document.getElementById(this.data.groundId)

      this.internalState = {
        fingerDown: false,
        dragging: false,
        distance: 0,
        startDragTimeout: null,
        raycaster: new THREE.Raycaster(),
      }

      this.fingerDown = this.fingerDown.bind(this)
      this.startDrag = this.startDrag.bind(this)
      this.fingerMove = this.fingerMove.bind(this)
      this.fingerUp = this.fingerUp.bind(this)

      this.el.sceneEl.addEventListener('touchstart', this.fingerDown)
      this.el.sceneEl.addEventListener('onefingermove', this.fingerMove)
      this.el.sceneEl.addEventListener('onefingerend', this.fingerUp)
    },
    tick: function() {
      if (this.internalState.dragging) {
        let desiredPosition = null
        if (this.internalState.positionRaw) {
  
          const screenPositionX = this.internalState.positionRaw.x / document.body.clientWidth * 2 - 1
          const screenPositionY = this.internalState.positionRaw.y / document.body.clientHeight * 2 - 1
          const screenPosition = new THREE.Vector2(screenPositionX, -screenPositionY)
  
          this.threeCamera = this.threeCamera || this.camera.getObject3D('camera')
  
          this.internalState.raycaster.setFromCamera(screenPosition, this.threeCamera)
          const intersects = this.internalState.raycaster.intersectObject(this.ground.object3D, true)
  
          if (intersects.length > 0) {
            const intersect = intersects[0]
            this.internalState.distance = intersect.distance
            desiredPosition = intersect.point
          }
        }
  
        if (!desiredPosition) {
          desiredPosition = this.camera.object3D.localToWorld(new THREE.Vector3(0, 0, -this.internalState.distance))
        }

        this.el.object3D.position.lerp(desiredPosition, 0.2)
      }
    },
    remove: function() {
      this.el.sceneEl.removeEventListener('touchstart', fingerDown)
      this.el.scene.removeEventListener('onefingermove', fingerMove)
      this.el.scene.removeEventListener('onefingerend', fingerUp)
    },
    fingerDown: function(event) {
      this.internalState.fingerDown = true
      this.internalState.startDragTimeout = setTimeout(this.startDrag, this.data.dragDelay)
      this.internalState.positionRaw = event.detail.positionRaw
    },
    startDrag: function(event) {
        if (!this.internalState.fingerDown ) {
          return
        }
        this.internalState.dragging = true
        this.internalState.distance = this.el.object3D.position.distanceTo(this.camera.object3D.position)
      },
    fingerMove: function(event) {
      this.internalState.positionRaw = event.detail.positionRaw
    },
    fingerUp: function(event) {
      this.internalState.fingerDown = false
      clearTimeout(this.internalState.startDragTimeout)

      this.internalState.positionRaw = null
      this.internalState.dragging = false
    }
  })

  AFRAME.registerComponent('pinch-scale', {
    schema: {
      min: {default: 0.3},
      max: {default: 8}
    },
    init: function() {
      this.initialScale = this.el.object3D.scale.clone()
      this.scaleFactor = 1
      this.handleEvent = this.handleEvent.bind(this)
      this.el.sceneEl.addEventListener('twofingermove', this.handleEvent)
    },
    remove: function() {
      this.el.sceneEl.removeEventListener('twofingermove', this.handleEvent)
    },
    handleEvent: function(event) {
      this.scaleFactor *= 1 + event.detail.spreadChange / event.detail.startSpread
      this.scaleFactor = Math.min(Math.max(this.scaleFactor, this.data.min), this.data.max)
  
      this.el.object3D.scale.x = this.scaleFactor * this.initialScale.x
      this.el.object3D.scale.y = this.scaleFactor * this.initialScale.y
      this.el.object3D.scale.z = this.scaleFactor * this.initialScale.z
    }
  })