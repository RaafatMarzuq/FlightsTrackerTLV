require('dotenv').config();
const axios = require('axios');



    function getArrivalFlightsTLV(){
    return new Promise ( res => {
        axios.get(`https://airlabs.co/api/v9/flights?arr_iata=TLV&_view=array&_fields=dep_iata,arr_iata,flight_iata&api_key=${process.env.FLIGHTS_ACCESS_KEY}`)
        .then(response => {
           res(response)             
        }).catch(error => {
            console.log(error);
            res("")

        });
    })

}
function getDepartureFlightsTLV(){

    return new Promise ( res => {
        axios.get(`https://airlabs.co/api/v9/flights?dep_iata=TLV&_view=array&_fields=dep_iata,arr_iata,flight_iata&api_key=${process.env.FLIGHTS_ACCESS_KEY}`)
        .then(response => {
           res(response)      
        }).catch(error => {
            console.log(error);
            res("")

        });
    })

}

function FlightsOnGround(){
    return new Promise ( res => {
        axios.get(`https://airlabs.co/api/v9/schedules?dep_iata=TLV&_view=array&_fields=dep_iata,arr_iata,flight_iata,dep_time&api_key=${process.env.FLIGHTS_ACCESS_KEY}`)
        .then(response => {
            let new_data = [];
            
            response.data.forEach(element => {
                if(getTime(element[3])){
                    new_data.push([element[0],element[1], element[2]])
                }
            })
           res(new_data)            
        }).catch(error => {
            console.log(error);
            res("")
        });
    })

}

async function flightINFO(flightIata){
    if(flightIata){
    return new Promise ( res => {
        axios.get(`https://airlabs.co/api/v9/flight?flight_iata=${flightIata}&_view=array&_fields=flight_iata,flag,airline_icao,lat,lng,alt,dep_iata,arr_iata,status,airline_icao,dep_time,arr_time,delayed&api_key=${process.env.FLIGHTS_ACCESS_KEY}
        `).then(response => {

                         res(response)           
                    }).catch(error => {
                        
                        console.log("error flightINFO");
                        res("")

   });
})
    }

}
function getWeather(countryCode){
    if(countryCode){
    return new Promise ( res => {
        
        axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${countryCode}&appid=9fa292766dbbd553e2ee998de37af7bc`)
        .then(response => {
            const temperatureK = response.data.main.temp;
            // temperature in celsius
             weatherData = (temperatureK - 273.15).toFixed(2) ;
                // }
            res(weatherData)
        
            }).catch(error => {
            console.log("error  getWeather");
            res("")

            });
    })

}
}


function getPeriod(){
    var date_ob = new Date();
    var day = ("0" + date_ob.getDate()).slice(-2);
    var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    var year = date_ob.getFullYear();
    
    var date = year + "-" + month + "-" + day;
   
    const Hholyday = ["Rosh Hashana","Sukkot","Yom Kippur","Shmini Atzeret","Lag BaOmer","Simchat Torah","Chanukah","Pesach","Shavuot","Purim",]
    return new Promise ( res => { 
        axios.get(`https://www.hebcal.com/converter?cfg=json&date=${date}&g2h=1`)
        .then(response => {

            var arr2 = response.data.events
            
            for (let i = 0; i < arr2.length; i++) {
                const element = arr2[i];
                Hholyday.forEach(element2 => {
                    if(element.includes(element2)){
                        res('holiday')
                        return ;
                    }else {
                        if(date_ob.getMonth() >= 6  && date_ob.getMonth() <= 8) {
                            res('summer')
                            return;
                        }else{
                                res('normal day')
                                return;
                        }
                    }
                });
                
            }
                     
            }).catch(error => {
                console.log("error  getPeriod");
                res("")
    
                });
               
            });
  
}
function getCity(city,c){
    if(city,c){
    return new Promise ( res => { 
        axios.get(`https://airlabs.co/api/v9/cities?city_code=${city},${c}&_fields=name,lat,lng&api_key=${process.env.FLIGHTS_ACCESS_KEY}
        `).then(response => {
           res(response.data.response)
    }).catch(error => {
        console.log("error getCity");
        res("")
    });
    })
}
}


function getTime(timeStamp){
    var time = timeStamp.trim().split(/\s+/)[1].split(":");
    var hours = parseInt(time[0])*60
    var min = parseInt(time[1])
    
    var today = new Date();
    var TimeInMin = ((parseInt(today.getHours()))*60 + parseInt(today.getMinutes()));
    var dt =(hours+min)- TimeInMin;
    if((dt >= 0) && (dt <= 15)){
        return true
    }else return false ;

}


module.exports.getArrivalFlightsTLV = getArrivalFlightsTLV;
module.exports.getDepartureFlightsTLV = getDepartureFlightsTLV;
module.exports.getCity = getCity;
module.exports.getWeather = getWeather;
module.exports.flightINFO= flightINFO;
module.exports.getPeriod =  getPeriod;
module.exports.FlightsOnGround=FlightsOnGround;