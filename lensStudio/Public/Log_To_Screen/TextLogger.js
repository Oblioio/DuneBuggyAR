// ----- USAGE -----
// To log text to the screen, use: 
// 	global.logToScreen(text);
// or:
// 	global.textLogger.addLog(text);
//
// To clear the text log, use:
// 	global.textLogger.clear();
//
// To change the log limit, use:
// 	global.textLogger.setLogLimit(limit);
//
// To change the text color, use:
// 	global.textLogger.setTextColor(colorRGBA);
//
// To enable or disable logging, use:
// 	global.textLogger.setLoggingEnabled(limit);
// -----------------

var TEXT_LOG_POS_HEIGHT_MOD = .6;
var TEXT_LOG_CHAR_SCALE = 1.0 / 200.0;
var TEXT_LOG_CAM_DIST = 1.0;

if(global.textLogger == null){

	var newObject = function(name) {
		return global.scene.createSceneObject(name);
	}

	global.wordWrap = function (str, intWidth, strBreak, cut) {
		intWidth = arguments.length >= 2 ? +intWidth : 75
		strBreak = arguments.length >= 3 ? '' + strBreak : '\n'
		cut = arguments.length >= 4 ? !!cut : false
		var i, j, line
		str += ''
		if (intWidth < 1) { return str }
		var reLineBreaks = /\r\n|\n|\r/
		var reBeginningUntilFirstWhitespace = /^\S*/
		var reLastCharsWithOptionalTrailingWhitespace = /\S*(\s)?$/
		var lines = str.split(reLineBreaks)
		var l = lines.length
		var match
		for (i = 0; i < l; lines[i++] += line) {
			line = lines[i]
			lines[i] = ''
			while (line.length > intWidth) {
	  			var slice = line.slice(0, intWidth + 1)
		  		var ltrim = 0
		  		var rtrim = 0
			  	match = slice.match(reLastCharsWithOptionalTrailingWhitespace)
			  	if (match[1]) {
			    	j = intWidth
			    	ltrim = 1
	  			} else {
				    j = slice.length - match[0].length
				    if (j) { rtrim = 1 }
				    if (!j && cut && intWidth){ j=intWidth }
				    if (!j) {
						var charsUntilNextWhitespace = (line.slice(intWidth).match(reBeginningUntilFirstWhitespace) || [''])[0]
						j = slice.length + charsUntilNextWhitespace.length
				    }
			  }
			  lines[i] += line.slice(0, j - rtrim)
			  line = line.slice(j + ltrim)
			  lines[i] += line.length ? strBreak : ''
			}
		}
		return lines.join('\n')
	}

	global.letterMeshCreator = (function(){

		var _textMaterial = script.textMaterial;

		var _disabledRootPool = [];
		var _disabledLetterPool = [];

		var getAvailableRootObject = function(name){
			if(_disabledRootPool.length > 0){
				var obj = _disabledRootPool.pop();
				obj.enabled = true;
				return obj;
			}

			var obj = newObject(name);
			return obj;
		}

		var removeRootObject = function(obj){
			obj.enabled = false;
			obj.setParent(script.getSceneObject());
			_disabledRootPool.push(obj);
		}

		var getAvailableLetterObject = function(){
			if(_disabledLetterPool.length > 0){
				var obj = _disabledLetterPool.pop();
				obj.enabled = true;
				return obj;
			}

			var obj = newObject("letter");
			obj.getTransform().setLocalScale(vec3.one().uniformScale(10))

			var mesh = obj.createComponent("Component.MeshVisual");
			mesh.addMaterial(_textMaterial);

			return obj;
		}

		var removeLetterObject = function(obj){
			obj.enabled = false;
			obj.setParent(script.getSceneObject());
			_disabledLetterPool.push(obj);
		}

		var recursiveRemove = function(obj){
			while(obj.getChildrenCount() > 0){
				recursiveRemove(obj.getChild(0));
			}
			removeLetterObject(obj);
		}

		var removeTextObj = function(obj){
			while(obj.getChildrenCount() > 0){
				recursiveRemove(obj.getChild(0));
			}
			removeRootObject(obj);
		}

		var makeLetterObj = function(letter, parent) {
			var cubeObj = getAvailableLetterObject();

			if(parent != null){
				cubeObj.setParent(parent);
			}

			var meshVisual = cubeObj.getFirstComponent("Component.MeshVisual");

			var renderMesh = script.getCharMesh(letter);
			if(!!renderMesh){
				meshVisual.enabled = true;
				meshVisual.mesh = renderMesh;
			}
			else{
				meshVisual.enabled = false;
			}
			
			return cubeObj;
		}

		var makeTextObj = function(text, pos, parent, maxWidth){
			var rootObj = getAvailableRootObject("text_"+text);

			if(parent != null){
				rootObj.setParent(parent);
			}

			var letterOffset = new vec2(6, 12);
			var spaceOffset = letterOffset.x;
			// var pos = new vec3(0,0);

			var charsWidth = maxWidth / letterOffset.x;

			text = global.wordWrap(text, charsWidth);

			for(var i = 0; i < text.length; i++){ 
				var chr = text.charAt(i);
				if(chr == '\n'){
					pos.x = 0;
					pos.y -= letterOffset.y;
				}
				else if(chr == ' '){
					pos.x += spaceOffset;
				}
				else{
					var letter = makeLetterObj(chr, rootObj);
					letter.getTransform().setLocalPosition(pos);
					pos.x += letterOffset.x;
				}
			}
			return [rootObj, pos];
		}

		var setTextColor = function(color){
			_textMaterial.mainPass.baseColor = color;
		}

		return {
			makeLetterObj : makeLetterObj,
			makeTextObj : makeTextObj,
			removeTextObj : removeTextObj,
			setTextColor : setTextColor,
		};
	}());

	global.textLogger = (function(){
		
		var _camera = script.camera;

		var _root = newObject("textLog");
		var _holderRoot = newObject("textHolder");

		var _pos = new vec3(0,0,0);
		var _maxWidth = null;

		var _lastFovOnResize = -1;

		var _logLimit = script.logLimit;
		var _logs = [];

		var _loggingEnabled = script.loggingEnabled;

		var init = function() {
			if(_camera == null){
				_camera = findComponentRecursive("Component.Camera", null);
			}
			_root.setParent(_camera.getSceneObject());

			resizeRootObject();

			_holderRoot.setParent(_root);
			_holderRoot.getTransform().setLocalPosition(new vec3(0,0,0));
			_holderRoot.getTransform().setLocalScale(new vec3(1,1,1));

			script.createEvent("UpdateEvent").bind(onUpdate);

			setTextColor(script.textColor);
		};

		var findComponentRecursive = function(componentType, obj){
			if(obj == null){
				for(var i=0;i<global.scene.getRootObjectsCount();i++){
					var ret = findComponentRecursive(componentType, global.scene.getRootObject(i));
					if(ret != null){
						return ret;
					}
				}
			}
			else{
				if(obj.getComponentCount(componentType) > 0){
					return obj.getFirstComponent(componentType);
				}
				for(var i=0;i<obj.getChildrenCount();i++){
					var ret = findComponentRecursive(componentType, obj.getChild(i));
					if(ret != null){
						return ret;
					}
				}
			}
			return null;
		}

		var resizeRootObject = function(){
			var dist = TEXT_LOG_CAM_DIST;
			var fov = _camera.fov;
			var aspect = _camera.aspect;
			var camSize = _camera.size;
			var vBorder = Math.tan(fov / 2) * dist;
			var hBorder = vBorder * aspect;

			_lastFovOnResize = fov;

			var bottomLeft = new vec3(-hBorder, -vBorder * TEXT_LOG_POS_HEIGHT_MOD, -dist - .1);

			var textScale = vBorder * TEXT_LOG_CHAR_SCALE;

			_maxWidth = (hBorder * 2) / textScale;

			_root.getTransform().setLocalPosition(bottomLeft);
			_root.getTransform().setLocalScale(new vec3(textScale,textScale,textScale));

			// Reprint any existing logs
			var logCount = getLogCount();
			if(logCount > 0){
				var logs = [];
				for(var i=0;i<logCount;i++){
					var text = getLogText(i);
					logs.push(text);
				}
				clear();
				for(var i=0;i<logs.length;i++){
					addLog(logs[i],true);
				}
			}
			
		};

		var setHolderYPos = function(yPos){
			var localPos = _holderRoot.getTransform().getLocalPosition();
			localPos.y = yPos;
			_holderRoot.getTransform().setLocalPosition(localPos);
		}

		var addLog = function(text, skipConsole){
			if(!skipConsole){
				print(text);
			}

			if(!_loggingEnabled){
				return;
			}

			var ret = global.letterMeshCreator.makeTextObj(">" + text + "\n", _pos, _holderRoot, _maxWidth);
			_pos = ret[1];
			_pos.x = 0;

			setHolderYPos(-_pos.y);

			var config = {
				'text': text,
				'sceneObject': ret[0],
			};
			_logs.push(config);

			removeExcessLogs();
		};

		var getLogConfig = function(index){
			return _logs[index];
		}

		var getLogText = function(index){
			return getLogConfig(index).text;
		}

		var getLogObject = function(index){
			return getLogConfig(index).sceneObject;
		}

		var removeLog = function(index){
			var obj = getLogObject(index);
			global.letterMeshCreator.removeTextObj(obj);
			_logs.splice(index,1)
		}

		var getLogCount = function(){
			return _logs.length;
		}

		var clear = function(){
			while(getLogCount() > 0){
				removeLog(0);
			}
			_pos.x = 0;
			_pos.y = 0;
			setHolderYPos(0);
		};

		var removeExcessLogs = function(){
			if(_logLimit >= 0){
				for(var i=getLogCount(); i>_logLimit; i--){
					removeLog(0);
				}
			}			
		};

		var setLogLimit = function(limit){
			if(limit !== _logLimit){
				_logLimit = limit;
				removeExcessLogs(); 
			}
		};

		var setTextColor = function(color){
			global.letterMeshCreator.setTextColor(color);
		}

		var setLoggingEnabled = function(enabled){
			_loggingEnabled = enabled;
		}

		var onUpdate = function() {
			if(_lastFovOnResize != _camera.fov) {
				resizeRootObject();
			}
		};
		
		init();

		return {
			addLog : addLog,
			clear : clear,
			setLogLimit : setLogLimit,
			setTextColor : setTextColor,
			setLoggingEnabled : setLoggingEnabled,
		};
	}());

	global.logToScreen = global.textLogger.addLog;
}



