const express = require('express')
const router = express.Router()
const alarmController = require('../app/controllers/AlarmController')

router.get('/create-alarm', alarmController.createAlarm)
router.get('/manage-alarms', alarmController.showManageAlarms)
router.post('/create-alarm/digital-alarm', alarmController.createDigitalAlarm)
router.post('/create-alarm/analog-alarm', alarmController.createAnalogAlarm)
router.get('/bin', alarmController.binAlarm)
router.delete('/:id/aa-force', alarmController.aaPermanentDeleteAlarm)
router.delete('/:id/da-force', alarmController.daPermanentDeleteAlarm)
router.patch('/:id/aa-soft-delete', alarmController.aaSoftDeleteAlarm)
router.patch('/:id/da-soft-delete', alarmController.daSoftDeleteAlarm)
router.patch('/:id/aa-restore', alarmController.aaRestoreAlarm)
router.patch('/:id/da-restore', alarmController.daRestoreAlarm)
router.get('/digital-data', alarmController.showDigitalAlert)
router.get('/', alarmController.showAlarms)

module.exports = router