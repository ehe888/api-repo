"use strict"

let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    path = require("path"),
    config = require(path.join(__dirname, 'config', 'config.' + process.env.NODE_ENV + '.json')),
    Sequelize = require("sequelize"),
    sequelize = new Sequelize(  config.sequelize.database,
                  config.sequelize.username, config.sequelize.password, config.sequelize);

var db = { sequelize: sequelize, Sequelize: Sequelize }
require("kerry-wechat-model")(db);


var app = express();
app.use(cookieParser());
app.use(bodyParser());
app.locals.config = config;

/**
* Global middleware setup config for every request
*/
app.use(function(req, res, next){
   req.x_app_config = app.locals.config;
   return next();
  })

var kerryApp = require("../lib/")(app, "/api", db, {})


require("./Sequelize.test")(db, config.sequelize )
// require("./controllers/SysController.test")(app, db, config);
// require("./controllers/AuthController.test")(app, db, config);
// require("./controllers/RoleController.test")(app, db, config);
// require("./controllers/KerryPropertyController.test")(app, db, config);
// require("./controllers/UserManagerController.test")(app, db, config);
// require("./controllers/SysUserController.test")(app, db, config);
// require("./controllers/UnitController.test")(app, db, config);
// require("./controllers/UserUnitBindController.test")(app, db, config);
// require("./controllers/SysPermissionController.test")(app, db, config);
// require("./controllers/DeliveryController.test")(app, db, config);
// require("./controllers/WechatUserController.test")(app, db, config);
require("./controllers/WechatAssetController.test")(app, db, config)
