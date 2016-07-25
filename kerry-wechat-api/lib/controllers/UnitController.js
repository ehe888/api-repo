module.exports = function(app, db, options){
  var _ = require("lodash"),
     debug = require('debug')('core-api'),
     express = require('express'),
     util = require('util'),
     path = require('path'),
     sequelize = db.sequelize,  //The sequelize instance
     Sequelize = db.Sequelize,  //The Sequelize Class via require("sequelize")
     Units =  sequelize.model("Units");

  var router = express.Router();

  router.post("/create", function(req, res, next) {
    var param = req.body,
        unit_number = param.unit_number,
        sys_user_id = param.sys_user_id,
        property_id = param.property_id;
    Units.create({
      unit_number: unit_number,
      sys_user_id: sys_user_id,
      property_id: property_id
    })
    .then(function(unit) {
      return res.json({
        success: true,
        data: unit
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

  router.post("/query", function(req, res, next) {
    var param = req.body,
        unit_number = param.unit_number || '',
        offset = param.offset || 0,
        limit = param.limit || 20,
        appId = param.appId;

    var propertyOption = {};
    if (appId && appId.length > 0) {
      propertyOption.appId = appId;
    }

    var unitOption = {
      unit_number: {
        $like: '%'+unit_number+'%'
      }
    };
    // if (req.units) {
    //   unitOption.id = {
    //     $in: req.units
    //   }
    // }
    console.log(unitOption)

    Units.findAndCountAll({
      where: unitOption,
      include: [{
        model: sequelize.model("SysUser"),
        as: 'sys_user',
      }, {
        model: sequelize.model("KerryProperty"),
        as: 'property',
        where: propertyOption
      }],
      order: 'id desc',
      offset: offset,
      limit: limit
    })
    .then(function(results) {
      var count = results.count;
      return res.json({
        success: true,
        data: results.rows,
        count: count,
        offset: offset,
        limit: limit
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

  router.post("/query_all", function(req, res, next) {
    var param = req.body,
        unit_number = param.unit_number;
    Units.findAll({
      attributes:['id', 'unit_number'],
      where: {
        unit_number: {
          $like: '%'+unit_number+'%'
        }
      }
    })
    .then(function(units) {
      return res.json({
        success: true,
        data: units
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

  router.post("/delete", function(req, res, next) {
    var param = req.body,
        id = param.id;

    Units.findOne({
      where: {
        id: id
      }
    })
    .then(function(unit) {
      var now = new Date();
      var unit_number = unit.unit_number+"__"+now.getTime();
      unit.update({
        unit_number: unit_number
      })
      .then(function() {
        unit.destroy().then(function() {
          return res.json({
            success: true
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
      .catch(function(err) {
        console.error(err)
        return res.status(500).json({
          success: false
          ,errMsg: err.message
          ,errors: err
        })
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

  router.post("/update", function(req, res, next) {
    var param = req.body,
        id = param.id,
        sys_user_id = param.sys_user_id,
        unit_number = param.unit_number;

    Units.findOne({
      where: {
        id: id
      }
    })
    .then(function(unit) {
      if (!unit) {
        return res.json({
          success: false,
          errMsg: '找不到户号'
        })
      }else {
        unit.update({
          unit_number: unit_number,
          sys_user_id: sys_user_id
        })
        .then(function(instance) {
          return res.json({
            success: true,
            data: instance
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


  app.use("/units", router);
}
