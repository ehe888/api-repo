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

    it("POST提交账单", function(done){
      var date = new Date();
      request(app)
        .post("/api/propertyBills/create")
        .send({
          year:date.getFullYear(),
          month:date.getMonth(),
          is_push:false,
          unit_id:3,
          property_bill_lines:[{
            description:"11111111111111",
            taxable_amount:100,
            tax:10,
            gross_amount:110,
            is_pay:false,
            expire_date:date,
            active:true
          },{
            description:"2222222222222",
            taxable_amount:200,
            tax:20,
            gross_amount:220,
            is_pay:false,
            expire_date:date,
            active:true
          }]
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body.data);
          expect(res.body.success).to.be.true;
          expect(res.body.data).to.exist;
        })
        .end(done);
    })

    it("POST更新账单", function(done){
      var date = new Date();

      request(app)
        .post("/api/propertyBills/update")
        .send({
          id:6,
          property_bill_lines:[{
            id:2,
            description:"11111111111111",
            taxable_amount:100,
            tax:10,
            gross_amount:110,
            is_pay:false,
            expire_date:date,
            active:true
          },{
            id:3,
            description:"2222222222222",
            taxable_amount:200,
            tax:20,
            gross_amount:220,
            is_pay:false,
            expire_date:date,
            active:true
          },{
            description:"3333333333333333",
            taxable_amount:300,
            tax:30,
            gross_amount:330,
            is_pay:false,
            expire_date:date,
            active:true
          }]
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

    it("POST查询账单", function(done){
      request(app)
        .post("/api/propertyBills/queryPropertyBills")
        .send({
          bill_number:'B'
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body.data);
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })
    //
    // it("POST查询角色-失败", function(done){
    //   request(app)
    //     .post("/api/roles/queryRoles")
    //     .send({
    //       name: '111'
    //     })
    //     .expect(200)
    //     .expect(function(res){
    //       expect(res.body.success).to.be.true;
    //       expect(res.body.data.length).to.below(1);
    //     })
    //     .end(done);
    // })
    //
  });
}
