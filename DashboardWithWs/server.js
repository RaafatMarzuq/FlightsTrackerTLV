const express = require('express')
const app = express();
const socketIO = require('socket.io');
const redisSub = require('../Redis/redissub')
const redisPub = require('../Redis/redispub');
// const publishData = require('../DataCollection/PublishData')
const Mongo= require('../MongoDB/MongoDB')
const BigML= require('../bigML/bml');
const port=3000;

// publishData;




app.use(express.static('public'))
app.set('view engine', 'ejs')
redisPub;

// Function that sending the data to dashboard
async function updateNewData(){
  
  // taking the data from redis
  var dataFromRedis= redisSub.getData();
   await dataFromRedis.then(async (res) => {
    
    var data = JSON.parse(res);
    var flights_counter = getFlightsNumber(data);

    var TLVweather = getTLVWeather(data,flights_counter.arrFlightsNumber);
    var airplains_location= getLngLat(data);
    var new_data = await getPrediction(data)
    var arr_flights_string = getFlightsDataByNumber(new_data,flights_counter.arrFlightsNumber)
    var dep_flights_string = getFlightsDataByNumber(new_data,flights_counter.depFlightsNumber)
  
     // Updating new data by using socket.io
    io.emit('flights location', airplains_location);
    io.emit('weather',TLVweather);
    io.emit('flights counter', flights_counter); 
    io.emit('flights data1', arr_flights_string) 
    io.emit('flights data2', dep_flights_string) 
  
  });


  setTimeout(updateNewData,30000);
}

app.get('/', (req, res) => {
  // redisRWAdapter.flushAll();
    updateNewData();

  res.render("pages/map")
})
function getLngLat(data){
  var locations = [];
  for (let index = 0; index < data.length; index++) {
    const element = data[index];
    if(((element.departureAirport == 'TLV' && !(getTime(element.departureTime)) ) ||(element.departureAirport != 'TLV' )  )){

    const lngLat = {
      lat : element.lat,
      lng : element.lng,
      flightNumber : element.flightNumber
    }
    locations.push(lngLat);
  }
  }
  return locations;
}
function getFlightsNumber(data){


  // i wont the flight that arrival in israel if(arrivalAirport == 'TLV' arrivalTime <= 15 )
  
  var arr_flights_sum=0,dep_flights_sum=0;
  var arr_flights_number=[],dep_flights_number = [];
  for (let index = 0; index < data.length; index++) {
      if(data[index].departureAirport == 'TLV' ){
        if(getTime(data[index].departureTime)){
          dep_flights_sum++;
       
          dep_flights_number.push(data[index].flightNumber)
        }
      }else if(data[index].arrivalAirport == 'TLV'){
        if(getTime(data[index].arrivalTime)){
          arr_flights_sum++;

          arr_flights_number.push(data[index].flightNumber)

        }


        
      }
  }
    const output = {
      arrFlightsSum : arr_flights_sum,
      depFlightsSum : dep_flights_sum ,
      arrFlightsNumber : arr_flights_number,
      depFlightsNumber : dep_flights_number
    }  
    return output;
}

 




function getTLVWeather(data,arrFlightsNumber){
 
    for (let j = 0; j < data.length; j++) {
      if (data[j].departureAirport == 'TLV') {
        return data[j].arrivalWeather;      
      }else if (data[j].arrivalAirport == 'TLV') {
        return data[j].arrivalWeather;      
      }
      
    }
}


const server = express()
  .use(app)
  .listen(3000, () => console.log(`Listening Socket on http://localhost:3000`));
const io = socketIO(server);

function getFlightsDataByNumber(data,flights){
  
  var str ="" ;
  for (let i = 0; i < flights.length; i++) {
    for (let j = 0; j < data.length; j++) {

      if (data[j].flightNumber == flights[i]) {
        const element = data[j];

                str += `Flight Number is ${element.flightNumber}
          Airline : ${element.airline}
          Departure Airport : ${element.departureAirport}
          Arrival Airport : ${element.arrivalAirport}
          Departure Weahter : ${element.departureWeahter}
          Arrival Weather : ${element.arrivalWeather}
          Departure Time : ${element.departureTime}
          Arrival Time : ${element.arrivalTime}         
          The flight will be : ${element.arrivalStatus}
          
          `;
  
   
  }
    }
  }
     return str;
}
function getTime(timeStamp){
  var time = timeStamp.split(":");
  var hours = parseInt(time[0])*60
  var min = parseInt(time[1])
  var today = new Date();
  var TimeInMin = ((parseInt(today.getHours()))*60 + parseInt(today.getMinutes()));
  
  var dt =(hours+min)- TimeInMin;
    if((dt >= 0) && (dt <= 15)){
      return true
  }else return false ;

}

async function getPrediction(data){
  let new_data =[];
  if(data){
    for (let i = 0; i < data.length ; i++ ) {
      const element = data[i];
      await BigML.GetPred(element).then(arrivalStatus =>{
        const obj ={
          flightNumber : element.flightNumber,
          period : element.period,
          month : element.month ,
          day : element.day,
          airline : element.airline,
          departureAirport : element.departureAirport,
          arrivalAirport : element.arrivalAirport,
          typeOfFlight : element.typeOfFlight,
          departureWeahter : element.departureWeahter  ,
          arrivalWeather : element.arrivalWeather,
          arrivalStatus : arrivalStatus,
          arrivalTime : element.arrivalTime,
          departureTime : element.departureTime
        }
        new_data.push(obj)
      })

    }
    return new_data;
  }
}
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

io.on('connection', (socket) => {
  socket.on('get new model',  async (inputData)=>{
    Mongo.exportToCsv();
   await BigML.createModel();
  

     
  });
});