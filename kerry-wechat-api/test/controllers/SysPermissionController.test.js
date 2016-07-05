let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken');


module.exports = function(app, db, config){

  describe("API平台系统后台权限", function(){

    it("后台权限查询", function(done){
      request(app)
        .get("/api/permissions")
        .expect(200)
        .expect(function(res){
          console.log(res.body);
        })
        .end(done);
    })

  })
}
