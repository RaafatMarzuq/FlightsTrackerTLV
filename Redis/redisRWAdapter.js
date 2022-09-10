const kafka = require("../kafka/ConsumeFromKafka/consume")
const redis = require('ioredis')
kafka.consume(); // start the consumer

// Adapter between Kafka and Redis 

// connection details
const conn = {
    port: 3002,
    host: "127.0.0.1",
    db: 0
};

// Connect to redis
const redisDb = new redis(conn);

// Function that read data from Redis and publish it to channel "messages"
async function FromRedisToDashboard(){
    // pull keys from Redis with "Scan" command.
    
   let redisNowData = await redisDb.scan(0);
   let data=[];
   let values = redisNowData[1];
    let snum =redisNowData[0];
    // Go all over the keys at Redis and get the values. 
    do{
//   console.log("redisNowData =" , redisNowData)
    snum =parseInt(redisNowData[0]);
    for (let index = 0; index < values.length; index++){
            let element = values[index];
            await redisDb.hgetall(element).then(dataForPublish => {
                if(!timeOfNow(dataForPublish.arrivalTime)){
                    redisDb.del(dataForPublish.flightNumber)
                }
                else{
                    if(!data.includes(dataForPublish)){
                        data.push(dataForPublish); // Push the values to data array and send it to Redis publisher
                    }
                  

                }


            });
        
    }
    redisNowData = await redisDb.scan(snum);
    values = redisNowData[1];
    
    }while(snum != 0)

    console.log("\ndats.length = ",data.length)
    return data;
}

// FromRedisToDashboard()

// Function that write data from kafka to Redis
async function FromKafkaToRedis(result){
    // parse the result from "ToString" to JSON. 
    result = JSON.parse(result);
    var key = `${result["flightNumber"]}`;
    await redisDb.hmset(key,result); // insert data to Redis as hash-map
}

module.exports.flushAll = ()=>{
    redisDb.flushdb("async");
}

function timeOfNow(timeStamp){
    if(timeStamp.split(":")){
        var time = timeStamp.split(":");
        var hours = parseInt(time[0])*60
        var min = parseInt(time[1])
        
        var today = new Date();
    
        // console.log(today.getTime() ==inData )
        var TimeInMin = ((parseInt(today.getHours()))*60 + parseInt(today.getMinutes()));
        var dt =(hours+min)- TimeInMin;
        if(dt > 0){
            return true
        }else return false ;
    
    }
    return false;
  
}
module.exports.FromKafkaToRedis= FromKafkaToRedis;
module.exports.FromRedisToDashboard= FromRedisToDashboard;
