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


    it("POST查询物业管家用户", function(done){
      request(app)
        .post("/api/sysUserUnit/querySysUser")
        .send({
          appId: 'shanghai'
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body);
          expect(res.body.success).to.be.true;
          expect(res.body.data).to.be.exist;
        })
        .end(done);
    })

    it("提交绑定单元", function(done) {
      request(app)
        .post("/api/sysUserUnit/bind")
        .send({
          sys_user_id: 14,
          unit_ids: [1, 2]
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body);
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

    it("POST查询某个物业管家用户, 确认绑定成功", function(done){
      db.sequelize.model("Units").findAll({
        where: {
          sys_user_id: 14
        }
      })
      .then(function(units) {
        expect(units.length).to.be.equal(2)
        done()
      })
      .catch(function(err) {
        console.error(err);
        done(err)
      })
    })


  });
}
