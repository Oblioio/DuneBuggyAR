import {TerrainHeights as terrainHeights} from './terrainHeights256.js';

var DynamicTerrain = (function(){
  function DynamicTerrain(size, resolution) {
    this.size = size;
    this.halfSize = size/2;
    this.spacing = size/resolution;
    this.currentPosition = [0, 0];
    this.numRows = resolution + 2;
    this.lastRow = this.numRows-1;
    this.xPos = [];
    this.yPos = [];
    this.ptInfo = [];
    this.offset = [0,0];
    this.updateList = [];

    this.heightResolution = 256;
  
    // fill with zeros
    var currIndex = 0;
    for(var x = 0; x<this.numRows; x++){
      var zPosRow = [];
      var updateRow = [];
      for(var y = 0; y<this.numRows; y++){
        var pt = createPt();
        pt.index = currIndex;
        currIndex++;
        zPosRow.push(pt)
        updateRow.push(true)
      }
      this.xPos.push(0);
      this.yPos.push(0);
      this.ptInfo.push(zPosRow);
      this.updateList.push(updateRow);
    }
  
    // attach functions (lens studio doesn't like prototype I guess)
    // why do we have to create a stupid polyfill for function.bind()? ask the facebook devs, they seemed to have removed it
    // from their implementation

    this.move = bindFn(move, this);
    this.setPosition = bindFn(setPosition, this);
    this.slide = bindFn(slide, this);
    this.wrap_horizontal = bindFn(wrap_horizontal, this);
    this.wrap_vertical = bindFn(wrap_vertical, this);
    this.getPt = bindFn(getPt, this);
    this.getHeightAtIndex = bindFn(getHeightAtIndex, this);
    this.returnPtArray = bindFn(returnPtArray, this);
    this.returnNormalArray = bindFn(returnNormalArray, this);
    this.returnUVArray = bindFn(returnUVArray, this);
    this.returnIndiceArray = bindFn(returnIndiceArray, this);
    this.returnIndiceArraySnap = bindFn(returnIndiceArraySnap, this);
    this.returnPackedArray = bindFn(returnPackedArray, this);
  
    this.setPosition(0,0);
  }
  
  function move(x, y) {
    this.setPosition(this.currentPosition[0]+x, this.currentPosition[1]+y);
  }
  
  function setPosition(x, y) {
    var wrapPt = 100;
    // console.log('setPosition 1',x,y);
    // first lets wrap the position coordinates to be in the 0-100 range
    if(x >= wrapPt){
      x = x%wrapPt;
    } else if (x<0){
      x = wrapPt-(Math.abs(x)%wrapPt);
    }
    
    if(y >= wrapPt){
      y = y%wrapPt;
    } else if (y<0){
      y = wrapPt-(Math.abs(y)%wrapPt);
    }
    
    var modded = false;

    // console.log('setPosition 2',x,y);
    var dX = x-this.currentPosition[0];
    var dY = y-this.currentPosition[1];
    while(dX > 50){
      modded = true;
      this.currentPosition[0] += 100;
      dX = x-this.currentPosition[0];
    }
    while(dX < -50){
      modded = true;
      this.currentPosition[0] -= 100;
      dX = x-this.currentPosition[0];
    }
    while(dY > 50){
      modded = true;
      this.currentPosition[1] += 100;
      dY = y-this.currentPosition[1];
    }
    while(dY < -50){
      modded = true;
      this.currentPosition[1] -= 100;
      dY = y-this.currentPosition[1];
    }
    // // now lets check if we should correct the "currentPosition" to fit within 0-100"
    // if(this.currentPosition[0] >= 100){
    //   modded = true;
    //   this.currentPosition[0] -= 100;
    // } else if(this.currentPosition[0] < 0) {
    // // } else {
    //   modded = true;
    //   this.currentPosition[0] += 100;
    // }

    // if(this.currentPosition[1] >= 100){
    //   modded = true;
    //   this.currentPosition[1] -= 100;
    // } else if(this.currentPosition[1] < 0) {
    // // } else {
    //   modded = true;
    //   this.currentPosition[1] += 100;
    // }


    // if we modified the "currentPosition" lets update the point values to match
    if(modded){
      for(var _x = 0; _x<this.numRows; _x++){
        for(var _y = 0; _y<this.numRows; _y++){
          this.ptInfo[_x][_y].x = this.currentPosition[0] - this.xPos[_x];
          this.ptInfo[_x][_y].y = this.currentPosition[1] - this.yPos[_y];
          this.ptInfo[_x][_y].u = (0.5/2048)+(2047/2048)*(this.ptInfo[_x][_y].x/100);
          this.ptInfo[_x][_y].v = 1-((0.5/2048)+(2047/2048)*(this.ptInfo[_x][_y].y/100));
        }
      }
    }

    // slide points
    this.slide(dX, 0, this.xPos, this.wrap_horizontal);
    this.slide(dY, 1, this.yPos, this.wrap_vertical);
  
    // update points
    var pt;
    for(var _x = 0; _x<this.numRows; _x++){
      for(var _y = 0; _y<this.numRows; _y++){
        if(_x==0 || _y==0 || _x==this.lastRow || _y==this.lastRow || this.ptInfo[_x][_y].update){
        // if(this.ptInfo[x][y].update){
          this.ptInfo[_x][_y].x = this.currentPosition[0] - this.xPos[_x];
          this.ptInfo[_x][_y].y = this.currentPosition[1] - this.yPos[_y];
          var ptData = this.getPt(this.ptInfo[_x][_y].x, this.ptInfo[_x][_y].y);
          this.ptInfo[_x][_y].u = ptData.u;
          this.ptInfo[_x][_y].v = ptData.v;
          this.ptInfo[_x][_y].z = ptData.z;
          this.ptInfo[_x][_y].update = false;  
        }
      }
    }
  }
  
  // dimIndex is 0 for X, 1 for Y
  function slide(amt, dimIndex, posArray, wrapFn){
    this.offset[dimIndex] += amt;
  
    // figure out if we are wrapping and if so, how many times
    // wrap rows as neccesary and set their update status
    var wrapNum;
    if(this.offset[dimIndex] < 0){
      wrapNum = Math.min(this.numRows-1, Math.ceil(Math.abs(this.offset[dimIndex])/this.spacing));

      // console.log('wrap: '+'amt: '+amt+" wrapNum: "+wrapNum+" dim: "+((dimIndex == 0)?"H":"V")+" movement: "+this.spacing*wrapNum);
      for(var w=0; w<wrapNum; w++){
        wrapFn(1); 
      }
      while(this.offset[dimIndex] < 0)this.offset[dimIndex] += this.spacing;

    } else if(this.offset[dimIndex] >= this.spacing){
      wrapNum = Math.min(this.numRows-1, Math.floor(this.offset[dimIndex]/this.spacing))
      // console.log('wrap: '+'amt: '+amt+" wrapNum: "+wrapNum+" dim: "+((dimIndex == 0)?"H":"V")+" movement: "+this.spacing*wrapNum);
      for(var w=0; w<wrapNum; w++){
        wrapFn(0);
      }
      while(this.offset[dimIndex] >= this.spacing)this.offset[dimIndex] -= this.spacing;
    }
  
    this.currentPosition[dimIndex] += amt;
    // this.currentPosition[dimIndex] = (this.currentPosition[dimIndex]+100)%100;
  
    // fill positions
    // first, always the edge
    var currPos = -this.halfSize;
    posArray[0] = currPos;
    
    // if(dimIndex == 1)console.log(this.offset[dimIndex]);
    // middle
    currPos += this.offset[dimIndex];  
    for(var i = 1; i<this.numRows-1; i++){
      posArray[i] = currPos;
      currPos += this.spacing;
    }
  
    // last, always the edge
    posArray[this.numRows-1] = this.halfSize;
    // posArray[this.numRows-1] = currPos;
  }
  
  // direction is 0 for neg, 1 for pos
  function wrap_horizontal(direction){
    if(direction) {
      // this.xPos.push(this.xPos.shift());
      this.ptInfo.push(this.ptInfo.shift());
      for(var y = 0; y<this.numRows; y++) {
        this.ptInfo[this.numRows-1][y].update = true;
      }
    } else {
      // this.xPos.unshift(this.xPos.pop());
      this.ptInfo.unshift(this.ptInfo.pop());
      for(var y = 0; y<this.numRows; y++) {
        this.ptInfo[0][y].update = true;
      }
    }      
  }
  
  // direction is 0 for neg, 1 for pos
  function wrap_vertical(direction){
    if(direction){
      // this.yPos.push(this.yPos.shift());
      for(var x = 0; x<this.numRows; x++) {
        this.ptInfo[x].push(this.ptInfo[x].shift());
        this.ptInfo[x][this.numRows-1].update = true;
      }
    } else {
      // this.yPos.unshift(this.yPos.pop());
      for(var x = 0; x<this.numRows; x++) {
        this.ptInfo[x].unshift(this.ptInfo[x].pop());
        this.ptInfo[x][0].update = true;
      }
    }
  }
  
  function createPt(){
    return {
      x:0,
      y:0,
      z:0,
      index: 0,
      update:true
    };
  }
  
  function getHeightAtIndex(ind, verbose){
    var _ind = (ind >= 0)?
      ind%(this.heightResolution*this.heightResolution):
      (this.heightResolution*this.heightResolution)-1-(Math.abs(ind)%(this.heightResolution*this.heightResolution));
    
      if(verbose){
  
        console.log("ind, _ind", ind, _ind);
      }
    return parseInt(terrainHeights.substr(_ind*2, 2), 16)
  }
  
  function lerp(a,b,amt){
    return a+((b-a)*amt);
  }
  
  function getPt(x, y, verbose){
    var _x = x*(this.heightResolution/100);
    var _y = y*(this.heightResolution/100);
    if(verbose)console.log("/////////// GET PT: _x, _y", _x, _y);
    var pt0 = this.getHeightAtIndex((Math.floor(_y)*this.heightResolution)+Math.floor(_x), verbose);
    var pt1 = this.getHeightAtIndex((Math.floor(_y)*this.heightResolution)+Math.ceil(_x), verbose);
    var pt2 = this.getHeightAtIndex((Math.ceil(_y)*this.heightResolution)+Math.floor(_x), verbose);
    var pt3 = this.getHeightAtIndex((Math.ceil(_y)*this.heightResolution)+Math.ceil(_x), verbose);
  
    var xMixer = (_x>=0)?(_x%1):1+(_x%1);
    var yMixer = (_y>=0)?(_y%1):1+(_y%1);
  
    if(verbose){
      // console.log("_x, _y", _x, _y);
      console.log("getHeightAtIndex", pt0, pt1, pt2, pt3);
      console.log("_x%1, _y%1", _x%1, _y%1);
      console.log("xMixer, yMixer", xMixer ,yMixer);
      console.log("lerp", lerp(pt0, pt1, _x%1), lerp(pt2, pt3, _x%1), lerp(lerp(pt0, pt1, _x%1), lerp(pt2, pt3, _x%1), _y%1));
      console.log("lerp_wMIXER", lerp(pt0, pt1, xMixer), lerp(pt2, pt3, xMixer), lerp(lerp(pt0, pt1, xMixer), lerp(pt2, pt3, xMixer), yMixer));
      console.log(lerp(lerp(pt0, pt1, _x%1), lerp(pt2, pt3, _x%1), _y%1))
    }
    // lerp(lerp(pt0, pt1, _x%1), lerp(pt2, pt3, _x%1), _y%1);
  
    return {
      u:(0.5/2048)+(2047/2048)*(x/100),
      v:1-((0.5/2048)+(2047/2048)*(y/100)),
      // z:pt0/15
      // z:lerp(lerp(pt0, pt1, _x%1), lerp(pt2, pt3, _x%1), _y%1)/15
      z:lerp(lerp(pt0, pt1, xMixer), lerp(pt2, pt3, xMixer), yMixer)/15
    };
    // return {
    //   z:noise.simplex2(y,x)
    // };
  }
  
  function returnPtArray(){
    var ptArr = [];
    for(var x = 0; x<this.numRows; x++){
      for(var y = 0; y<this.numRows; y++){
        ptArr.push(
          -this.xPos[x],
          this.ptInfo[x][y].z,
          this.yPos[y]
        );
      }
    }
    return ptArr;
  }
  
  function returnNormalArray(){
    var ptArr = [];
    for(var x = 0; x<this.numRows; x++){
      for(var y = 0; y<this.numRows; y++){
        ptArr.push(
          0,
          1,
          0
        );
      }
    }
    return ptArr;
  }
  
  function returnUVArray(){
    var uvArr = [];
    for(var x = 0; x<this.numRows; x++){
      for(var y = 0; y<this.numRows; y++){
        uvArr.push(
          this.ptInfo[x][y].u,
          this.ptInfo[x][y].v
        );
      }
    }
    return uvArr;
  }
  
  function returnPackedArray(){
    var ptArr = [];
    for(var x = 0; x<this.numRows; x++){
      for(var y = 0; y<this.numRows; y++){
        ptArr.push(
          -this.xPos[x],
          this.ptInfo[x][y].z,
          this.yPos[y],
          0,
          1,
          0,
          this.ptInfo[x][y].u,
          this.ptInfo[x][y].v
        );
      }
    }
    return ptArr;
  }
  
  function returnIndiceArray(){
    var indices = [];
    for(var x = 0; x<this.numRows-1; x++){
      for(var y = 0; y<this.numRows-1; y++){
        indices.push(
          this.ptInfo[x][y].index,
          this.ptInfo[x][y+1].index,
          this.ptInfo[x+1][y].index,
          this.ptInfo[x+1][y].index,
          this.ptInfo[x][y+1].index,
          this.ptInfo[x+1][y+1].index
        )
      }
    }
    return indices;
  }
  
  function returnIndiceArraySnap(){
    var indices = [];
    for(var x = 0; x<this.numRows-1; x++){
      for(var y = 0; y<this.numRows-1; y++){
        indices.push(
          this.ptInfo[x][y].index,
          this.ptInfo[x+1][y].index,
          this.ptInfo[x][y+1].index,
          this.ptInfo[x+1][y].index,
          this.ptInfo[x+1][y+1].index,
          this.ptInfo[x][y+1].index
        )
      }
    }
    return indices;
  }

  function bindFn(fn, scope){
    if(fn.bind)return fn.bind(scope);

    /// v1
    return function () {
      var args = Array.prototype.slice.call(arguments, 0);
      return fn.apply(scope, args);
    };  

  }

  return DynamicTerrain;
}());

export { DynamicTerrain };
