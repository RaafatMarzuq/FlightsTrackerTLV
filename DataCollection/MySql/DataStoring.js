require('dotenv').config();

var mysql = require('mysql');


// Connect to MySQL data base
function connect(){
    var con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: `${process.env.SQL_PASSWORD}`,
      database: 'flightsData'
    });
    
    return con;
  }

function insertToDatabase(data){
    console.log(data);
    var con= connect();
    const period =data.period;
    const airline = data.airline
    const departureAirport = data.departureAirport;
    const arrivalAirport = data.arrivalAirport;
    const typeOfFlight = data.typeOfFlight;
    const departureWeahter = data.departureWeahter;
    const arrivalWeather = data.arrivalWeather ;
    const arrivalStatus = data.arrivalStatus;

    const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const d = new Date();
    let day = weekday[d.getDay()];
    const m = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    let month = m[d.getMonth()];

    var sql = `INSERT INTO flights (period,month,day, airline,departureAirport,arrivalAirport,typeOfFlight,departureWeahter,arrivalWeather,arrivalStatus )
         VALUES ('${period}','${month}','${day}',' ${airline}', '${departureAirport}', '${arrivalAirport}','${typeOfFlight}','${departureWeahter}','${arrivalWeather}','${arrivalStatus}') `;
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("flight inserted");
        con.end();
    });

}

function pullFromDB(){
    var con= connect();
     return new Promise(res => {
       con.query(`SELECT * FROM flights`, function (err, result) {
         if (err) {
           throw err;
         }
         res(result);
       })
     });
   }
   
   // The async call function
   async function pullFromDataBase(){
     const result = await pullFromDB();
     return result;
   }
   


module.exports.insertToDatabase = insertToDatabase ;
module.exports.pullFromDataBase = pullFromDataBase;