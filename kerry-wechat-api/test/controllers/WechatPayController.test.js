let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken'),
    xml2js = require('xml2js');

module.exports = function(app, db, config){


  describe("API平台系统微信用户", function(){

    it("POST查询微信用户未付款账单", function(done){
      request(app)
        .post("/api/propertyBillLines/queryWechatUnpaid")
        .send({
          year: 2016,
          unit_id: 12,
          wechat_user_id: 'wechat_ossPrw-q064upNxReGsPDqqLsOFQ'
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body);
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

    it("POST准备发起预付单", function(done){
      request(app)
        .post("/api/wechatPays/billLinePay")
        .send({
          billLines: "1,4,6",
          wechat_user_id: "wechat_ossPrw6Uu6gK69mwwyv151LbPgJE"
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body);
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

    it("接受付款结果", function(done) {

      db.sequelize.model("WechatPay").findOne()
      .then(function(pay) {
        var trade_no = pay.trade_no;

        var requestData = {
          return_code: "SUCCESS",
          appId: "123333",
          result_code: "SUCCESS",
          openid: "ossPrw6Uu6gK69mwwyv151LbPgJE",
          out_trade_no: trade_no
        }
        var builder = new xml2js.Builder();
        var xml = builder.buildObject(requestData)
        request(app)
          .post("/api/wechatPays/callback")
          .set('Content-Type', 'text/xml')
          .send(xml)
          .expect(200)
          .expect(function(res) {
            console.log(res.text)
            expect(res.text).to.be.exist;
            var parseString = xml2js.parseString;
            parseString(res.text, function(err, result) {
              expect(err).to.not.exist;
              console.log(result)
            })
          })
          .end(done)
      })
    })


  });
}
