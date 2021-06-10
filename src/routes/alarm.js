const express = require('express')
const router = express.Router()
const alarmController = require('../app/controllers/AlarmController')

router.get('/create-alarm', alarmController.createAlarm)
router.get('/manage-alarms', alarmController.showManageAlarms)
router.post('/create-alarm', alarmController.addAlarm)
router.get('/bin', alarmController.binAlarm)
router.delete('/:id/force', alarmController.permanentDeleteAlarm)
router.delete('/:id', alarmController.softDeleteAlarm)
router.patch('/:id', alarmController.restoreAlarm)
router.get('/', alarmController.showAlarms)

module.exports = router