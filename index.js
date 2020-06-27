const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const GameManager = require('./tron/gameMaster')
const port = 80
app.use('/public', express.static(`${__dirname}/public`))

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`)
})

const gameManager = new GameManager(io)

http.listen(port, () => {
    console.log(`listening on port ${port}`)
})
