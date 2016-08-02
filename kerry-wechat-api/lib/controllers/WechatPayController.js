module.exports = function(app, db, options){
  var _ = require("lodash"),
     debug = require('debug')('core-api'),
     express = require('express'),
     util = require('util'),
     path = require('path'),
     jwt = require('jsonwebtoken'),
     sequelize = db.sequelize,  //The sequelize instance
     Sequelize = db.Sequelize,  //The Sequelize Class via require("sequelize")
     fs = require('fs'),
     Payment = require('../wechatPay/payment').Payment,
     Paymentmiddleware = require('../wechatPay/middleware');

  var initConfig = {
   partnerKey: "w4go19um14n73r2v2v3wvderavvscgz0",  //w4go19um14n73r2v2v3wvderavvscgz0  API密钥，嘉里不夜城
   appId: "wx59b13639314be7c8",
   mchId: "1352525102",
   notifyUrl: "http://www.weixin.qq.com/wxpay/pay.php"//,
   //pfx: fs.readFileSync("../../cert/apiclient_cert.p12")
     };
  var payment = new Payment(initConfig);

  models = options.db;

  var router = express.Router();

  //准备付款
  router.post("/billLinePay", function(req, res, next) {
    var param = req.body,
        billLines = param.billLines;

    var billLineIds = [];
    if (billLines) {
      billLineIds = billLines.split(",");
    }
    sequelize.model("PropertyBillLine").findAll({
      where: {
        id: {
          $in: billLineIds
        }
      }
    })
    .then(function(billLines) {
      var totalAmount = parseInt(0);
      for (var i = 0; i < billLines.length; i++) {
        var billLine = billLines[i];
        if (!billLine.is_pay) {
          totalAmount += parseFloat(billLine.gross_amount)
        }
      }

      //TODO: call Wechat Pay
      return res.json({
        success: true,
        data: totalAmount
      })

    })

  })

  router.post("/WechatPay", function(req, res, next) {

    var param = req.body,
        product_name = param.product_name,
        //attach = param.attach,
        out_trade_no = param.out_trade_no,
        total_fee = param.total_fee,
        wechat_user_id = param.wechat_user_id.replace('wechat_', '');

    var order = {
      body: product_name,
      //attach: '{"部位":"三角"}',     //附加数据
      out_trade_no: out_trade_no,   //订单号
      total_fee: total_fee,     //总金额
      spbill_create_ip: "10.0.0.35",  //下单IP"10.0.0.35"
      openid: "oc4kVwVHYTTQhWq7hrc_rgMBSpjI", // "oc4kVwVHYTTQhWq7hrc_rgMBSpjI"
      trade_type: 'JSAPI'
    };

    payment.getBrandWCPayRequestParams(order, function(err, payargs){
    console.log(err);
      console.log(payargs);
      return res.json({
        success: true,
        data:payargs
      })
    });

  })



  app.use("/wechatPays", router);

}
