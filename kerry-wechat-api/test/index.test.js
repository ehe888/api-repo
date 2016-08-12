"use strict"

let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
    xmlparser = require('express-xml-bodyparser'),
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
app.use(xmlparser({ explicitArray: false }));
app.locals.config = config;

/**
* Global middleware setup config for every request
*/
app.use(function(req, res, next){
   req.x_app_config = app.locals.config;
   req.identity = { sub: 'property',
                    roles: [ '小区物业' ],
                    ut: 'PROPERTY',
                    iat: 1469182996,
                    exp: 1469254996 };
   req.headers['authorization'] = 'Bearer aaaaaa';
   return next();
  })

var kerryApp = require("../lib/")(app, "/api", db, {})

// require("./Sequelize.test")(db, config.sequelize )
// require("./controllers/SysController.test")(app, db, config);

// require("./controllers/RoleController.test")(app, db, config);
// require("./controllers/KerryPropertyController.test")(app, db, config);
// require("./controllers/UserManagerController.test")(app, db, config);
// require("./controllers/UnitController.test")(app, db, config);
// require("./controllers/SysUserController.test")(app, db, config);

// require("./controllers/UserUnitBindController.test")(app, db, config);
// require("./controllers/SysPermissionController.test")(app, db, config);
// require("./controllers/DeliveryController.test")(app, db, config);
// require("./controllers/WechatUserController.test")(app, db, config);
// require("./controllers/WechatAssetController.test")(app, db, config)
require("./controllers/PropertyBillController.test")(app, db, config);
// require("./controllers/PropertyBillLineController.test")(app, db, config);
// require("./controllers/permissions.test")(app, db, config)
// require("./controllers/PushBill.test")(app, db, config)
// require("./controllers/Debug.test")(app, db, config);
//require("./controllers/BillboardController.test")(app, db, config);
// require("./controllers/PushMessageController.test")(app, db, config)
// require("./controllers/KerrySuggestionController.test")(app, db, config)
 // require("./controllers/WechatPayController.test")(app, db, config)
 // require("./controllers/UpdateBillLine.test")(app, db, config)
 // require("./controllers/WechatNewsController.test")(app, db, config)
// require("./controllers/SysRoleMenuController.test")(app, db, config)
// require("./controllers/AuthController.test")(app, db, config);
