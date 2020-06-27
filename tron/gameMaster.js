const Tron = require('./tron')

function createId(len = 6, chars = 'abcdefghjkmnopqrstwxyz123456789'){
    let id = new Array(len).fill(null).map(()=>{
        const charPicked = Math.floor(Math.random()*chars.length)
        return chars[charPicked]
    }).join("")
    return id
}

class GameMaster{
    constructor(io){
        this.io = io
        this.connectedPlayerList = []
        this.currentGame = null

        io.on('connection',(socket)=>{
            const newUserId = createId()
            this.connectedPlayerList.push(newUserId)
            socket.emit('set-user-id',newUserId)
            console.log(this.connectedPlayerList)

            socket.on('disconnect',()=>{
                const playerIndex = this.connectedPlayerList.indexOf(newUserId)
                this.connectedPlayerList.splice(playerIndex,1)
                console.log(this.connectedPlayerList)
            })

            socket.on('player-input',(input)=>{
                console.log(`PlayerId:${newUserId} User Input: ${input}`)
                this.currentGame.playerInput(newUserId,input)
            })
        })
        this.startNewGame()
    }

    emitGameStateUpdate(gameState){
        this.io.emit('game-state-update',gameState)
    }

    startNewGame(){
        this.currentGame = new Tron((gameState)=>this.emitGameStateUpdate(gameState),()=>this.startNewGame())
        this.connectedPlayerList.forEach((playerId)=>{
            this.currentGame.addPlayer(playerId)
        })
        this.currentGame.startGame()
    }
}

module.exports = GameMaster