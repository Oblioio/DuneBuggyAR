
function DuneBuggy() {
    this.frontWheelX = 2.6077;
    this.frontWheelSpace = 1.36649;
    var frontWheelRadius = 1.30245/4;
    this.backWheelX = -2.25336;
    this.backWheelSpace = 1.82944;
    var backWheelRadius = 1.56141/4;

    this.topSpeedXY = 40;
    this.speedXY = 0;
    this.vectorXY = [0, 1];
    this.accelerationXY = 15;
    this.accelerationXY_Mult = 0;
    this.frictionXY = 0.98; // slow down if accelerationXY_Mult is 0

    this.onGround = [true, true];

    var wheelPositions_orig = [
        [-this.frontWheelSpace, this.frontWheelX],
        [this.frontWheelSpace, this.frontWheelX],
        [-this.backWheelSpace, this.backWheelX],
        [this.backWheelSpace, this.backWheelX]
    ]

    // same but with a height too
    
    this.velocityZ = [0,0,0,0];
    this.positionsZ = [0,0,0,0];
    this.prev_positionsZ = [0,0,0,0];
    this.accelerationZ = -65;

    this.wheelPositions = [
        [-this.frontWheelSpace, this.frontWheelX,0],
        [this.frontWheelSpace, this.frontWheelX,0],
        [-this.backWheelSpace, this.backWheelX,0],
        [this.backWheelSpace, this.backWheelX,0]
    ]

    var wheelDist = this.frontWheelX - this.backWheelX;

    this.rotation = 0;

    this.tilt = 0;
    this.roll = 0;
    this.midHeight = 0;

    this.wheelHeights = [0,0,0,0];


    var first = true;

    var lerp = function(a,b,amt){
        return a+((b-a)*amt);
    }
    // save the wheel heights, determine frame height, tilt, and roll
    this.update = function(elapsedTime, FL, FR, BL, BR){
        if(first){
            this.positionsZ[0] = FL+frontWheelRadius;
            this.positionsZ[1] = FR+frontWheelRadius;
            this.positionsZ[2] = BL+backWheelRadius;
            this.positionsZ[3] = BR+backWheelRadius;
            first = false;
        }
        ////////////// XY Axis Update //////////////////

        // speed only changes if we are on the ground
        if(this.onGround[0] || this.onGround[1]){
            // we apply friction if the car doesn't have any forward or backward accelerations
            if(this.accelerationXY_Mult == 0)this.speedXY *= this.frictionXY;
            // if the car is going a different way than it's acceleration
            // we exponentially slow it down. It was just a bit sluggish when 
            // go from forwards to reverse and vise versa.
            if((this.speedXY)/Math.abs(this.speedXY) == -(this.accelerationXY_Mult/Math.abs(this.accelerationXY_Mult)))this.speedXY *= Math.pow(this.frictionXY, 3);
            // now apply acceleration
            this.speedXY = Math.min(this.topSpeedXY, Math.max(-this.topSpeedXY, this.speedXY+this.accelerationXY*this.accelerationXY_Mult*elapsedTime)) 
        }


        ////////////// Z Axis Update //////////////////
        // update velocities
        this.velocityZ[0] += this.accelerationZ*elapsedTime;
        this.velocityZ[1] += this.accelerationZ*elapsedTime;
        this.velocityZ[2] += this.accelerationZ*elapsedTime;
        this.velocityZ[3] += this.accelerationZ*elapsedTime;

        // save previous positions
        this.prev_positionsZ[0] = this.positionsZ[0];
        this.prev_positionsZ[1] = this.positionsZ[1];
        this.prev_positionsZ[2] = this.positionsZ[2];
        this.prev_positionsZ[3] = this.positionsZ[3];

        // update positions heights
        this.positionsZ[0] = Math.max(this.positionsZ[0] + this.velocityZ[0]*elapsedTime, FL+frontWheelRadius);
        this.positionsZ[1] = Math.max(this.positionsZ[1] + this.velocityZ[1]*elapsedTime, FR+frontWheelRadius);        
        this.positionsZ[2] = Math.max(this.positionsZ[2] + this.velocityZ[2]*elapsedTime, BL+backWheelRadius);
        this.positionsZ[3] = Math.max(this.positionsZ[3] + this.velocityZ[3]*elapsedTime, BR+backWheelRadius);

        // this smooths out the positions a bit
        this.positionsZ[0] = lerp(this.positionsZ[0], (this.positionsZ[0]+this.positionsZ[1])/2, 0.5);
        this.positionsZ[0] = lerp(this.positionsZ[1], (this.positionsZ[0]+this.positionsZ[1])/2, 0.5);
        this.positionsZ[2] = lerp(this.positionsZ[2], (this.positionsZ[2]+this.positionsZ[3])/2, 0.5);
        this.positionsZ[3] = lerp(this.positionsZ[3], (this.positionsZ[2]+this.positionsZ[3])/2, 0.5);
        
        // save new velocityZ
        this.velocityZ[0] = Math.min((this.positionsZ[0]-this.prev_positionsZ[0])/elapsedTime, 30);
        this.velocityZ[1] = Math.min((this.positionsZ[1]-this.prev_positionsZ[1])/elapsedTime, 30);
        this.velocityZ[2] = Math.min((this.positionsZ[2]-this.prev_positionsZ[2])/elapsedTime, 30);
        this.velocityZ[3] = Math.min((this.positionsZ[3]-this.prev_positionsZ[3])/elapsedTime, 30);

        var shockLength = 0.75;
        this.wheelPositions[0][2] = Math.max(this.positionsZ[0]-shockLength, FL+frontWheelRadius);
        this.wheelPositions[1][2] = Math.max(this.positionsZ[1]-shockLength, FR+frontWheelRadius);
        this.wheelPositions[2][2] = Math.max(this.positionsZ[2]-shockLength, BL+backWheelRadius);
        this.wheelPositions[3][2] = Math.max(this.positionsZ[3]-shockLength, BR+backWheelRadius);

        this.onGround[0] = (
            this.wheelPositions[0][2] == FL+frontWheelRadius ||
            this.wheelPositions[1][2] == FR+frontWheelRadius
        )?true:false;

        this.onGround[1] = (
            this.wheelPositions[2][2] == BL+backWheelRadius ||
            this.wheelPositions[3][2] == BR+backWheelRadius 
        )?true:false;

        var midFront = (this.positionsZ[0]+this.positionsZ[1])/2;
        var midBack = (this.positionsZ[2]+this.positionsZ[3])/2;

        this.midHeight = (this.positionsZ[0]+this.positionsZ[1]+this.positionsZ[2]+this.positionsZ[3])/4;
        this.tilt = Math.atan((midFront-midBack)/wheelDist);

        this.roll = (Math.atan((FL-FR)/(this.frontWheelSpace*2))+Math.atan((BL-BR)/(this.backWheelSpace*2)))/2;
    }

    // update zRotation, determine new wheel positions
    this.rotate = function(amt){
        this.rotation += amt*Math.min(10, Math.abs(this.speedXY))/10;

        // update wheel x and y positions
        for(var i=0; i<4; i++){
            this.wheelPositions[i][0] = (wheelPositions_orig[i][0]*Math.cos(this.rotation)) - (wheelPositions_orig[i][1]*Math.sin(this.rotation))
            this.wheelPositions[i][1] = (wheelPositions_orig[i][0]*Math.sin(this.rotation)) + (wheelPositions_orig[i][1]*Math.cos(this.rotation))
        }

        // allow the car to turn, but do not change vector direction unless we are touching the ground
        if(this.onGround[0]){    
            this.vectorXY[0] = -Math.sin(this.rotation);
            this.vectorXY[1] = Math.cos(this.rotation);
        }
    }

}

export {DuneBuggy}