let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken');

module.exports = function(app, db, config){


  describe("API平台系统角色管理", function(){

    it("POST提交角色名", function(done){
      request(app)
        .post("/api/roles/create")
        .send({
          name: 'test1111'
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
          expect(res.body.sysRole).to.exist;

        })
        .end(done);
    })

    it("POST更新角色", function(done){
      request(app)
        .post("/api/roles/update")
        .send({
          id:2,
          name: 'updateTest'
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
          expect(res.body.sysRole.name).to.equal("updateTest");
        })
        .end(done);
    })

    it("POST查询角色", function(done){
      request(app)
        .post("/api/roles/queryRoles")
        .send({
          name: 'update'
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body.data);
          expect(res.body.success).to.be.true;
          expect(res.body.data[0].name).to.equal("updateTest");
        })
        .end(done);
    })

    it("POST查询角色-失败", function(done){
      request(app)
        .post("/api/roles/queryRoles")
        .send({
          name: '111'
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
          expect(res.body.data.length).to.below(1);
        })
        .end(done);
    })

    it("PGET删除角色", function(done){
      request(app)
        .get("/api/roles/delete?id=2")
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
          expect(res.body.rows).to.above(0);
        })
        .end(done);
    })
  });
}
