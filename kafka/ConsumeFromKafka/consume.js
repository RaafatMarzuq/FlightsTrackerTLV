require('dotenv').config();

const uuid = require("uuid");
const Kafka = require("node-rdkafka");

const redis = require(`../../Redis/redisRWAdapter`)
const MongoDB = require("../../MongoDB/MongoDB")
const kafkaConf = {
  "group.id": "kafka",
  "metadata.broker.list": "tricycle-01.srvs.cloudkafka.com:9094,tricycle-02.srvs.cloudkafka.com:9094,tricycle-03.srvs.cloudkafka.com:9094".split(","),
  "socket.keepalive.enable": true,
  "security.protocol": "SASL_SSL",
  "sasl.mechanisms": "SCRAM-SHA-256",
  "sasl.username": "w63twr24",
  "sasl.password":"aFBdS6zxflHeaCif4m8rnF4GFjhhc6Zp",
  "debug": "generic,broker,security"
};
const prefix = "w63twr24-";
const topic = `${prefix}new`;

const producer = new Kafka.Producer(kafkaConf);
// Convert to array because of the "subscriber" that can listen to multiple topics at the same time
const topics = [topic];
const consumer = new Kafka.KafkaConsumer(kafkaConf, {
  "auto.offset.reset": "beginning"
});

consumer.connect();
consumer.on("error", function(err) {
  console.error(err);
});

consumer.on("ready", function(arg) {
  console.log(`Consumer ${arg.name} ready`);
  consumer.subscribe(topics);
  consumer.consume();
});
module.exports.consume = ()=>{
  consumer.on("data",async function(m) {
    // insert into MongoDB and Redis
   await redis.FromKafkaToRedis(m.value);
   await MongoDB.insertToMongoDB(m.value);
    // console.log("data inserted to redis and mongo\n")
  });
}


consumer.on('event.error', function(err) {
  console.error(err);
  process.exit(1);
});

consumer.on('event.log', function(log) {
  // console.log(log);
});

consumer.on("disconnected", function(arg) {
  // delete the subscribe 
  process.exit();
});