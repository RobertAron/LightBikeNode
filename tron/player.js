const left = [-1,0]
const right = [1,0]
const up = [0,-1]
const down = [0,1]

class Player{
    constructor(id,startX,startY){
        this.id = id
        this.currentDirection = down
        this.nextDirection = down
        this.location = [startX,startY]
    }
    getLocation(){
        return this.location
    }
    update(){
        this.currentDirection = this.nextDirection
        const [directionX,directionY] = this.currentDirection
        const [currentX,currentY] = this.location
        this.location = [currentX+directionX,currentY+directionY]
    }
    changeDirection(direction){
        if(direction === 'left' && this.currentDirection !== right) this.nextDirection = left
        if(direction === 'right' && this.currentDirection !== left) this.nextDirection = right
        if(direction === 'up' && this.currentDirection !== down) this.nextDirection = up
        if(direction === 'down' && this.currentDirection !== up) this.nextDirection = down
    }
}

module.exports = Player