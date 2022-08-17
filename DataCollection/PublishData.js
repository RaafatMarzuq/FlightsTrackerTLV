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

                departureWeahter  = await data.getWeather("tel aviv") ;
                arrivalWeather = await data.getWeather("tel aviv");
                typeOfFlight = 'short';

                const allData = {
                    flightNumber :flightInfo.data.response.flight_number,
                    period: period,
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


publishAndStor()



