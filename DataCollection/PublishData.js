const kafka = require('../kafka/PublishToKafka/publish');
const sql = require('./MySql/DataStoring');
const data = require('./DataFetch');



async function publishAndStor(){
    
    const flights_Response = await data.getFlights();
    // [airline_icao,lat,lng,alt,dep_iata,arr_iata,status,airline_icao]
    for (let index = 0; index < flights_Response.data.length; index++) {
        const element = flights_Response.data[index];
        if(element[4]== 'TLV' || element[5] == 'TLV' ){
            console.log(element)
        }
    }
    
        
}

publishAndStor()



