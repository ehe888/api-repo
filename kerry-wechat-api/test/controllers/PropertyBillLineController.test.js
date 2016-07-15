let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken');

module.exports = function(app, db, config){


  describe("API平台系统账单行管理", function(){

    it("POST提交账单行", function(done){
      var date = new Date();
      request(app)
        .post("/api/propertyBillLines/create")
        .send({
            description:"11111111111111",
            taxable_amount:100,
            tax:10,
            gross_amount:110,
            is_pay:false,
            expire_date:date,
            active:true
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body.data);
          expect(res.body.success).to.be.true;
          expect(res.body.data).to.exist;
        })
        .end(done);
    })

    it("POST更新账单行", function(done){
      var date = new Date();

      request(app)
        .post("/api/propertyBillLines/update")
        .send({
            id:2,
            description:"11111111111111",
            taxable_amount:100,
            tax:10,
            gross_amount:110,
            is_pay:false,
            expire_date:date,
            active:true
          })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })
  });
}
