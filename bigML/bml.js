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
async function predictTopic(element){
  
  // console.log("\nthe data = " ,flightNumber,period,month,day,airline,departureAirport,arrivalAirport,typeOfFlight,departureWeahter,arrivalWeather+"\n")
 
  return  new Promise( res =>{
 
    var connection = new bigml.BigML('RaafatMarzuq','2a5da361441e10eaee2258ad814e5f2d764181b0')

    var source = new bigml.Source(connection);
    source.create('../bigML/MongoData.csv',true, async function(error, sourceInfo) {
      if(error) throw error;
      if (!error && sourceInfo) {
        var dataset = new bigml.Dataset(connection);
        dataset.create(sourceInfo, async function(error, datasetInfo) {
          if(error) throw error;
          
          if (!error && datasetInfo) {

              var predictionInput= {
                flightNumber : element.flightNumber,
                period : element.period,
                month : element.month ,
                day : element.day,
                airline : element.airline,
                departureAirport : element.departureAirport,
                arrivalAirport : element.arrivalAirport,
                typeOfFlight : element.typeOfFlight,
                departureWeahter : element.departureWeahter  ,
                arrivalWeather : element.arrivalWeather
              } 

              var prediction =  new bigml.Prediction(connection);
              if(predictionInput && prediction ){
              prediction.create('model/6303c8968f679a2d54000820',predictionInput, async function(error, prediction) {
                if(error) throw error;
              const output = await prediction.object.probabilities;
              var num1 = output[0][1],num2= output[1][1],num3= output[2][1];
              if(num1 > num2 && num1 > num3) {
                res( output[0][0]);
                return;
                }
                else if (num2 >= num1 && num2 >= num3) {
                res( output[1][0]);
                return;
                }
                else {
                  res( output[2][0]);
                return;
                
                }
        });
      }
      }
    });
    
    }
  });
   
}) 
 
}

async function GetPred(element){
  // console.log("\nflights data = ",flightNumber,period,month,day,airline,departureAirport,arrivalAirport,typeOfFlight,departureWeahter,arrivalWeather)
 
  var ans =  predictTopic(element);
 
  return ans;
}


// predictTopic("5123","summer","August","Monday","AIZ","TLV","AMS","short","31.62","31.69").then(res=> console.log(res));

// predictTopic("5013","summer","February","Tuesday","AIZ","TLV","AMS","short","31.62","31.69").then(res=> console.log(res));
 
// predictTopic("5134","summer","May","Friday","AIZ","TLV","AMS","short","31.62","31.69").then(res=> console.log(res));
// createModel()
// module.exports.predictTopic= predictTopic;
module.exports.GetPred = GetPred;
module.exports.createModel=createModel;