// https://docs.redis.com/latest/rs/references/client_references/client_ioredis/
// https://thisdavej.com/guides/redis-node/
// https://helderesteves.com/the-crash-course-on-node-redis/
const express = require('express')
const app = express()
const port = 3000

const redis = require('ioredis')

const conn = {
    port: 6379,
    host: "127.0.0.1",
    db: 0
};

const redisDb = new redis(conn);

app.get('/', (req, res) => {
  res.send('Web Server with redis db is up')
})

app.get('/readx', (req, res) => {  
redisDb.get('x', (err, reply) => {
    if (err) throw err;
    console.log(reply);
    res.send(`value=${reply} `)
});})

app.get('/writex', (req, res) => {  
redisDb.set('x',200 ,(err, reply) => {
    if (err) throw err;
    console.log(reply);
    res.send(`value=${reply} `)
});})

app.get('/writelist', (req, res) => {  
redisDb.lpush('values',["one","two","tree"] ,(err, reply) => {
    if (err) throw err;
    console.log(reply);
    res.send(`value=${reply} `)
});})

app.get('/readlist', (req, res) => {  
redisDb.lrange('values',0,-1 ,(err, reply) => {
    if (err) throw err;
    console.log(reply);
    res.json(reply)
});})




app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})