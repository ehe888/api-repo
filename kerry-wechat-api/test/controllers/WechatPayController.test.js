let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken');

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
          billLines: "1,4,6"
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body);
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })


    it("POST查询微信用户", function(done){
      request(app)
        .post("/api/wechatPays/WechatPay")
        .send({
          product_name: '鸡腿饭',
          out_trade_no:'20160802120900001',
          total_fee:1,
          wechat_user_id: 'oc4kVwVHYTTQhWq7hrc_rgMBSpjI'
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body);
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })



  });
}
