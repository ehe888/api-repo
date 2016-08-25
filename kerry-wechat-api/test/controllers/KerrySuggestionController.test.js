let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken');

module.exports = function(app, db, config){


  describe("API平台意见反馈", function(){

    before(function(done) {
      db.sequelize.model("KerrySuggestion").sync({force: false})
      .then(function() {
        return db.sequelize.model("KerrySuggestionReply").sync({force: false})
      })
      .then(function() {
        return db.sequelize.query("DELETE FROM kerry_suggestion_replies")
      })
      .then(function() {
        return db.sequelize.query("DELETE FROM kerry_suggestions")
      })
      .then(function() {
        done();
      })
    })

    var id;
    it("POST提交意见", function(done){
      request(app)
        .post("/api/suggestions/create")
        .send({
          wechat_user_id: 'wechat_ossPrw6Uu6gK69mwwyv151LbPgJE',
          content: 'test3'
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
          expect(res.body.data).to.exist;
          id = res.body.data.id
        })
        .end(done);
    })


    it("查询意见", function(done) {
      request(app)
        .post("/api/suggestions/query")
        .send({
          content: '',
          appId:'shanghai'
        })
        .expect(200)
        .expect(function(res) {
          console.log(res.body)
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

    it("微信用户查询意见", function(done) {
      request(app)
        .post("/api/suggestions/queryByWechatUser")
        .send({
          wechat_user_id: 'wechat_ossPrw6Uu6gK69mwwyv151LbPgJE'
        })
        .expect(200)
        .expect(function(res) {
          console.log(res.body)
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

    it("视图查询意见", function(done) {
      request(app)
        .post("/api/suggestions/queryByView")
        .send({
          appId:'shanghai'
        })
        .expect(200)
        .expect(function(res) {
          expect(res.body.success).to.be.true;
          console.log(res.body.data)
        })
        .end(done);
    })

    it("查询未回复的反馈数量", function(done) {
      request(app)
        .post("/api/suggestions/queryUnreplyCount")
        .send({
          appId:'shanghai'
        })
        .expect(200)
        .expect(function(res) {
          expect(res.body.success).to.be.true;
          console.log(res.body.data)
        })
        .end(done);
    })

    it("提交回复", function(done) {
      request(app)
        .post("/api/suggestions/reply")
        .send({
          content: 'lalalalalal',
          sys_user_id: 1,
          suggestion_id: id,
          appId: 'shanghai'
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).to.be.true;
          console.log(res.body.data)
        })
        .end(done)
    })

    it("查询回复", function(done) {
      request(app)
        .post("/api/suggestions/queryReply")
        .send({
          suggestion_id: 31
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).to.be.true;
          console.log(res.body.data)
        })
        .end(done)
    })

    it("微信用户查询意见, 带有回复内容", function(done) {
      request(app)
        .post("/api/suggestions/queryByWechatUser")
        .send({
          wechat_user_id: 'wechat_ossPrw6Uu6gK69mwwyv151LbPgJE'
        })
        .expect(200)
        .expect(function(res) {
          console.log(res.body.data)
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

    it("提交回复2", function(done) {
      request(app)
        .post("/api/suggestions/reply")
        .send({
          content: 'lalalalalalaaa',
          sys_user_id: 1,
          suggestion_id: id,
          appId: 'shanghai'
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).to.be.true;
          console.log(res.body.data)
        })
        .end(done)
    })

  });
}
