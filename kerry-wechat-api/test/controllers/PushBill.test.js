let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken');

module.exports = function(app, db, config){


  describe("API平台推送账单", function(){

    it("推送bill", function(done) {
      var requestData = {
        bill_id: 62,
        appId: 'wxa0c45fc6d9e269ed'
      }

      request(app)
        .post("/api/propertyBills/pushMessage")
        .send(requestData)
        .expect(200)
        .expect(function(res){
          var result = res.body
          console.log(res.body)
          expect(result.success).to.be.true
        })
        .end(done);
    })

    it("推送所有未付款bill", function(done) {
      var requestData = {
        appId: 'wxa0c45fc6d9e269ed'
      }

      request(app)
        .post("/api/propertyBills/pushMessageAll")
        .send(requestData)
        .expect(200)
        .expect(function(res){
          var result = res.body
          console.log(res.body)
          expect(result.success).to.be.true
        })
        .end(done);
    })

  });
}
