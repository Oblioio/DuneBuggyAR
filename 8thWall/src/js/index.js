import { Main as ARScene } from "./arscene";

// Component that places trees where the ground is clicked
AFRAME.registerComponent('tap-place', {
    init: function() {
        const newElement = document.createElement('a-entity')
        newElement.setAttribute('visible', 'false')
        newElement.setAttribute('gltf-model', '#buggy')
        this.el.sceneEl.appendChild(newElement)
        const arscene = new ARScene(this.el.camera);
        arscene.index = this;
        this.el.camera.el.id = 'camera';

        this.el.renderer.shadowMap.enabled = true;

        newElement.addEventListener('model-loaded', () => {
            console.log('MODEL LOAD#EDDD!!!');
            // // Once the model is loaded, we are ready to show it popping in using an animation
            // newElement.setAttribute('visible', 'true')

            arscene.addBuggy(newElement.object3D.children[0]);

            const buggyElement = document.createElement('a-entity');
            buggyElement.classList.add('cantap');
            buggyElement.setAttribute('hold-drag', '');
            buggyElement.setAttribute('two-finger-spin', '');
            buggyElement.setAttribute('pinch-scale', '')
            buggyElement.setAttribute('visible', 'false')
            buggyElement.object3D.add(arscene.scene);
            
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

        let ne = document.createElement('a-entity');
        ne.setAttribute('visible', 'false');
        ne.setAttribute('obj-model', 'obj: #terrain_ne')
        this.el.sceneEl.appendChild(ne)
        ne.addEventListener('model-loaded', () => {
            console.log('TERRAIN MODEL LOAD#EDDD!!!');
            arscene.addTerrain('ne', ne.object3D.children[0]);
        });

        let nw = document.createElement('a-entity');
        nw.setAttribute('visible', 'false');
        nw.setAttribute('obj-model', 'obj: #terrain_nw')
        this.el.sceneEl.appendChild(nw)
        nw.addEventListener('model-loaded', () => {
            console.log('TERRAIN2 MODEL LOAD#EDDD!!!');
            arscene.index = this;
            arscene.addTerrain('nw', nw.object3D.children[0]);
        });

        let se = document.createElement('a-entity');
        se.setAttribute('visible', 'false');
        se.setAttribute('obj-model', 'obj: #terrain_se')
        this.el.sceneEl.appendChild(se)
        se.addEventListener('model-loaded', () => {
            console.log('TERRAIN3 MODEL LOAD#EDDD!!!');
            arscene.addTerrain('se', se.object3D.children[0]);
        });

        let sw = document.createElement('a-entity');
        sw.setAttribute('visible', 'false');
        sw.setAttribute('obj-model', 'obj: #terrain_sw')
        this.el.sceneEl.appendChild(sw)
        sw.addEventListener('model-loaded', () => {
            console.log('TERRAIN4 MODEL LOAD#EDDD!!!');
            arscene.addTerrain('sw', sw.object3D.children[0]);
        });
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

let now = Date.now();

AFRAME.registerComponent('two-finger-spin', {
  schema: {
    factor: {default: 5}
  },
  init: function() {
    this.handleEvent = this.handleEvent.bind(this)
    this.el.sceneEl.addEventListener('twofingermove', this.handleEvent)
  },
  remove: function() {
    this.el.sceneEl.removeEventListener('twofingermove', this.handleEvent)
  },
  handleEvent: function(event) {    
    this.el.object3D.rotation.y += event.detail.positionChange.x * this.data.factor
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
        // let newnow = Date.now();
        // console.log(newnow - now);
        // now = newnow;
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