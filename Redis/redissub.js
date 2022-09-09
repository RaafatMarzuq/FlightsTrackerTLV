const Redis = require('ioredis');
// From Dashboard to Redis

// Connection details
const conn = {
    port: 3002,
    host: "127.0.0.1",
    db: 0
};
const redis = new Redis(conn);
const channel = 'messages';

// Subscribe to channel
redis.subscribe(channel, (error, count) => {
    if (error) {
        throw new Error(error);
    }
});

// Function that listen to changes in channel "messages" 
async function getData(){
   redis.removeAllListeners();
    return new Promise (res=>{
        redis.on('message',async (channel, message) => {
            res(message);
        });
    });
}
   

module.exports.getData=getData;

