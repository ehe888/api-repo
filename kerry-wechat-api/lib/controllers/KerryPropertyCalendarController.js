/**
 * System User Authentication controller
 */
module.exports = function(app, db, options){
  var _ = require("lodash"),
     debug = require('debug')('core-api'),
     express = require('express'),
     util = require('util'),
     path = require('path'),
     env = process.env.NODE_ENV,
     sequelize = db.sequelize,  //The sequelize instance
     Sequelize = db.Sequelize,  //The Sequelize Class via require("sequelize")
     KerryProperty =  sequelize.model("KerryProperty"),
     KerryCalendar =  sequelize.model("KerryCalendar"),
     models = options.db;

  var router = express.Router();

  router.post("/create", (req, res, next) => {
    var param = req.body,
        property_id = param.property_id,
        vacationDate = param.vacationDate,
        desc = param.desc

    KerryCalendar.findOne({
      where: {
        vacationDate: vacationDate,
        property_id: property_id
      }
    })
    .then((calendar) => {
      if (calendar && calendar.id) {
        var error = new Error('已经有相同的日期了!')
        error.status = 400
        throw error
      }
      return KerryCalendar.create({
        property_id: property_id,
        vacationDate: vacationDate,
        desc: desc
      })
    })
    .then((calendar)=> {
      return res.json({
        success: true,
        data: calendar
      })
    })
    .catch((err) => {
      console.error(err)
      var status = err.status || 500
      return res.status(status).json({
        success: false
        ,errMsg: err.message
        ,errors: err
      })
    })
  })

  router.post("/delete", (req, res, next) => {
    var param = req.body,
        calendar_id = param.calendar_id

    sequelize.query('DELETE FROM kerry_calendars WHERE id = ?', {
      replacements: [calendar_id]
    })
    .then(() => {
      return res.json({
        success: true
      })
    })
    .catch((err) => {
      console.error(err)
      var status = err.status || 500
      return res.status(status).json({
        success: false
        ,errMsg: err.message
        ,errors: err
      })
    })
  })

  router.post("/query", (req, res, next) => {
    var param = req.body,
        property_id = param.property_id

    KerryCalendar.findAll({
      where: {
        property_id: property_id
      }
    })
    .then((calendars) => {
      return res.json({
        success: true,
        data: calendars
      })
    })
    .catch((err) => {
      console.error(err)
      var status = err.status || 500
      return res.status(status).json({
        success: false
        ,errMsg: err.message
        ,errors: err
      })
    })
  })

  // 微信端查询当前是否是休息时间
  router.post("/check", (req ,res, next) => {
    var param = req.body,
        appId = param.appId

    KerryProperty.findOne({
      where: {
        appId: appId
      }
    })
    .then((property) => {
      if (!property) {
        var error = new Error('找不到物业!')
        error.status = 400
        throw error
      }
      var now = new Date(),
          nowHour = now.getHours(),
          nowMinute = now.getMinutes()

      var start_time = property.start_time,
          end_time = property.end_time

      if (start_time) {
        var startTime = new Date(start_time)
        var startHour = startTime.getHours()
        var startMinute = startTime.getMinutes()

        if (nowHour < startHour || (nowHour == startHour && nowMinute < startMinute)) {
          return res.json({
            success: true,
            isWorking: false
          })
        }
      }

      if (end_time) {
        var endTime = new Date(end_time)
        var endHour = endTime.getHours(),
            endMinute = endTime.getMinutes()

        if (nowHour > endHour || (nowHour == endHour && nowMinute > endMinute)) {
          return res.json({
            success: true,
            isWorking: false
          })
        }
      }

      // 时间段符合物业工作时间, 查询今天是否是节假日
      KerryCalendar.findOne({
        where: {
          property_id: property.id,
          vacationDate: now
        }
      })
      .then((calendar) =>  {
        if (!calendar) {
          return res.json({
            success: true,
            isWorking: true
          })
        }
        return res.json({
          success: true,
          isWorking: false
        })
      })
      .catch((err) => {
        console.error(err)
        var status = err.status || 500
        return res.status(status).json({
          success: false
          ,errMsg: err.message
          ,errors: err
        })
      })

    })
    .catch((err) => {
      console.error(err)
      var status = err.status || 500
      return res.status(status).json({
        success: false
        ,errMsg: err.message
        ,errors: err
      })
    })
  })

  app.use("/calendar", router);
}
