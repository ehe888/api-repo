let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken');

module.exports = function(app, db, config){


  describe("API平台系统创建角色", function(){

    it("POST提交角色名", function(done){
      request(app)
        .post("/api/roles/create_role")
        .send({
          name: 'test'
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
          expect(res.body.sysRole).to.exist;

        })
        .end(done);
    })

  });
}
