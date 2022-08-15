require('dotenv').config();
const uuid = require("uuid");
const Kafka = require("node-rdkafka");



// From data entry to kafka
const kafkaConf = {
  "group.id": "kafka",
  "metadata.broker.list": "tricycle-01.srvs.cloudkafka.com:9094,tricycle-02.srvs.cloudkafka.com:9094,tricycle-03.srvs.cloudkafka.com:9094".split(","),
  "socket.keepalive.enable": true,
  "security.protocol": "SASL_SSL",
  "sasl.mechanisms": "SCRAM-SHA-256",
  "sasl.username": `${process.env.KAFKA_USERNAME}`,
  "sasl.password": `${process.env.KAFKA_PASSWORD}`,
  "debug": "generic,broker,security"
};

const prefix = "w63twr24-";
const topic = `${prefix}new`;
const producer = new Kafka.Producer(kafkaConf);

const genMessage = m => new Buffer.alloc(m.length,m);

producer.on("ready", function(arg) {
  console.log(`producer ${arg.name} ready.`); 
  
});

producer.connect();

module.exports.publish= function (msg){   
  m=JSON.stringify(msg);
  console.log(m); 

  producer.produce(topic, -1, genMessage(m), uuid.v4());     
}


