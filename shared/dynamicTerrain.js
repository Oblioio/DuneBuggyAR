import {TerrainHeights as terrainHeights} from './terrainHeights.js';
// import * as noise from './perlin.js';
// let noise = require('./perlin.js');
/*

NOTES for what I'm planning to do and how it's going to work

This class will create a sliding chunk of dynamic terrain.
The main peice will be a plane comprised by a grid of vertices
One main difference is that as the position of the grid changes the inner vertices will slide around
but the outer vertices will stay locked to the edge, becuase of that, there will always be an extra set of vertices


WHAT I WAS DOING

I was working on the slide function
The wrap around functions need to be implemented
Code needs to be added so the proper rows are set to update

Need to write code to generate mesh indices


*/

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
    this.move = move.bind(this);
    this.setPosition = setPosition.bind(this);
    this.slide = slide.bind(this);
    this.wrap_horizontal = wrap_horizontal.bind(this);
    this.wrap_vertical = wrap_vertical.bind(this);
    this.getPt = getPt.bind(this);
    this.returnPtArray = returnPtArray.bind(this);
    this.returnNormalArray = returnNormalArray.bind(this);
    this.returnUVArray = returnUVArray.bind(this);
    this.returnIndiceArray = returnIndiceArray.bind(this);
    this.returnIndiceArraySnap = returnIndiceArraySnap.bind(this);
    this.returnPackedArray = returnPackedArray.bind(this);
  
    this.setPosition(0,0);
  }
  
  function move(x, y) {
    this.setPosition(this.currentPosition[0]+x, this.currentPosition[1]+y);
  }
  
  function setPosition(x, y) {
    // console.log('////// set position', x, y, this.currentPosition[0], this.currentPosition[1]);
    // x = (x+100)%100;
    // y = (y+100)%100;
    // this.currentPosition[0] = (this.currentPosition[0]+100)%100;
    // this.currentPosition[1] = (this.currentPosition[1]+100)%100;
    
    // slide points
    this.slide(x-this.currentPosition[0], 0, this.xPos, this.wrap_horizontal);
    this.slide(y-this.currentPosition[1], 1, this.yPos, this.wrap_vertical);
  
    
    // update points
    var pt;
    for(var x = 0; x<this.numRows; x++){
      for(var y = 0; y<this.numRows; y++){
        if(x==0 || y==0 || x==this.lastRow || y==this.lastRow || this.ptInfo[x][y].update){
        // if(this.ptInfo[x][y].update){
          this.ptInfo[x][y].x = this.currentPosition[0] - this.xPos[x];
          this.ptInfo[x][y].y = this.currentPosition[1] - this.yPos[y];
          var ptData = getPt(this.ptInfo[x][y].x, this.ptInfo[x][y].y);
          this.ptInfo[x][y].u = ptData.u;
          this.ptInfo[x][y].v = ptData.v;
          this.ptInfo[x][y].z = ptData.z;
          this.ptInfo[x][y].update = false;          
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
      wrapNum =  Math.min(this.numRows-1, Math.ceil(Math.abs(this.offset[dimIndex])/this.spacing));
      // wrapNum = 0;
      // modulo
      // this.offset[dimIndex] += wrapNum * this.spacing;
      for(var w=0; w<wrapNum; w++){
        wrapFn(1); 
      }
      while(this.offset[dimIndex] < 0)this.offset[dimIndex] += this.spacing;
      // this.offset[dimIndex]
    } else if(this.offset[dimIndex] > this.spacing){
      wrapNum = Math.min(this.numRows-1, Math.floor(this.offset[dimIndex]/this.spacing))
      // modulo
      // this.offset[dimIndex] -= wrapNum * this.spacing;
      for(var w=0; w<wrapNum; w++){
        wrapFn(0);
      }
      while(this.offset[dimIndex] > this.spacing)this.offset[dimIndex] -= this.spacing;
    }
  
  
    this.currentPosition[dimIndex] += amt;
    // this.currentPosition[dimIndex] = (this.currentPosition[dimIndex]+100)%100;
  
    // fill positions
    // first, always the edge
    var currPos = -this.halfSize;
    posArray[0] = currPos;
  
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
      ind%262144:
      262143-(Math.abs(ind)%262144);
    
      if(verbose){
  
        console.log("ind, _ind", ind, _ind);
      }
    return parseInt(terrainHeights.substr(_ind*2, 2), 16)
  }
  
  function lerp(a,b,amt){
    return a+((b-a)*amt);
  }
  
  function getPt(x, y, verbose){
    var _x = x*5.12;
    var _y = y*5.12;
    if(verbose)console.log("/////////// GET PT: _x, _y", _x, _y);
    var pt0 = getHeightAtIndex((Math.floor(_y)*512)+Math.floor(_x), verbose);
    var pt1 = getHeightAtIndex((Math.floor(_y)*512)+Math.ceil(_x), verbose);
    var pt2 = getHeightAtIndex((Math.ceil(_y)*512)+Math.floor(_x), verbose);
    var pt3 = getHeightAtIndex((Math.ceil(_y)*512)+Math.ceil(_x), verbose);
  
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

  return DynamicTerrain;
}());

export { DynamicTerrain };
