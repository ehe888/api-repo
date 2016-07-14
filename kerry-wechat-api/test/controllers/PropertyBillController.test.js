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

    it("上传csv", function(done) {
      var requestData = [
        { field1: '费用类型',
          field2: '账单开始日期',
          field3: '账单结束日期',
          field4: '本期金额',
          field5: '建筑物',
          field6: '单元',
          field7: '租户地址号',
          field8: '租户名称',
          field9: '合同号' },
        { field1: '水费',
          field2: 20160401,
          field3: 20160430,
          field4: 694.6,
          field5: 'A0001',
          field6: '103A',
          field7: 10010549,
          field8: 'XXX',
          field9: 103631 },
        { field1: '电费',
          field2: 20160401,
          field3: 20160430,
          field4: '15,592.00',
          field5: 'A0001',
          field6: '103A',
          field7: 10010549,
          field8: 'XXX',
          field9: 103631 },
        { field1: '电费',
          field2: 20160401,
          field3: 20160430,
          field4: '5,592.00',
          field5: 'A0001',
          field6: '103A',
          field7: 10010549,
          field8: 'XXX',
          field9: 103631 },
        { field1: '管理费',
          field2: 20160601,
          field3: 20160630,
          field4: '3,676.00',
          field5: 'A0001',
          field6: '103A',
          field7: 10010549,
          field8: 'XXX',
          field9: 103631 },
        { field1: '公共部位占用费',
          field2: 20150901,
          field3: 20150930,
          field4: 800,
          field5: 'A0001',
          field6: '103C',
          field7: 10090306,
          field8: 'XXX',
          field9: 115027 },
        { field1: '公共部位占用费',
          field2: 20151001,
          field3: 20151023,
          field4: 645.16,
          field5: 'A0001',
          field6: '103C',
          field7: 10090306,
          field8: 'XXX',
          field9: 115027 }
        ];

        request(app)
          .post("/api/propertyBills/upload")
          .send({
            data: requestData
          })
          .expect(200)
          .expect(function(res){
            var result = res.body
            console.log(res.body)
            expect(result.success).to.be.true
          })
          .end(done);
    })

    it("上传csv, 不存在的单元号, 同步忽略", function(done) {
      var requestData = [
        { field1: '水费',
          field2: 20160401,
          field3: 20160430,
          field4: 694.6,
          field5: 'A0001',
          field6: '103d',
          field7: 10010549,
          field8: 'XXX',
          field9: 103631 }
        ];

        request(app)
          .post("/api/propertyBills/upload")
          .send({
            data: requestData
          })
          .expect(200)
          .expect(function(res){
            var result = res.body
            console.log(res.body)
            expect(result.success).to.be.true
          })
          .end(done);
    })

    it("上传csv, 存在账单, 插入数据到账单行", function(done) {
      var requestData = [
        { field1: 'test',
          field2: 20160401,
          field3: 20160430,
          field4: 694.6,
          field5: 'A0001',
          field6: '103A',
          field7: 10010549,
          field8: 'XXX',
          field9: 103631 }
        ];

        request(app)
          .post("/api/propertyBills/upload")
          .send({
            data: requestData
          })
          .expect(200)
          .expect(function(res){
            var result = res.body
            console.log(res.body)
            expect(result.success).to.be.true
          })
          .end(done);
    })

    it("上传csv, 存在账单行, 更新", function(done) {
      var requestData = [
        { field1: 'test',
          field2: 20160401,
          field3: 20160430,
          field4: 1000,
          field5: 'A0001',
          field6: '103A',
          field7: 10010549,
          field8: 'XXX',
          field9: 103631 }
        ];

        request(app)
          .post("/api/propertyBills/upload")
          .send({
            data: requestData
          })
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