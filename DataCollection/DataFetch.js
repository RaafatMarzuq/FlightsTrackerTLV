require('dotenv').config();
const axios = require('axios');




function getFlights(){
    return new Promise ( res => {
        axios.get(`https://airlabs.co/api/v9/flights?_view=array&_fields=airline_icao,lat,lng,alt,dir,dep_iata,arr_iata,status,&api_key=${process.env.FLIGHTS_ACCESS_KEY}`)
         .then(response => {
            res(response)            
        }).catch(error => {
            console.log(error);
        });
    })

}

function getWeather(cityName,countryCode){
    return new Promise ( res => {
        
        axios.get(`https://api.openweathermap.org/data/2.5/weather?q= ${cityName},${countryCode}&appid=${process.env.WEATHER_API_KEY}`)
         .then(response => {

            const temperatureK = response.data.main.temp;
            // temperature in celsius
            const weatherData = {
                temperatureC : (temperatureK - 273.15).toFixed(2) ,
                humidity     : response.data.main.humidity,
                windSpeedK   : response.data.wind.speed,
                windDeg      : response.data.wind.deg,
                cityName     : response.data.name,
                countryName  : response.data.sys.country
            }
            res(weatherData)
        
            }).catch(error => {
            console.log(error);
        });
    })
}
// getWeather('Tel Aviv' , 'IL');
module.exports.getFlights = getFlights;
module.exports.getWeather = getWeather;