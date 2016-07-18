/**
 * System User Authentication controller
 */
module.exports = function(app, db, options){
  var _ = require("lodash"),
     debug = require('debug')('core-api'),
     express = require('express'),
     util = require('util'),
     path = require('path'),
     sequelize = db.sequelize,  //The sequelize instance
     Sequelize = db.Sequelize,  //The Sequelize Class via require("sequelize")
     KerryProperty =  sequelize.model("KerryProperty"),
     models = options.db;

  var router = express.Router();


  //创建物业
  router.post("/create", function(req, res, next) {
    var param = req.body;
    var name = param.name,
        app_id = param.appId,
        telephone = param.telephone,
        province = param.province,
        city = param.city,
        street = param.street,
        start_time = param.start_time,
        end_time = param.end_time,
        zipcode = param.zipcode,
        isjde = param.isjde


    KerryProperty.create({
      name: name,
      appId: app_id,
      telephone: telephone,
      province: province,
      city: city,
      street: street,
      start_time: start_time,
      end_time: end_time,
      zipcode: zipcode,
      isjde: isjde
    })
    .then(function(property) {
      return res.json({
        success: true,
        data: property
      });
    })
    .catch(function(err) {
      console.log(err)
      return res.status(500).json({
        success: false
        ,errMsg: err.message
        ,errors: err
      })
    })
  })

  //修改物业
  router.post("/update", function(req, res, next) {
    var param = req.body;
    var id = param.id,
        name = param.name,
        app_id = param.appId,
        telephone = param.telephone,
        province = param.province,
        city = param.city,
        street = param.street,
        start_time = param.start_time,
        end_time = param.end_time,
        zipcode = param.zipcode,
        isjde = param.isjde


    KerryProperty.findOne({
      where: {
        id: id
      }
    })
    .then(function(property) {
      if (property) {
        property.update({
          name: name,
          appId: app_id,
          telephone: telephone,
          province: province,
          city: city,
          street: street,
          start_time: start_time,
          end_time: end_time,
          zipcode: zipcode,
          isjde: isjde
        })
        .then(function(property) {
          return res.json({
            success: true,
            data: property
          })
        })
        .catch(function(err) {
          console.error(err)
          return res.status(500).json({
            success: false
            ,errMsg: err.message
            ,errors: err
          })
        })
      }
      else {
        return res.status(404).json({
          success: false
          ,errMsg: '找不到该物业'
        })
      }
    })
    .catch(function(err) {
      console.error(err)
      return res.status(500).json({
        success: false
        ,errMsg: err.message
        ,errors: err
      })
    })
  })

  router.post('/delete', function(req, res, next) {
    var id = req.body.id;
    KerryProperty.destroy({
      where: {
        id: id
      }
    })
    .then(function(affectedRows) {
      return res.json({
        success: true,
        affectedRows: affectedRows
      })
    })
    .catch(function(err) {
      console.error(err)
      return res.status(500).json({
        success: false
        ,errMsg: err.message
        ,errors: err
      })
    })
  })

  router.post('/query', function(req, res, next) {
    var name = req.body.name || '';
    KerryProperty
    .findAll({
      where: {
        name: {
          $like: '%'+name+'%'
        }
      }
    })
    .then(function(properties) {
      return res.json({
        success: true,
        data: properties
      })
    })
    .catch(function(err) {
      console.error(err)
      return res.status(500).json({
        success: false
        ,errMsg: err.message
        ,errors: err
      })
    })
  })



  app.use("/properties", router);
}
