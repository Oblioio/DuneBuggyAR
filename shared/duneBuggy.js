
function DuneBuggy() {
    this.frontWheelX = 2.6077;
    this.frontWheelSpace = 1.36649;
    var frontWheelRadius = 1.30245/4;
    // var frontWheelRadius = 0;
    this.backWheelX = -2.25336;
    this.backWheelSpace = 1.82944;
    var backWheelRadius = 1.56141/4;
    // var backWheelRadius = 0;

    this.speed = 0.35;
    // this.speed = 0.01;
    this.velocity = [0, this.speed];

    var wheelPositions_orig = [
        [-this.frontWheelSpace, this.frontWheelX],
        [this.frontWheelSpace, this.frontWheelX],
        [-this.backWheelSpace, this.backWheelX],
        [this.backWheelSpace, this.backWheelX]
    ]

    // same but with a height too
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

    // save the wheel heights, determine frame height, tilt, and roll
    this.setWheelHeights = function(FL,FR,BL,BR){
        this.wheelPositions[0][2] = FL+frontWheelRadius;
        this.wheelPositions[1][2] = FR+frontWheelRadius;
        this.wheelPositions[2][2] = BL+backWheelRadius;
        this.wheelPositions[3][2] = BR+backWheelRadius;

        var midFront = (FL+FR)/2;
        var midBack = (BL+BR)/2;

        this.midHeight = (this.wheelPositions[0][2]+this.wheelPositions[1][2]+this.wheelPositions[2][2]+this.wheelPositions[3][2])/4;
        // tan = opp/adj
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