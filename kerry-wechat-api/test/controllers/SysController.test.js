let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken');

module.exports = function(app, db, config){

  describe("系统底层相关API", function(){
    before(function(done){
      db.sequelize.sync({ force: true })
        .then(function(){
          console.log("Kerry model synced!");
          done()
        })
        .catch(function(err){
          console.log("Kerry Model sync error:", err);
          throw err;
        });
    });

    it("POST初始化init方法", function(done){
      request(app)
        .post("/api/system/init")
        .expect(200)
        .expect(function(res){
          console.log(res.body);
          expect(res.body.success).to.be.true;
          expect(res.body.data.username).to.exist;
          expect(res.body.data.password).to.exist;
        })
        .end(done);
    })

  });
}
