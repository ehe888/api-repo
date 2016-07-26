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

        })
        .end(done);
    })


    it("查询意见", function(done) {
      request(app)
        .post("/api/suggestions/query")
        .send({
          content: ''
        })
        .expect(200)
        .expect(function(res) {
          console.log(res.body)
          expect(res.body.success).to.be.true;
          expect(res.body.data.length).to.be.above(0);
        })
        .end(done);
    })

  });
}
