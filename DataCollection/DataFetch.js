require('dotenv').config();
const axios = require('axios');




function getFlights(){
    return new Promise ( res => {
        axios.get(`https://airlabs.co/api/v9/flights?_view=array&_fields=dep_iata,arr_iata,flight_iata&api_key=${process.env.FLIGHTS_ACCESS_KEY}`)
         .then(response => {
            res(response)            
        }).catch(error => {
            console.log(error);
        });
    })

}
function flightINFO(flightIata){
    return new Promise ( res => {
    axios.get(`https://airlabs.co/api/v9/flight?flight_iata=${flightIata}&_view=array
                    &_fields=flight_number,flag,airline_icao,lat,lng,alt,dep_iata,arr_iata,status,airline_icao,dep_time,arr_time,delayed
                    &api_key=${process.env.FLIGHTS_ACCESS_KEY}`)
   
                    .then(response => {
                       res(response)            
                    }).catch(error => {
                        console.log(error);
   });
})
}
function getWeather(countryCode){
    return new Promise ( res => {
        
        axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${countryCode}&appid=${process.env.WEATHER_API_KEY}`)
         .then(response => {

            const temperatureK = response.data.main.temp;
            // temperature in celsius
            const weatherData = (temperatureK - 273.15).toFixed(2) ;
               
            // console.log(weatherData)
            res(weatherData)
        
            }).catch(error => {
            console.log(error);
        });
    })
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
                     
            });
               
            });
            
            
        
}
function getCity(city){
    if(city){
    return new Promise ( res => { 
    axios.get(`https://airlabs.co/api/v9/cities?city_code=${city}&_fields=name,lat,lng&api_key=${process.env.FLIGHTS_ACCESS_KEY}`).then(response => {
        // console.log(response)
        res(response.data.response)            
    }).catch(error => {
        console.log(error);
});
    })
}
}

// console.log( getTime("2021-07-22 22:53"))
function getTime(timeStamp){
    var time = timeStamp.trim().split(/\s+/)[1].split(":");
    var hours = parseInt(time[0])*60
    var min = parseInt(time[1])
    
    var today = new Date();
    var TimeInMin = ((parseInt(today.getHours()))*60 + parseInt(today.getMinutes()));
    
    if(Math.abs((hours+min)- TimeInMin) <= 15){
        return true
    }else return false ;

}

// getPeriod().then(res => {console.log(res)})
module.exports.getTime = getTime;
module.exports.getCity = getCity;
module.exports.getFlights = getFlights;
module.exports.getWeather = getWeather;
module.exports.flightINFO= flightINFO;
module.exports.getPeriod =  getPeriod;