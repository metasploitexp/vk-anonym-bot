const express = require('express')
const config = require('config')
const bot = require('./command/bot')

const app = express()

const PORT = config.get('port') || 5000

app.use(express.json())

app.listen(PORT, () => {
    console.log(`Server has been started in port ${PORT}...`)
})