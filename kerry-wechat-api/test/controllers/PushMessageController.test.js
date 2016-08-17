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

    it("获取模板", function(done) {
      request(app)
        .post("/api/pushMessage/getTemplate")
        .send({
          appId: 'wxa0c45fc6d9e269ed',
          template_type: 'delivery'
        })
        .expect(200)
        .expect(function(res) {
          console.log(res.body)
          expect(res.body.success).to.be.true
          expect(res.body.data).to.be.exist;
        })
        .end(done);
    })

    it("获取更新模板成功", function(done) {
      var newData = {
        "first":"欢迎","keyword1":"","keyword2":"","remark":"123456"
      };

      request(app)
        .post("/api/pushMessage/updateTemplate")
        .send({
          appId: 'wxa0c45fc6d9e269ed',
          template_type: 'delivery',
          data: JSON.stringify(newData)
        })
        .expect(200)
        .expect(function(res) {
          console.log(res.body)
          expect(res.body.success).to.be.true
          expect(res.body.data).to.be.exist;
          var content = res.body.data.data;
          var contentObj = JSON.parse(content);
          expect(contentObj.remark).to.be.equal("123456")
        })
        .end(done);
    })

    it("获取所有模板", function(done) {
      request(app)
        .post("/api/pushMessage/queryTemplatesByProperty")
        .send({
          appId: 'wxa0c45fc6d9e269ed'
        })
        .expect(200)
        .expect(function(res) {
          console.log(res.body)
          expect(res.body.success).to.be.true
          expect(res.body.data).to.be.exist;
        })
        .end(done);
    })

    it("新建模板成功", function(done) {
      request(app)
        .post("/api/pushMessage/updateTemplatesByProperty")
        .send({
          appId: 'shanghai',
          deliveryId: '123456',
          billId: '54321',
          replyId: '123333'
        })
        .expect(200)
        .expect(function(res) {
          console.log(res.body)
          expect(res.body.success).to.be.true
        })
        .end(done);
    })

    it("新建模板失败", function(done) {
      request(app)
        .post("/api/pushMessage/updateTemplatesByProperty")
        .send({
          appId: 'shanghai',
          deliveryId: '123456'
        })
        .expect(400)
        .expect(function(res) {
          console.log(res.body)
          expect(res.body.success).to.be.false
        })
        .end(done);
    })

    it("更新模板成功", function(done) {
      request(app)
        .post("/api/pushMessage/updateTemplatesByProperty")
        .send({
          appId: 'shanghai',
          deliveryId: '123456',
          billId: '54321000000',
          replyId: '2222222'
        })
        .expect(200)
        .expect(function(res) {
          console.log(res.body)
          expect(res.body.success).to.be.true
        })
        .end(done);
    })


  })
}
