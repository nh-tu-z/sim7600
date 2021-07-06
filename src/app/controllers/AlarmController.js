const {mongooseToObject} = require('../../tool/mongoose.js')
const {multipleMongooseToObject} = require('../../tool/mongoose.js')
const func = require('../../tool/func')
const User = require('../models/user/UserManagementModel.js')
const AnalogAlarm = require('../models/alarm/cabinAnalogAlarms')
const DigitalAlarm = require('../models/alarm/cabinDigitalAlarm')
const DigitalAlert = require('../models/alarm/dAlert')

class AlarmController {
    //GET /user/alarms
    showAlarms(req,res,next) {
        /* Pagination */
        var pageDA = parseInt(req.query.pageDA) || 1
        var iPerPageDA = 5
        var beginDA = (pageDA - 1) * iPerPageDA
        var endDA = pageDA * iPerPageDA
        var maxPageDA
        var digitalArr = []
        Promise.all([DigitalAlert.find(), DigitalAlarm.find()])
            .then(([alerts, alarms]) =>{
                var alarmOption = multipleMongooseToObject(alarms)
                if(alerts.length%5) {
                    maxPageDA = Math.floor(alerts.length/5) +1
                }
                else maxPageDA = alerts.length/5

                /* Total Data */
                var totalData = alerts.length
                /* Paging */
                var DAValues = alerts.slice(beginDA,endDA)
                DAValues.forEach((DAValue) => {
                    var digitalAlet = {
                        tagname: DAValue.tagname,
                        value: func.convertLogicLevel(DAValue.value),
                        time: func.getHHMMSS(DAValue.timestamps),
                        day: func.getDDMMYY(DAValue.timestamps)
                    }
                    digitalArr.push(digitalAlet)
                })

                /* */
                res.render('./user/alarm/alarms', {
                    page: "Alarms", 
                    user: mongooseToObject(req.user),
                    digitalAlert: digitalArr,
                    maxPageDA: maxPageDA,
                    totalData: totalData,
                    alarmOption: alarmOption
                })  
            })
            .catch(err => {return err})    
    }

    //GET /user/alarms/digital-data
    showDigitalAlert(req,res,next) {
          /* Pagination */
        var pageDA = parseInt(req.query.pageDA) || 1
        var iPerPageDA = 5
        var beginDA = (pageDA - 1) * iPerPageDA
        var endDA = pageDA * iPerPageDA
        var maxPageDA
        var digitalArr = []

        /* Filter */
        var filterOption = {}
        if(req.query.filter === 'All'){
            filterOption = {}
        }
        else {
            filterOption = {tagname: req.query.filter}
        }

        DigitalAlert.find(filterOption)
            .then((alerts) => {
                /* Max page */
                if(alerts.length%5) {
                    maxPageDA = Math.floor(alerts.length/5) +1
                }
                else maxPageDA = alerts.length/5

                digitalArr.push(maxPageDA)
                /* Paging */
                var DAValues = alerts.slice(beginDA,endDA)
                DAValues.forEach((DAValue) => {
                    var digitalAlet = {
                        tagname: DAValue.tagname,
                        value: func.convertLogicLevel(DAValue.value),
                        time: func.getHHMMSS(DAValue.timestamps),
                        day: func.getDDMMYY(DAValue.timestamps)
                    }
                    digitalArr.push(digitalAlet)
                })
                /* */
                res.json(digitalArr)   
            })
            .catch((err) => {console.log(err)})     
    }

    //GET /user/alarms/manage-alarms
    async showManageAlarms(req,res,next) {
        var arrDigitalAlarm = []
        await DigitalAlarm.find()
            .then((digitalAlarm) => {
                arrDigitalAlarm = multipleMongooseToObject(digitalAlarm)
            })
            AnalogAlarm.find()
            .then((analogAlarm) => {
                res.render('./user/alarm/manage-alarms', {
                    page: "Alarms", 
                    user: mongooseToObject(req.user), 
                    analogAlarm: multipleMongooseToObject(analogAlarm),
                    digitalAlarm: arrDigitalAlarm
                }) 
            })
            .catch(next)   
    }

    //GET /user/alarms/create-alarm
    createAlarm(req,res) {
        res.render('./user/alarm/create-alarm', {page: "Alarms", user: mongooseToObject(req.user)})
    }

    //POST /user/alarms/create-alarm/digital-alarm
    createDigitalAlarm(req,res,next) {
        var tagName = req.body
        var digitalAlarm = new DigitalAlarm(tagName)
        digitalAlarm.save()
            .then(() => {
                res.redirect('/user/alarms/manage-alarms')
            })
            .catch(next)
    }

    //GET /user/alarms/bin
    async binAlarm(req,res,next) {
        var digArr = []
        await DigitalAlarm.findDeleted()
            .then((diAlarms) => {
                digArr = multipleMongooseToObject(diAlarms)
            })
            .catch(next)
        AnalogAlarm.findDeleted()
            .then((alarms) => {
                res.render('./user/alarm/bin', {
                    page: "Alarms", 
                    user: mongooseToObject(req.user), 
                    aalarms: multipleMongooseToObject(alarms),
                    dalarms: digArr
                })
            })
            .catch(next)
    }

    //POST /user/alarms/create-alarm/analog-alarm
    createAnalogAlarm(req,res,next) {
        var newAlarm = req.body
        var analogAlarm = new AnalogAlarm(newAlarm)
        analogAlarm.save()
            .then(() => {
                res.redirect('/user/alarms/manage-alarms')
            })
            .catch(next)
    }

    //DELETE /user/alarms/:id/aa-force
    aaPermanentDeleteAlarm(req,res,next) {
        AnalogAlarm.deleteOne({_id: req.params.id})
            .then(() => {
                res.redirect('back')
            })
            .catch(next)
    }
    
    //DELETE /user/alarms/:id/da-force
    daPermanentDeleteAlarm(req,res,next) {
        DigitalAlarm.deleteOne({_id: req.params.id})
            .then(() => {
                res.redirect('back')
            })
            .catch(next)
    }

    //PATCH /user/alarms/:id/aa-soft-delete
    aaSoftDeleteAlarm(req,res,next) {
        AnalogAlarm.delete({_id: req.params.id})
            .then(() => {
                res.redirect('back')
            })
            .catch(next)
    }

    //PATCH /user/alarms/:id/da-soft-delete
    daSoftDeleteAlarm(req,res,next) {
        DigitalAlarm.delete({_id: req.params.id})
            .then(() => {
                res.redirect('back')
            })
            .catch(next)
    }

    //PATCH /user/alarms/:id/aa-restore
    aaRestoreAlarm(req,res,next) {
        AnalogAlarm.restore({_id: req.params.id})
            .then(() => {
                res.redirect('back')
            })
            .catch(next)
    }

    //PATCH /user/alarms/:id/da-restore
    daRestoreAlarm(req,res,next) {
        DigitalAlarm.restore({_id: req.params.id})
            .then(() => {
                res.redirect('back')
            })
            .catch(next)
    }
}

module.exports = new AlarmController