
var fs = require('fs'),
PNG = require('pngjs').PNG;

fs.createReadStream('./Terrain_Displacement.png')
    .pipe(new PNG({
    }))
    .on('parsed', function() {
        var getHeights = function(subdiv){
            var pxArray = [];
            // var subdiv = 16;
            for (var y = 0; y < this.height/subdiv; y++) {
                for (var x = 0; x < this.width/subdiv; x++) {
                    var idx = (this.width * (y*subdiv) + (x*subdiv)) << 2;
    
                    pxArray.push((this.data[idx]<16)?
                        "0"+(this.data[idx]).toString(16):
                        (Math.min(255, this.data[idx])).toString(16))
    
                }
            }
            return 'var TerrainHeights = "'+pxArray.join("")+'"\n\nexport {TerrainHeights}';
        }
        
        // var pxStr = 'var terrainHeights = "'+pxArray.join("")+'"';
        // console.log(pxStr.length)
        // fs.writeFile("output.json", JSON.stringify(pxArray), 'utf8', function (err) {
        fs.writeFile("./terrainHeights512.js", getHeights.call(this, 4), 'utf8', function (err) {
            if (err) {
                console.log("An error occured while writing JSON Object to File.");
                return console.log(err);
            }         
            console.log("512 JS file has been saved.");
        });
        fs.writeFile("./terrainHeights256.js", getHeights.call(this, 8), 'utf8', function (err) {
            if (err) {
                console.log("An error occured while writing JSON Object to File.");
                return console.log(err);
            }         
            console.log("256 JS file has been saved.");
        });
        fs.writeFile("./terrainHeights128.js", getHeights.call(this, 16), 'utf8', function (err) {
            if (err) {
                console.log("An error occured while writing JSON Object to File.");
                return console.log(err);
            }         
            console.log("128 JS file has been saved.");
        });
    });