var Interaction = (function(){

	'use strict';
	/* jshint validthis: true */
    
	function Interaction(props){
		console.log('Interaction');
		this.element = (props.element)?props.element:document.body;
		
		this.onTap = (props.onTap)?props.onTap:function(){};
		this.onSwipeUp = (props.onSwipeUp)?props.onSwipeUp:function(){};
		this.onSwipeDown = (props.onSwipeDown)?props.onSwipeDown:function(){};
		this.onSwipeLeft = (props.onSwipeLeft)?props.onSwipeLeft:function(){};
		this.onSwipeRight = (props.onSwipeRight)?props.onSwipeRight:function(){};
		this.onDrag = (props.onDrag)?props.onDrag:function(){};
		this.onDown = (props.onDown)?props.onDown:function(){};
		this.onMove = (props.onMove)?props.onMove:function(){};
		this.onUp = (props.onUp)?props.onUp:function(){};
		this.onMouseWheel = (props.onMouseWheel)?props.onMouseWheel:null;
		
		this.dragState = {
			x:0,
			y:0,
			startX:0,
			startY:0,
			startTime:0
		}
		
		// add functions to this, binded to scope
		this.onMouseDown = onMouseDown.bind(this);
		this.onMouseMove = onMouseMove.bind(this);
		this.onMouseUp = onMouseUp.bind(this);

		this.onTouchStart = onTouchStart.bind(this);
		this.onTouchMove = onTouchMove.bind(this);
		this.onTouchEnd = onTouchEnd.bind(this);
        
		this.down = down.bind(this);
		this.move = move.bind(this);
		this.keyDown = keyDown.bind(this);
		this.keyUp = keyUp.bind(this);
		this.up = up.bind(this);
        
        this.arrows = {
            up: false,
            down: false,
            left: false,
            right: false
        }
		
		// add new listeners
		addListeners.call(this);
	}
	
	Interaction.prototype.destroy = function(){
		// add new listeners
		removeListeners.call(this);
		
		this.element = null;
		
		this.onStart = null;
		this.onDrag = null;
		this.onEnd = null;
		
		this.onMouseDown = null;
		this.onMouseMove = null;
		this.onMouseUp = null;
		this.onTouchStart = null;
		this.onTouchMove = null;
		this.onTouchEnd = null;
		this.down = null;
		this.move = null;
        this.up = null;
	};

	function addListeners(){
        this.element.addEventListener('mousedown', this.onMouseDown);
        this.element.addEventListener('touchstart', this.onTouchStart);
        this.element.addEventListener('keydown', this.keyDown);
        this.element.addEventListener('keyup', this.keyUp);

        if(this.onMouseWheel)this.element.addEventListener('wheel', this.onMouseWheel)
	}

	function removeListeners(){
        this.element.removeEventListener('mousedown', this.onMouseDown);
        this.element.removeEventListener('touchstart', this.onTouchStart);
        this.element.removeEventListener('keydown', this.keyDown);
        this.element.removeEventListener('keyup', this.keyUp);

		// are drag listeners still in place? remove them
		if(this.mousedrag)removeMouseDrag.call(this);
		if(this.touchdrag)removeTouchDrag.call(this);
        if(this.onMouseWheel)this.element.removeEventListener('wheel', this.onMouseWheel)
	}
		
	/* -------------------- MOUSE LISTENERS -------------------- */
	
	function onMouseDown(e){

		e.preventDefault();

        if(this.dragging)return;
		
        this.down(e.pageX, e.pageY);
        

        addMouseDrag.call(this);
	}
	
	function addMouseDrag(){

		this.mousedrag = true;


		document.body.addEventListener('mousemove', this.onMouseMove);
		document.body.addEventListener('mouseup', this.onMouseUp);
		document.body.addEventListener('mouseleave', this.onMouseUp);
		// $(document.body).on('mouseleave', this.onMouseUp);		
	}
	
	function removeMouseDrag(){

		this.mousedrag = false;
		document.body.removeEventListener('mousemove', this.onMouseMove);
		document.body.removeEventListener('mouseup', this.onMouseUp);
		document.body.removeEventListener('mouseleave', this.onMouseUp);
		// $(document.body).off('mouseleave', this.onMouseUp);		
	}
	
	function onMouseMove(e){
		e.preventDefault();

        this.move(e.pageX, e.pageY);
		
	}
	
	function onMouseUp(e){
		e.preventDefault();

        this.up(e.pageX, e.pageY);
		
        removeMouseDrag.call(this);
	}
	
	
	/* -------------------- TOUCH LISTENERS -------------------- */
	
	function onTouchStart(e){

		e.preventDefault();
		if(this.dragging)return;
		
        var touch = e.touches[0];
        this.down(touch.pageX, touch.pageY);
        
        addTouchDrag.call(this);

        // e.preventDefault();
	}

	function addTouchDrag(e){
		this.touchdrag = true;
		document.body.addEventListener('touchmove', this.onTouchMove, {passive:false});
		document.body.addEventListener('touchend', this.onTouchEnd);
	}

	function removeTouchDrag(){
		this.touchdrag = false;
		document.body.removeEventListener('touchmove', this.onTouchMove, {passive:false});
		document.body.removeEventListener('touchend', this.onTouchEnd);
	}

	function onTouchMove(e){
		e.preventDefault();
        var touch = e.touches[0];
        this.move(touch.pageX, touch.pageY);
        // e.preventDefault();
		
	}
	
	function onTouchEnd(e){
		e.preventDefault();
        var touch = e.changedTouches[0];
        this.up(touch.pageX, touch.pageY);
		
        removeTouchDrag.call(this);
        // e.preventDefault();
	}

	/* -------------------- DRAG FUNCTIONALITY -------------------- */
		
	function down(x, y){
		this.moved = false;
		this.dragging = true;
		
		this.dragState.x = this.dragState.startX = x;
		this.dragState.y = this.dragState.startY = y;
		
		this.dragState.maxMove = 0;
		this.dragState.startTime = Date.now();
		this.dragState.currTime = this.dragState.startTime;
		this.dragState.deltaTime = 0;
		// if(this.onStart)this.onStart(x,y);
		this.onDown(x,y);
		
	}
	
	function move(x, y){
		this.moved = true;
		
		this.onDrag(x,y,x-this.dragState.x,y-this.dragState.y);
		
		var now = Date.now();
		this.dragState.deltaTime = now-this.dragState.currTime;
		this.dragState.currTime = now;
        
        this.dragState.maxMove = Math.max(this.dragState.maxMove, Math.pow(this.dragState.startX-x, 2)+Math.pow(this.dragState.startY-y, 2));
		
        this.dragState.x = x;
        this.dragState.y = y;
	}
	
	function up(x, y){
		this.dragging = false;
		// if(this.onEnd)this.onEnd(x,y);
        this.onUp(x, y, {distance:this.dragState.maxMove, duration:Date.now()-this.dragState.startTime});
	}	
	
    /* -------------------- KEYBOARD FUNCTIONALITY -------------------- */
    
    function keyDown(e){
        e = e || window.event;

        if (e.keyCode == '38') {            // up 
            this.arrows.up = true;
        } else if (e.keyCode == '40') {     // down            
            this.arrows.down = true;
        } else if (e.keyCode == '37') {     // left
            this.arrows.left = true;
        } else if (e.keyCode == '39') {     // arrow
            this.arrows.right = true;
        }
    }
    
    function keyUp(e){
        e = e || window.event;

        if (e.keyCode == '38') {            // up 
            this.arrows.up = false;
        } else if (e.keyCode == '40') {     // down            
            this.arrows.down = false;
        } else if (e.keyCode == '37') {     // left
            this.arrows.left = false;
        } else if (e.keyCode == '39') {     // arrow
            this.arrows.right = false;
        }
    }



    Interaction.prototype.addListeners = addListeners;
    Interaction.prototype.removeListeners = removeListeners;
    
	return Interaction;
})();

export { Interaction };