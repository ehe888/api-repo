let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken');


module.exports = function(app, db, config){

  describe("API平台系统快递信息", function(){

    it("后台推送记录查询", function(done){
      request(app)
        .post("/api/pushMessage")
        .send({
          appId: 'shanghai'
        })
        .expect(200)
        .expect(function(res){
          var result = res.body
          console.log(res.body)
          expect(result.success).to.be.true
        })
        .end(done);
    })

    it("后台推送记录查询快递", function(done){
      request(app)
        .post("/api/pushMessage")
        .send({
          appId: 'shanghai',
          template_type: ['delivery']
        })
        .expect(200)
        .expect(function(res){
          var result = res.body
          console.log(res.body.data.length)
          expect(result.success).to.be.true
        })
        .end(done);
    })

    it("后台推送记录查询账单", function(done){
      request(app)
        .post("/api/pushMessage")
        .send({
          appId: 'shanghai',
          template_type: ['bill']
        })
        .expect(200)
        .expect(function(res){
          var result = res.body
          console.log(res.body.data.length)
          expect(result.success).to.be.true
        })
        .end(done);
    })


  })
}
