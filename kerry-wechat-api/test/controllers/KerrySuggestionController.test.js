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

    // before(function(done) {
    //   db.sequelize.model("KerrySuggestion").sync({force: true}).then(function() {
    //     done();
    //   })
    // })

    it("POST提交意见", function(done){
      request(app)
        .post("/api/suggestions/create")
        .send({
          wechat_user_id: 'wechat_wx_asfasdfasdfasdfasdfasdf',
          content: 'test3'
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
          expect(res.body.data).to.exist;

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
          wechat_user_id: 'wechat_wx_asfasdfasdfasdfasdfasdf'
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


  });
}
