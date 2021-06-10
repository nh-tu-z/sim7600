const {mongooseToObject} = require('../../tool/mongoose.js')
const {multipleMongooseToObject} = require('../../tool/mongoose.js')

const User = require('../models/user/UserManagementModel.js')
const Alarm = require('../models/alarm/cabinAlarms')

class AlarmController {
    //GET /user/alarms
    showAlarms(req,res,next) {
        res.render('./user/alarm/alarms', {page: "Alarms", user: mongooseToObject(req.user)})   
    }

    //GET /user/alarms/manage-alarms
    showManageAlarms(req,res,next) {
        Alarm.find()
            .then((alarms) => {
                res.render('./user/alarm/manage-alarms', {page: "Alarms", user: mongooseToObject(req.user), alarms: multipleMongooseToObject(alarms)}) 
            })
            .catch(next)   
    }

    //GET /user/alarms/create-alarm
    createAlarm(req,res) {
        res.render('./user/alarm/create-alarm', {page: "Alarms", user: mongooseToObject(req.user)})
    }

    //GET /user/alarms/bin
    binAlarm(req,res,next) {
        Alarm.findDeleted()
            .then((alarms) => {
                res.render('./user/alarm/bin', {page: "Alarms", user: mongooseToObject(req.user), alarms: multipleMongooseToObject(alarms)})
            })
            .catch(next)
    }

    //POST /user/alarms/add-alarm
    addAlarm(req,res,next) {
        var newAlarm = req.body
        var alarm = new Alarm(newAlarm)
        alarm.save()
            .then(() => {
                res.redirect('/user/alarms')
            })
            .catch(next)
    }

    //DELETE /user/alarms/:id/force
    permanentDeleteAlarm(req,res,next) {
        Alarm.deleteOne({_id: req.params.id})
            .then(() => {
                res.redirect('back')
            })
            .catch(next)
    }

    //DELETE /user/alarms/:id
    softDeleteAlarm(req,res,next) {
        Alarm.delete({_id: req.params.id})
            .then(() => {
                res.redirect('back')
            })
            .catch(next)
    }

    //PATCH /user/alarms/:id
    restoreAlarm(req,res,next) {
        Alarm.restore({_id: req.params.id})
            .then(() => {
                res.redirect('back')
            })
            .catch(next)
    }
}

module.exports = new AlarmController