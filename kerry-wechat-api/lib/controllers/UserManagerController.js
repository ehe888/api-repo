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
      limit: limit
    })
    .then(function(results) {
      var count = results.count;
      return res.json({
        success: true,
        data: results.rows,
        count: count
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
