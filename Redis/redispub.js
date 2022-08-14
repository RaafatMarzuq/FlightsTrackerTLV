const express = require('express')
const app = express()
const port = 3001

const Redis = require('ioredis');

const redis = new Redis();

const channel = 'messages'

app.get('/', (req, res) => {
  res.send('Web Server with redis publisher is up')
})

app.get('/start', (req, res) => {
  redis.publish(channel, 'started');
  res.send('Starting message wes sent')
})

app.get('/stop', (req, res) => {
  redis.publish(channel, 'stopped');
  res.send('Stoping message wes sent')
})

app.listen(port, () => {
  console.log(`publisher is listening at http://localhost:${port}`)
})