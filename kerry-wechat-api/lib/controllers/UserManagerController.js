module.exports = function(app, db, options){
  var _ = require("lodash"),
     debug = require('debug')('core-api'),
     express = require('express'),
     util = require('util'),
     path = require('path'),
     sequelize = db.sequelize,  //The sequelize instance
     Sequelize = db.Sequelize,  //The Sequelize Class via require("sequelize")
     Users =  sequelize.model("Users");

  var router = express.Router();

  router.post("/query", function(req, res, next) {
    var param = req.body,
        name = param.name || '',
        offset = param.offset || 0,
        limit = param.limit || 20;

    Users.findAndCountAll({
      where: {
        name: {
          $like: '%'+name+'%'
        }
      },
      offset: offset,
      limit: limit,
      include: [{
        model: sequelize.model("UserUnit"),
        as: 'user_unit',
        include: [{
          model: sequelize.model("Units"),
          as: 'unit'
        }]
      }]
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

  router.post('/update', function(req, res, next) {
    var param = req.body,
        expire_date = param.expire_date,
        id = param.id;
    Users.findOne({
      where: {
        id: id
      }
    })
    .then(function(user){

      if (!user) {
        return res.status(404).json({
          success: false,
          errMsg: '用户不存在'
        })
      }else {
        user.update({
          expire_date: expire_date
        })
        .then(function(user) {
          return res.json({
            success: true,
            data: user
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

  router.post('/delete_bind', function(req, res, next) {
    var param = req.body,
        id = param.id;
    Users.destroy({
      where: {
        id: id
      }
    })
    .then(function() {
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



  app.use("/user_settings", router);
}
