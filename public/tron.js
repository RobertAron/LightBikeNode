const boardSize = 100
const [left, up, right, down] = [37, 38, 39, 40]
class Tron {
    constructor() {
        this.board = new Array(boardSize).fill(null).map(() => new Array(boardSize).fill(null))

        /** @type {HTMLCanvasElement} */
        this.uiCanvas = document.getElementById("ui-layer", { alpha: false })
        this.uiCtx = this.uiCanvas.getContext("2d")

        this.canvas = document.getElementById('game-layer')
        this.ctx = this.canvas.getContext('2d')

        const { width, height } = this.canvas
        const scaleTo = Math.min(width, height) / boardSize
        this.uiCtx.scale(scaleTo, scaleTo)
        this.ctx.scale(scaleTo, scaleTo)

        this.socket = new io()
        this.userId = null
        this.socket.on('game-state-update', msg => {
            this.board = msg
            requestAnimationFrame(() => this.draw())
        })
        this.socket.on('set-user-id', msg => {
            console.log(`user id set ${msg}`)
            this.userId = msg
        })

        document.addEventListener('keydown', event => {
            if (event.repeat) return
            const kCode = event.keyCode
            if (kCode == left) this.socket.emit('player-input', 'left')
            if (kCode == up) this.socket.emit('player-input', 'up')
            if (kCode == right) this.socket.emit('player-input', 'right')
            if (kCode == down) this.socket.emit('player-input', 'down')
        })
        this.drawLines()
    }

    clearScreen() {
        this.ctx.fillStyle = 'Black'
        const { width, height } = this.canvas
        this.ctx.fillRect(0, 0, width, height)
        this.ctx.fillStyle = 'Grey'
        this.ctx.fillRect(0, boardSize, width, height - boardSize)
        this.ctx.fillRect(boardSize, 0, height - boardSize, height)
    }

    drawBoard() {
        const colors = ["#000000", "blue", "green", "red"]
        const fillGroups = colors.reduce((acc, next) => {
            acc[next] = []
            return acc
        }, {})
        this.board.forEach((row, rowIndex) => {
            row.forEach((value, columnIndex) => {
                if (value === 0) { }
                else if (value === 1) fillGroups[colors[1]].push([columnIndex, rowIndex])
                else if (value === this.userId) fillGroups[colors[2]].push([columnIndex, rowIndex])
                else this.ctx.fillStyle = fillGroups[colors[3]].push([columnIndex, rowIndex])
            })
        })
        Object.keys(fillGroups).forEach(fillKey => {
            this.ctx.fillStyle = fillKey
            fillGroups[fillKey].forEach(([x, y]) => {
                this.ctx.fillRect(x, y, 1, 1)
            })
        })
    }

    drawLines() {
        this.uiCtx.lineWidth = .05
        for (let rowIndex = 0; rowIndex < boardSize; ++rowIndex) {
            for (let columnIndex = 0; columnIndex < boardSize; ++columnIndex) {
                const green = Math.floor(255 - (rowIndex / boardSize) * 255)
                const blue = Math.floor(255 - (columnIndex / boardSize) * 255)
                this.uiCtx.strokeStyle = `rgb(0,${green},${blue})`
                this.uiCtx.beginPath();
                this.uiCtx.moveTo(columnIndex, rowIndex + 1)
                this.uiCtx.lineTo(columnIndex + 1, rowIndex + 1)
                this.uiCtx.lineTo(columnIndex + 1, rowIndex)
                this.uiCtx.stroke()
            }
        }
    }

    draw(){
        this.clearScreen()
        this.drawBoard()
    }
}