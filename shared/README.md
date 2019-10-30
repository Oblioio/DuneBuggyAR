# SHARED

This folder contains code that is reused across all of the platforms. "shared_lensStudio.js" "shared_sparkAR.js" and "shared_web.js" are used by rollup to create the file that is written to each project folder.

# Terrain Heights

`node ./heightProcessor.js` will run a script that reads Terrain_Displacement.png and outputs terrainHeights at resolutions of 128, 256, and 512. What it's doing is reading the pixels of the height map and outputting a value of 0-255 in hex. Aka 00-FF. It puts all of the values into one long string that we can read into our javascript later. This was the best way that I could think of to get the height values into javascript with the smallest filesize.

# DynamicTerrain.js

This is a class that reads the heights that were created by heightProcessor.js and lets us look up height values within that. When a requested coordinate is between defined values it will interpolate the values. Originally this class was also used to create a dynamic mesh from the height data. This technique is no longer being used in the project though the code is still within the class. 

# DuneBuggy.js

This is a simple class that controls the Dune Buggy's movement.

