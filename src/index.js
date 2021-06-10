
const express = require('express')
const handlebars = require('express-handlebars')
const path = require('path')
const methodOverride = require('method-override')
const port = 8001
const route = require('./routes/index.js')
const db = require('./config/db/index.js')
const cookieParser = require('cookie-parser')

const app = express()
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer)

const mqtt = require('mqtt')
const mqttOptions = require('./config/mqtt/mqttOptions')
const browser = mqtt.connect('mqtt://broker.hivemq.com', mqttOptions)

const func = require('./tool/func')

const PhaseOne = require('./app/models/data/cabinPhaseOne')
const { JsonWebTokenError } = require('jsonwebtoken')


/* override method */
app.use(methodOverride('_method'))

/* environment var config */
require('dotenv').config()

/* config cookie-parser */
app.use(cookieParser(process.env.JWT_KEY))

/* config body-parser */
app.use(express.urlencoded({
  extended: true,
}))
app.use(express.json())

/* Connect to mongoDB */
db.connect()

/* Config static files */
app.use(express.static(path.join(__dirname,'public')))

/* Set views path */
app.set('views', path.join(__dirname,'resource','views'))

// /*Template Engine: handlebars*/ 
app.engine('hbs', handlebars(
  {
    extname: ".hbs",
    helpers: {
      sum: (a,b) => a + b,
      sub: (a,b) => a - b,
      isnotAdmin: (admin) => {
        if(admin === 'admin') {
          return false
        }
        return true
      },
      compare: (a, b, c) => {
        if(a === (b+c)){
          return true
        }
        return false
      },
      middle: (a,b,c,d) => {
        if(((a > b)&(a<(c+d)))) {
          return true
        }
        return false
      },
      ord: (page,index) => {
        return (page-1)*10+index+1
      },
      lessThan: (a, b) => {
        if(a<b){
          return true
        }
        return false
      }
    }
  }
))
app.set('view engine', 'hbs')

/* Route Init */
route(app)

/* Run App */
httpServer.listen(port, () => {
  console.log(`HTTP Server listening at http://localhost:${port}/site/login-form`)
})

/* MQTT config */
browser.on('connect', function () {
  browser.subscribe({'CabinetDevice01': {qos: 0},'VINH_1':{qos: 2}, 'DEAD-THREAD': {qos:2}}, function (err) {
    if (!err) {
      // browser.publish('presence', 'Hello mqtt')
    }
  })
})

/* Socket */
// usersNameSpace = io.of('/users')
// usersNameSpace.on('connection', socket => {
//   socket.emit('user','hey user!')
// })
var idSocket = 1
var jsonDevice = {}
var time2GetData = Date.now()
var timeStamp = Date.now()
io.on('connection', (socket) => {
  socket.id = idSocket
  idSocket++
  
  /* Indicator Socket Connection */
  console.log(`Socket number ${socket.id} connected!`)

  socket.on('disconnect', () => {
    /* Indicator Socket Disconnection */
    console.log(`Socket number ${socket.id} disconnected!`)
  })

  /* Set up Connection with Web App */
  socket.on('connection-setting',(data) => {
    /* Show Data */
    console.log(data)

    /* Start */
    if(!jsonDevice[data.deviceName]){
      jsonDevice[data.deviceName] = {dataReady : false}
    }

    /* Client Response To Render Status And Trigger Request Data */
    socket.emit('connection-setting', {state : 'SEARCHING DEVICE...', triggerRequest: true})

  })

  /* Response Data */
  socket.on('request-mqtt-data', (data) => {
    /* Indicate Device Request */
    // console.log(`Request From ${data.deviceName}`)

    /* Bug when refesh web app */
    if(jsonDevice[data.deviceName]){
      /* Check Data Trigger */
      if(jsonDevice[data.deviceName].dataReady){
        socket.emit('response-mqtt-data',jsonDevice[data.deviceName])
        socket.emit('connection-setting', {state : 'ON', triggerRequest: true})
        /* Disable Data Response */
        jsonDevice[data.deviceName].dataReady = false
        // console.log(jsonDevice[data.deviceName])
      } 
    }
  })

  /* Check Control Signal */
  socket.on('relay-control', (data) => {
    console.log(data)
    browser.publish('VINH_1',data,(err) =>{
      console.log(`Public Error: ${err}`)
    })
  })
})


var allowToGetData = false
browser.on('message', function (topic, message, packet) {
  // message is Buffer
  if(topic==='CabinetDevice0') {
    /* Show Payload */
    console.log(message.toString())

    if(func.isJSON(message)){
      var payload = JSON.parse(message)
      // console.log(payload)
      
      // var test = 'CabinetDevice01'
      
      /* Check Web App Connection */
      if(jsonDevice[topic]){
        /* Check RTC JSON */
        if(!payload.year){
          jsonDevice[topic] = func.Json2Object(payload)
          /* Trigger Response Data */
          jsonDevice[topic].dataReady = true 
          console.log(jsonDevice[topic])
        }
      }  

      /* Import Data To Database After 5m */
      var elapsedTime = func.elapsedTimeInSecond(time2GetData, Date.now())
      if(elapsedTime >= 2){
        /* Check JSON TimeStamp */
        if(payload.year) {
          timeStamp = new Date(payload.year,payload.month-1,payload.day,payload.hour,payload.minutes,payload.seconds)
          console.log(`Date Updated: ${timeStamp}`)
          /* Enable cycle */
          allowToGetData = true
        }
        if(allowToGetData){
          /* Check DI/DO */
          if(payload.SensorA){
            /* Get Data */
            var iOdata = func.Json2Object(payload)
            /* Save IO */
            func.saveIO(iOdata,timeStamp)
            console.log('MongoDB: Save IO Data Successfully!!!')
          }
          /* Check JOSN SELEC Data */
          else if(payload.V1N){
            /* Get Data */
            var selecData = func.Json2Object(payload)
            /* Database Phase One*/
            func.saveData2PhaseOne(selecData, timeStamp)
            /* Database Phase Two*/
            func.saveData2PhaseTwo(selecData, timeStamp)
            /* Database Phase Three*/
            func.saveData2PhaseThree(selecData, timeStamp)
            /* Database Phase Summary*/
            func.saveData2PhaseSummary(selecData, timeStamp)
            /* Reset Get Data Time */
            time2GetData = Date.now()
            /* Last cycle */
            allowToGetData = false
            /* Save Done */
            console.log('MongoDB: Save SELEC Data Successfully!!!')
          }
        }
      }
    }
    
  }
  if(topic==='VINH_1') {
    /* Show Payload */
    console.log(message.toString())
  }
})