// https://github.com/bigmlcom/bigml-node/blob/master/docs/index.md
// https://www.dataem.com/bigml
// Don't run the all code all the time - produce a model ONCE and use for predictions from now on
// Look for an asyc version.

var bigml = require('bigml');


// replace the username and the API KEY of your own
function createModel(){

  var connection = new bigml.BigML('RaafatMarzuq','2a5da361441e10eaee2258ad814e5f2d764181b0')
  var source = new bigml.Source(connection);
  source.create('./MongoData.csv', function(error, sourceInfo) {
    if (!error && sourceInfo) {
      var dataset = new bigml.Dataset(connection);
      dataset.create(sourceInfo, function(error, datasetInfo) {
        if (!error && datasetInfo) {
          var model = new bigml.Model(connection);
          model.create(datasetInfo,{ 'objective_field': "000009" }, function (error, modelInfo) {
            if (!error && modelInfo) {
              console.log("\nModel number = " + modelInfo.resource);
            }
          
          });
        }
      });
    }
  });
}
async function predictTopic(flightNumber,period,month,day,airline,departureAirport,arrivalAirport,typeOfFlight,departureWeahter,arrivalWeather){
 
  // console.log("the data = " ,flightNumber,period,month,day,airline,departureAirport,arrivalAirport,typeOfFlight,departureWeahter,arrivalWeather+"\n")

  return await new Promise( res =>{
    var connection = new bigml.BigML('RaafatMarzuq','2a5da361441e10eaee2258ad814e5f2d764181b0')
    var source = new bigml.Source(connection);
    source.create('../bigML/MongoData.csv',true, async function(error, sourceInfo) {
      if(error) {
        console.log("ERROR1")
        throw error;}
      if (!error && sourceInfo) {
        var dataset = new bigml.Dataset(connection);
        dataset.create(sourceInfo, async function(error, datasetInfo) {
          if(error) {
            console.log("ERROR2")
            throw error;}
          if (!error && datasetInfo) {
          var predictionInput= {
            flightNumber :flightNumber,
            period: period,
            month : month,
            day : day,
            airline : airline,
            departureAirport : departureAirport,
            arrivalAirport : arrivalAirport,
            typeOfFlight : typeOfFlight,
            departureWeahter : departureWeahter,
            arrivalWeather : arrivalWeather
        }
        var prediction =  new bigml.Prediction(connection);
        if(predictionInput){
          // console.log("predictionInput" + JSON.stringify(predictionInput) + "\n")
        prediction.create('model/63037b01d432eb2ff0000e13',predictionInput, async function(error, prediction) {
          if(error) {
            console.log("ERROR3")
            throw error;}

         const output = await prediction.object.probabilities;
         var predictedTopic ,num1 = output[0][1],num2= output[1][1],num3= output[2][1];
         if(num1 > num2 && num1 > num3) {
          predictedTopic = output[0][0];
          }
          else if (num2 >= num1 && num2 >= num3) {
            predictedTopic = output[1][0];
          }
          else {
            predictedTopic = output[2][2];
          }
        

          res(predictedTopic)    
        }
      );}
      }
    });
  
    }
  });
}) 
}

async function GetPred(flightNumber,period,month,day,airline,departureAirport,arrivalAirport,typeOfFlight,departureWeahter,arrivalWeather){
  
  var ans = await predictTopic(flightNumber,period,month,day,airline,departureAirport,arrivalAirport,typeOfFlight,departureWeahter,arrivalWeather);
  console.log("predection = " + ans)
  return ans;
}
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// GetPred("740","summer","april",8,"AIZ","CDG","TLV","long","29.98","29.98").then(res=> console.log(res));
// createModel()
// module.exports.predictTopic= predictTopic;
module.exports.GetPred = GetPred;
module.exports.createModel=createModel;