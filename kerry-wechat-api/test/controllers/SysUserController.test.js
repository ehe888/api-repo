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

    before(function(done) {
      db.sequelize.model("SysUser").update({
        deleted_at: null
      }, {
        where: {
          deleted_at: {
            $not: null
          }
        }
      })
      .then(function() {
        done();
      })
      .catch(function(err) {
        console.log(err)
        done(err)
      })
    })

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
          id: 3,
          email: 'aivics123456@aivics.com'
        })
        .expect(200)
        .expect(function(res) {
          console.log(res.body);
          expect(res.body.success).to.be.true;
          expect(res.body.data.email).to.be.equal("aivics123456@aivics.com")
        })
        .end(done)
    })

    it("更新用户角色", function(done) {
      request(app)
        .post("/api/sysusers/updateRoles")
        .send({
          sys_user_id: 3,
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
          sys_user_id: 3,
          role_id: 1
        })
        .expect(200)
        .expect(function(res) {
          console.log(res.body);
          expect(res.body.success).to.be.true;
        })
        .end(done)
    })

    it("关闭用户", function(done) {
      request(app)
        .post("/api/sysusers/active")
        .send({
          sys_user_id: 3,
          active: false
        })
        .expect(200)
        .expect(function(res) {
          console.log(res.body);
          expect(res.body.success).to.be.true;
        })
        .end(done)
    })

    it("关闭的用户无法登陆", function(done) {
      request(app)
        .post("/api/auth/login")
        .send({
          username: "property",
          password: "123456"
        })
        .expect(403)
        .expect(function(res){
          expect(res.body.success).to.be.false;
        })
        .end(done);
    })

    it("激活用户", function(done) {
      request(app)
        .post("/api/sysusers/active")
        .send({
          sys_user_id: 3,
          active: true
        })
        .expect(200)
        .expect(function(res) {
          console.log(res.body);
          expect(res.body.success).to.be.true;
        })
        .end(done)
    })

    it("激活的用户可以登陆", function(done) {
      request(app)
        .post("/api/auth/login")
        .send({
          username: "property",
          password: "123456"
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body)
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

    var id;
    it("新建用户", function(done) {
      request(app)
        .post("/api/sysusers/create")
        .send({
          username: "now",
          password: "123456",
          email:"jiajun.wang@aivics.com",
          mobile: "13454567654",
          firstName: "wang",
          lastName: "JJ",
          userType: "CORP"
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body)
          expect(res.body.success).to.be.true;
          id = res.body.data.id
        })
        .end(done);
    })

    it("删除用户", function(done) {
      request(app)
        .post("/api/sysusers/delete")
        .send({
          id: id
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body)
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })


  });
}
