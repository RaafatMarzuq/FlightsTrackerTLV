const express = require('express')
const app = express();
const socketIO = require('socket.io');
// const redisSub = require('../Redis/redissub')
// const redisPub = require('../Redis/redispub');
// const Mongo= require('../MongoDB/MongoDB')
// const BigML= require('../bigML/bml');
const port=3000;

app.use(express.static('public'))
app.set('view engine', 'ejs')
// redisPub;


app.get('/', (req, res) => {
  var data = {
    cards: [
      {districtId:"haifa", title: "חיפה", value: 500, unit: "חבילות", fotterIcon: "", fotterText: "נפח ממוצע", icon: "content_copy" },
            
    ]
  }
  res.render("pages/map", data)
})

app.get('/setData/:districtId/:value', function (req, res) {
  io.emit('newdata',{districtId:req.params.districtId,value:req.params.value})
  res.send(req.params.value)
})


const server = express()
  .use(app)
  .listen(3000, () => console.log(`Listening Socket on http://localhost:3000`));
const io = socketIO(server);

//------------
// io.on('connection', (socket) => {  
//   socket.on('newdata', (msg) => {
//     console.log(msg);
//     io.emit('newdata', msg);
//   });
// });
//-----------

