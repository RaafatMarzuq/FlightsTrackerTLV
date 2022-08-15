const RedisAdapter = require('../Redis/redisRWAdapter')
const redis = require('ioredis');

// From redis to Dashboard

// connection
const conn = {
    port: 3002,
    host: "127.0.0.1",
    db: 0
};
const redisDb = new redis(conn);
const channel = 'messages'


function readCallback(){
    RedisAdapter.FromRedisToDashboard().then(res=>{
        // check if the data is changed
        let dataForPublish = JSON.stringify(res);
        redisDb.publish(channel, dataForPublish );
        setTimeout(readCallback, 5000); // 5 sec
    });
}

readCallback();