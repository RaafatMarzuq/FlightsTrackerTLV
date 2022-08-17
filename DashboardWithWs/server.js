const express = require('express')
const app = express();
const socketIO = require('socket.io');
const redisSub = require('../Redis/redissub')
const redisPub = require('../Redis/redispub');
const Mongo= require('../MongoDB/MongoDB')
const BigML= require('../bigML/bml');
const port=3000;

app.use(express.static('public'))
app.set('view engine', 'ejs')
redisPub;
// Function that sending the data to dashboard
function updateNewData(){
  // taking the data from redis
  var dataFromRedis= redisSub.getData();
  dataFromRedis.then(res => {
    var data = JSON.parse(res);
    // console.log(`data = ${data}`)
    var flights_counter = getFlightsNumber(data);
  
     getFlightsDataByNumber(data,flights_counter.arrFlightsNumber).then(arr_flights_data=>{
      getFlightsDataByNumber(data,flights_counter.depFlightsNumber).then(dep_flights_data=>{
        
        io.emit('flights data', arr_flights_data,dep_flights_data);
      })
     }

     );
 
    var airplains_location= getLngLat(data);
    
    // console.log(`flight counter = ${flights_counter}`)
    // console.log(`arr_flights_data = ${arr_flights_data}`)
    // console.log(`dep_flights_data = ${dep_flights_data}`)
    // console.log(`airplains_location = ${airplains_location}`)
    
       
      
    
    // console.log(JSON.stringify(flightsData['arrFlightsdata']))
    // Updating new data by using socket.io
    io.emit('flights counter', flights_counter);
    // io.emit('flights data', arr_flights_data,dep_flights_data);
    io.emit('flights location', airplains_location);
  });
  setTimeout(updateNewData,1000);
}

app.get('/', (req, res) => {
  
  res.render("pages/map")
  updateNewData();
})
function getLngLat(data){
  var locations = [];
  for (let index = 0; index < data.length; index++) {
    const element = data[index];
    const lngLat = {
      lat : element.lat,
      lng : element.lng
    }
    locations.push(lngLat);
  }
  return locations;
}
function getFlightsNumber(data){
  
    
  var arr_flights_sum=0,dep_flights_sum=0;
  var arr_flights_number=[],dep_flights_number = [];
  for (let index = 0; index < data.length; index++) {
      if(data[index].departureAirport == 'TLV'){
        dep_flights_sum++;
        dep_flights_number.push(data[index].flightNumber)
      }else if(data[index].arrivalAirport == 'TLV'){
        arr_flights_sum++;
        arr_flights_number.push(data[index].flightNumber)
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

async function getFlightsDataByNumber(data,flights){
  
  var flighits_data =[] ;
  for (let i = 0; i < flights.length; i++) {
    for (let j = 0; j < data.length; j++) {
    if (data[j].flightNumber == flights[i]) {
      const obj= {
        flightNumber :data[j].flightNumber,
        period: data[j].period,
        airline : data[j].airline,
        departureAirport : data[j].departureAirport,
        arrivalAirport : data[j].arrivalAirport,
        typeOfFlight : data[j].typeOfFlight,
        departureWeahter : data[j].departureWeahter,
        arrivalWeather : data[j].arrivalWeather,
        // arrivalStatus :  getArrivalStatus(data[j].flightNumber,data[j].period,data[j].airline,data[j].departureAirport,data[j].arrivalAirport,typeOfFlight,data[j].departureWeahter,data[j].arrivalWeather)
      }
      flighits_data.push(obj);
    }
      
    }
  }
  var str = "";
  const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const d = new Date();
  let day = weekday[d.getDay()];
  const m = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  let month = m[d.getMonth()];

  for (let k= 0; k< flighits_data.length; k++) {
  //  await getArrivalStatus(flighits_data[k]['flightNumber'],month,day,flighits_data[k]['airline'],flighits_data[k]['departureAirport'],flighits_data[k]['arrivalAirport'],flighits_data[k]['typeOfFlight'],flighits_data[k]['departureWeahter'],flighits_data[k]['arrivalWeather']).then(res=>{

      str += `Flight Number is ${flighits_data[k]['flightNumber']}
          Airline : ${flighits_data[k]['airline']}
          Departure Airport : ${flighits_data[k]['departureAirport']}
          Arrival Airport : ${flighits_data[k]['arrivalAirport']}
          Departure Weahter : ${flighits_data[k]['departureWeahter']}
          Arrival Weather : ${flighits_data[k]['arrivalWeather']}
          The flight will be ${"res"}
          
          `;

  //  })
   
    
  }
  console.log(str)
  return str;

}

async function getArrivalStatus(flightNumber,period,airline,departureAirport,arrivalAirport,typeOfFlight,departureWeahter,arrivalWeather){
  Mongo.exportToCsv();   
  const ans = await BigML.GetPred(flightNumber,period,airline,departureAirport,arrivalAirport,typeOfFlight,departureWeahter,arrivalWeather)
  return ans;
}
const server = express()
  .use(app)
  .listen(3000, () => console.log(`Listening Socket on http://localhost:3000`));
const io = socketIO(server);




