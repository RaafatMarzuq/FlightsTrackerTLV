const kafka = require('../kafka/PublishToKafka/publish');
const sql = require('./MySql/DataStoring');
const data = require('./DataFetch');



async function publishAndStor(){
    let period,
        airline,
        departureAirport,
        arrivalAirport,
        typeOfFlight,
        departureWeahter,
        arrivalWeather ,
        arrivalStatus ;
    
    const p =await data.getPeriod().then(res => period = res);

    

    const flights_Response = await data.getFlights();
    // [dep_iata,arr_iata,flight_iata]
    for (let index = 0; index < flights_Response.data.length; index++) {
        const element = flights_Response.data[index];
        if(element[0]== 'TLV' || element[1] == 'TLV' ){
           
    // flight_number,flag,airline_icao,lat,lng,alt,dep_iata,arr_iata,status,airline_icao,dep_time,arr_time,delayed
            const flightInfo =await data.flightINFO(element[2])
           
            if(flightInfo.data.response){
                if(data.getTime(flightInfo.data.response.dep_time) || data.getTime(flightInfo.data.response.arr_time)){
                airline =flightInfo.data.response.airline_icao;
                departureAirport = flightInfo.data.response.dep_iata;
                arrivalAirport = flightInfo.data.response.arr_iata ;
                
                if(flightInfo.data.response.delayed < 15){
                    arrivalStatus = 'on time'
                }else if(flightInfo.data.response.delayed < 60){
                    arrivalStatus = 'Delayed'
                }else{
                    arrivalStatus = 'severely Delayed'
                }

                var dep_lat_lng=[];
                data.getCity(departureAirport).then( res =>{
                    // console.log(res)
                    if(res[0]){
                        dep_lat_lng.push(res[0].lat)
                        dep_lat_lng.push(res[0].lng)
                        data.getWeather(res[0].name).then(ans=>{
                        departureWeahter = ans  ;
                                      }) ;
                    }
                    
                }
                )
                var arr_lat_lng=[];
                data.getCity(arrivalAirport).then(res =>{
                    // console.log(res)
                    if(res[0]){
                        arr_lat_lng.push(res[0].lat)
                        arr_lat_lng.push(res[0].lng)
                        data.getWeather(res[0].name).then(ans =>{
                         arrivalWeather =ans
                    })
                    }
                    
                })
                var dest = calcCrow(dep_lat_lng[0],dep_lat_lng[1],arr_lat_lng[0],arr_lat_lng[1])
                console.log(dest)
                if(dest <= 1500){
                    typeOfFlight = 'Short Flight';
                }else if (dest <= 3500) {
                    typeOfFlight = 'Average Flight';
                }else{
                    typeOfFlight = 'Long Flight';
                }
                
                const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
                const d = new Date();
                let day = weekday[d.getDay()];
                const m = ["January","February","March","April","May","June","July","August","September","October","November","December"];
                let month = m[d.getMonth()];
                const allData = {
                    flightNumber :flightInfo.data.response.flight_number,
                    period: period,
                    month:month,
                    day:day,
                    airline : airline,
                    departureAirport : departureAirport,
                    arrivalAirport : arrivalAirport,
                    typeOfFlight : typeOfFlight,
                    departureWeahter : departureWeahter,
                    arrivalWeather : arrivalWeather,
                    arrivalStatus : arrivalStatus ,
                    lat : flightInfo.data.response.lat,
                    lng : flightInfo.data.response.lng ,
                    alt : flightInfo.data.response.alt

                }
                sql.insertToDatabase(allData);
                // console.log(allData)
                // console.log("befor publishing to kafka")
                kafka.publish(allData);
            }
        }
        }
    }
    
       setTimeout(publishAndStor,40000) 
}

function calcCrow(lat1, lon1, lat2, lon2) 
    {
      var R = 6371; // km
      var dLat = toRad(lat2-lat1);
      var dLon = toRad(lon2-lon1);
      var lat1 = toRad(lat1);
      var lat2 = toRad(lat2);

      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c;
      return d;
    }

    // Converts numeric degrees to radians
    function toRad(Value) 
    {
        return Value * Math.PI / 180;
    }

publishAndStor()



