const Player = require('./player')
const boardSize = 100
class Tron{
    constructor(stateUpdateCallback,gameOverEvent){
        this.arena = new Array(boardSize).fill(null).map(()=>new Array(boardSize).fill(0))
        this.players = {}
        this.stateUpdateCallback = stateUpdateCallback
        this.gameStarted = false
        this.gameLoop
        this.gameOverEvent = gameOverEvent
    }

    addPlayer(id){
        console.log(`player added ${id}`)
        const startX = Math.floor(Math.random() * boardSize)
        const startY = Math.floor(Math.random() * boardSize)
        this.players[id] = new Player(id,startX,startY)
    }
    update(){
        Object.keys(this.players).forEach(playerId=>{
            const player = this.players[playerId]
            const [x,y] = player.getLocation()
            this.arena[y][x] = 1
            player.update()
        })
        const stillAlivePlayerIds = Object.keys(this.players).filter(playerId=>{
            const player = this.players[playerId]
            const [x,y] = player.getLocation()
            // player location is out of bounds
            if(Math.max(x,y)>=boardSize || Math.min(x,y)<0) return false
            return this.arena[y][x]!==1
        })
        this.players = stillAlivePlayerIds.map(id=>this.players[id]).reduce((acc,next)=>{
            acc[next.id] = next
            return acc
        },{})
        this.stateUpdateCallback(this.serialize())
        if( stillAlivePlayerIds.length === 0 ) this.gameOver()
    }

    serialize(){
        const serializedField = this.arena.map(row=>row.slice())
        Object.keys(this.players).forEach(playerId=>{
            const player = this.players[playerId]
            const [playerX,playerY] = player.getLocation()
            serializedField[playerY][playerX] = playerId
        })
        return serializedField
    }

    startGame(){
        this.gameLoop = setInterval(()=>{this.update()},50)
    }

    gameOver(){
        clearInterval(this.gameLoop)
        this.gameOverEvent()
    }

    playerInput(playerId,input){
        console.log(`player input: ${playerId} ${input}`)
        const player = this.players[playerId]
        if(player!==undefined){
            player.changeDirection(input)
        }
    }
}

module.exports = Tron