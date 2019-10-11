
function DuneBuggy() {
    this.frontWheelX = 2.6077;
    this.frontWheelSpace = 1.36649;
    var frontWheelRadius = 1.30245/4;
    // var frontWheelRadius = 0;
    this.backWheelX = -2.25336;
    this.backWheelSpace = 1.82944;
    var backWheelRadius = 1.56141/4;
    // var backWheelRadius = 0;

    this.speed = 30;
    // this.speed = 0.01;
    this.velocity = [0, this.speed];

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
    this.acceleration = -50;

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
        // update velocities
        this.velocityZ[0] += this.acceleration*elapsedTime;
        this.velocityZ[1] += this.acceleration*elapsedTime;
        this.velocityZ[2] += this.acceleration*elapsedTime;
        this.velocityZ[3] += this.acceleration*elapsedTime;

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

        this.positionsZ[0] = lerp(this.positionsZ[0], (this.positionsZ[0]+this.positionsZ[1])/2, 0.5);
        this.positionsZ[0] = lerp(this.positionsZ[1], (this.positionsZ[0]+this.positionsZ[1])/2, 0.5);
        this.positionsZ[2] = lerp(this.positionsZ[2], (this.positionsZ[2]+this.positionsZ[3])/2, 0.5);
        this.positionsZ[3] = lerp(this.positionsZ[3], (this.positionsZ[2]+this.positionsZ[3])/2, 0.5);
        
        // this.positionsZ[0] = FL+frontWheelRadius;
        // this.positionsZ[1] = FR+frontWheelRadius;
        // this.positionsZ[2] = BL+backWheelRadius;
        // this.positionsZ[3] = BR+backWheelRadius;
        
        // save new velocity
        this.velocityZ[0] = Math.min((this.positionsZ[0]-this.prev_positionsZ[0])/elapsedTime, 30);
        this.velocityZ[1] = Math.min((this.positionsZ[1]-this.prev_positionsZ[1])/elapsedTime, 30);
        this.velocityZ[2] = Math.min((this.positionsZ[2]-this.prev_positionsZ[2])/elapsedTime, 30);
        this.velocityZ[3] = Math.min((this.positionsZ[3]-this.prev_positionsZ[3])/elapsedTime, 30);
        // console.log(this.velocityZ)

        var shockLength = 0.75;
        this.wheelPositions[0][2] = Math.max(this.positionsZ[0]-shockLength, FL+frontWheelRadius);
        this.wheelPositions[1][2] = Math.max(this.positionsZ[1]-shockLength, FR+frontWheelRadius);
        this.wheelPositions[2][2] = Math.max(this.positionsZ[2]-shockLength, BL+backWheelRadius);
        this.wheelPositions[3][2] = Math.max(this.positionsZ[3]-shockLength, BR+backWheelRadius);

        var midFront = (this.positionsZ[0]+this.positionsZ[1])/2;
        var midBack = (this.positionsZ[2]+this.positionsZ[3])/2;

        this.midHeight = (this.positionsZ[0]+this.positionsZ[1]+this.positionsZ[2]+this.positionsZ[3])/4;
        this.tilt = Math.atan((midFront-midBack)/wheelDist);

        this.roll = (Math.atan((FL-FR)/(this.frontWheelSpace*2))+Math.atan((BL-BR)/(this.backWheelSpace*2)))/2;
    }

    this.getWheelPos = function(index){
        return this.wheels[index];
    }

    // update zRotation, determine new wheel positions
    this.rotate = function(amt){
        this.rotation += amt;

        // update wheel x and y positions
        // px = x * cs - y * sn;
        // py = x * sn + y * cs;
        for(var i=0; i<4; i++){
            this.wheelPositions[i][0] = (wheelPositions_orig[i][0]*Math.cos(this.rotation)) - (wheelPositions_orig[i][1]*Math.sin(this.rotation))
            this.wheelPositions[i][1] = (wheelPositions_orig[i][0]*Math.sin(this.rotation)) + (wheelPositions_orig[i][1]*Math.cos(this.rotation))
        }

        this.velocity[0] = -this.speed*Math.sin(this.rotation);
        this.velocity[1] = this.speed*Math.cos(this.rotation);
    }

}

export {DuneBuggy}