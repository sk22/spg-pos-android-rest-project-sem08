const express = require('express')

const users = require('./routes/users')
const events = require('./routes/events')
const venues = require('./routes/venues')

const app = express()

app.use(express.json())

app.use('/users', users)
app.use('/events', events)
app.use('/venues', venues)

const port = 3000
app.listen(port)
console.log(`Listening on http://localhost:${port}`)
