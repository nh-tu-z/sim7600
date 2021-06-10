const mongoose = require('mongoose')
const mongooseDelete = require('mongoose-delete')

const Schema = mongoose.Schema

const cabinAlarms = new Schema({
    device_id: {type: String, },
    samples: {type:String, },
    highhigh: {type:String, default: ''},
    high: {type: String, },
    low: {type: String},
    lowlow: {type: String},
    statustag: {type: String},
    valuetag: {type: String}
  },{
    timestamps: true
  }) 
  
  const deviceAlarms = new Schema({
    device_id: {type: String, default: 'c01'},
    alarmname: {type:String, },
    highhigh: {type:Number, },
    high: {type: Number, },
    low: {type: Number},
    lowlow: {type: Number},
    deadband: {type: Number}
  },{
    timestamps: true
  })  

/* Soft delete plugin */
deviceAlarms.plugin(mongooseDelete, { overrideMethods: 'all' })
  
//Alarms Model
module.exports = mongoose.model('Alarm', deviceAlarms)
