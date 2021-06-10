const User = require('../app/models/user/UserManagementModel')
const Project = require('../app/models/user/projectID')
const PhaseOne = require('../app/models/data/cabinPhaseOne')
const PhaseTwo = require('../app/models/data/cabinPhaseTwo')
const PhaseThree = require('../app/models/data/cabinPhaseThree')
const PhaseSummary = require('../app/models/data/cabinSummary')
const DI = require('../app/models/IO/DI')
const DO = require('../app/models/IO/DO')

const {mongooseToObject} = require('../tool/mongoose')
const jwt = require('jsonwebtoken')
module.exports.arrayCabinDataToObject = (arr, date) => {
        var rv = {};
        var i = 0
        for ( ; i < arr.length; ++i)
          rv[i] = arr[i];
        rv[i] = date
        return rv;
    }

/* Site func */
module.exports.checkAdmin = async () => {
  var adminPhone = process.env.phone
  var admin = await User.findOne({phone: adminPhone})
  if(admin) return true
  return false
}

module.exports.createAdmin = async () => {
  var newUser = new User({
    email: process.env.email,
    role: 'admin',
    username: process.env.admin,
    phone: process.env.phone,
    password: process.env.password,
    project_id: [ process.env.project_id_1, process.env.project_id_2, process.env.project_id_3]
  })
  newUser.save()
    .then((result) => {
      console.log('New Admin is creacted!')
    })
    .catch(err => {return})
}

module.exports.checkStateProject = (state) => {
  state = state.toLowerCase()
  return state === 'active' ? true : false
}

module.exports.findDeviceById = async (deviceID, exec) => {
  await Project.findOne({_id: deviceID}, exec)
}

/* Check JSON */
module.exports.isJSON = (str) => {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}

/* Convert JSON Phase One To Object */
module.exports.Json2Object = (object) => {
  if(object.V1N) {
    return {
      /* Phase One */
      V1N: object.V1N,
      V12: object.V12,
      I1: object.I1,
      KW1: object.KW1,
      KVA1: object.KVA1,
      KVAR1: object.KVAR1,
      PF1: object.PF1,
      freq: object.f,

      /* Phase Two */
      V2N: object.V2N,
      V23: object.V23,
      I2: object.I2,
      KW2: object.KW2,
      KVA2: object.KVA2,
      KVAR2: object.KVAR2,
      PF2: object.PF2,
      KWH: object.KWH,

      /* Phase Three */
      V3N: object.V3N,
      V31: object.V31,
      I3: object.I3,
      KW3: object.KW3,
      KVA3: object.KVA3,
      KVAR3: object.KVAR3,
      PF3: object.PF3,

      /* Phase Sum */
      VLN: object.LN,
      VLL: object.LL,
      I: object.AI,
      KW0: object.T_KW,
      KVA0: object.T_KVA,
      KVAR0: object.T_KVAR,
      PF0: object.A_VF
    }
  }
  else if(object.SensorA) {
    return {
      DI0: object.SensorA,
      DI1: object.SensorB,
      DO0: object.RelayA,
      DO1: object.RelayB
    }
  }
  else {
    console.log('Error: JSON do not expect')
  }
}

/* Calculate Elapsed Time In Second */
module.exports.elapsedTimeInSecond = (start, end) => {
  let startInSecond = Math.floor(start / 1000) 
  let endInSecond = Math.floor(end / 1000) 
  return endInSecond - startInSecond
}

/* Save Phase One Data*/
module.exports.saveData2PhaseOne = (data, time) => {
  var phaseOneData = {
    device_id: "6094aedf24eeeb0dc4bd41cd",
    nsample: 9,
    samples: {
      VLN     :   data.V1N,
      VLL     :   data.V12,
      I      :   data.I1,
      KW      :   data.KW1,
      KVAR    :   data.KVAR1,
      KVA     :   data.KVA1,
      PF      :   data.PF1,
      freq   : data.freq,
      timeStamp : time
    }
  }
  const newPhaseOneData = new PhaseOne(phaseOneData)
  newPhaseOneData.save()
    .then()
    .catch(err => {console.log(err)})
}

/* Save Phase Two Data*/
module.exports.saveData2PhaseTwo = (data, time) => {
  var phaseTwoData = {
    device_id: "6094aedf24eeeb0dc4bd41cd",
    nsample: 9,
    samples: {
      VLN     :   data.V2N,
      VLL     :   data.V23,
      I      :   data.I2,
      KW      :   data.KW2,
      KVAR    :   data.KVAR2,
      KVA     :   data.KVA2,
      PF      :   data.PF2,
      KWH     : data.KWH,
      timeStamp : time
    }
  }
  const newPhaseTwoData = new PhaseTwo(phaseTwoData)
  newPhaseTwoData.save()
    .then()
    .catch(err => {console.log(err)})
}

/* Save Phase Three Data*/
module.exports.saveData2PhaseThree = (data, time) => {
  var phaseThreeData = {
    device_id: "6094aedf24eeeb0dc4bd41cd",
    nsample: 8,
    samples: {
      VLN     :   data.V3N,
      VLL     :   data.V31,
      I      :   data.I3,
      KW      :   data.KW3,
      KVAR    :   data.KVAR3,
      KVA     :   data.KVA3,
      PF      :   data.PF3,
      timeStamp : time
    }
  }
  const newPhaseThreeData = new PhaseThree(phaseThreeData)
  newPhaseThreeData.save()
    .then()
    .catch(err => {console.log(err)})
}

/* Save Phase Summary Data */
module.exports.saveData2PhaseSummary = (data, time) => {
  var phaseSummaryData = {
    device_id: "6094aedf24eeeb0dc4bd41cd",
    nsample: 8,
    samples: {
      VLN     :   data.VLN,
      VLL     :   data.VLL,
      I      :   data.I,
      KW      :   data.KW0,
      KVAR    :   data.KVAR0,
      KVA     :   data.KVA0,
      PF      :   data.PF0,
      timeStamp : time
    }
  }
  const newPhaseSummaryData = new PhaseSummary(phaseSummaryData)
  newPhaseSummaryData.save()
    .then()
    .catch(err => {console.log(err)})
}

/* Save IO Data */
module.exports.saveIO = (data,time) => {
  var DIData = {
    device_id: "6094aedf24eeeb0dc4bd41cd",
    samples: {
      DI0     :   data.SensorA,
      DI1     :   data.SensorB,
      timeStamp : time
    }
  }
  var DOData = {
    device_id: "6094aedf24eeeb0dc4bd41cd",
    samples: {
      DO0     :   data.RelayA,
      DO1     :   data.RelayB,
      timeStamp : time
    }
  }
  const newDI = new DI(DIData) 
  const newDO = new DO(DOData)
  newDI.save()
    .then()
    .catch(err => {console.log(err)})
  newDO.save()
    .then()
    .catch(err => {console.log(err)})
}

/* Data Table func */
module.exports.findDataById = (id, phase , exec) => {
  if(phase === '0') {
    PhaseSummary.find({device_id: id})
    .then(exec)
    .catch(err => console.log(err))
  }
  else if (phase === '1') {
      PhaseOne.find({device_id: id})
      .then(exec)
      .catch(err => console.log(err))
  }
  else if(phase === '2') {
      PhaseTwo.find({device_id: id})
      .then(exec)
      .catch(err => console.log(err))
  }
  else if(phase === '3') {
      PhaseThree.find({device_id: id})
      .then(exec)
      .catch(err => console.log(err))
  }
}

/* Convert Date To String */
module.exports.date2String = (date) => {
  return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} ${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`
}

/* Phase 1 func */
module.exports.findPhaseOneDataById = async (id, exec) => {
  await PhaseOne.find({device_id: id}, exec)
}
