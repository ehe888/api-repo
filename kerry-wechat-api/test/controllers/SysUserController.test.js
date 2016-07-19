let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken');


module.exports = function(app, db, config){


  describe("API平台系统后台用户", function(){

    it("POST查询后台用户", function(done){
      request(app)
        .post("/api/sysusers/query")
        .send({
          username: '',
          userType: "CORP",
          appId: 'wxa0c45fc6d9e269ed'
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body);
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

    it("更新用户基本信息", function(done) {
      request(app)
        .post("/api/sysusers/update")
        .send({
          id: 2,
          email: 'aivics@aivics.com'
        })
        .expect(200)
        .expect(function(res) {
          console.log(res.body);
          expect(res.body.success).to.be.true;
          expect(res.body.data.email).to.be.equal("aivics@aivics.com")
        })
        .end(done)
    })

    it("更新用户单元", function(done) {
      request(app)
        .post("/api/sysusers/updateUnits")
        .send({
          sys_user_id: 2,
          unit_id: 2
        })
        .expect(200)
        .expect(function(res) {
          console.log(res.body);
          expect(res.body.success).to.be.true;
        })
        .end(done)
    })

    it("更新用户角色", function(done) {
      request(app)
        .post("/api/sysusers/updateRoles")
        .send({
          sys_user_id: 2,
          role_id: 1
        })
        .expect(200)
        .expect(function(res) {
          console.log(res.body);
          expect(res.body.success).to.be.true;
        })
        .end(done)
    })

    it("删除用户角色", function(done) {
      request(app)
        .post("/api/sysusers/deleteRoles")
        .send({
          sys_user_id: 2,
          role_id: 1
        })
        .expect(200)
        .expect(function(res) {
          console.log(res.body);
          expect(res.body.success).to.be.true;
        })
        .end(done)
    })


  });
}
