let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken');

module.exports = function(app, db, config){


  describe("API平台系统账单管理", function(){

    it("POST查询账单", function(done){
      request(app)
        .post("/api/propertyBills/queryPropertyBills")
        .send()
        .expect(200)
        .expect(function(res){
          console.log(res.body.data);
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })



  });
}
