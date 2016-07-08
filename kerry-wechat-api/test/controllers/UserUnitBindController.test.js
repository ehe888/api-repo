let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken');

module.exports = function(app, db, config){


  describe("用户绑定单元api", function(){

    before(function(done) {

      var test_data = {
        kerry_user_id: 1,
        unit_id: 1
      }

      db.sequelize.model("KerryUserUnit").create(test_data)
      .then(function(instance){
        expect(instance).to.exist;

        db.sequelize.model("User").createWechatUser("ossPrw6Uu6gK69mwwyv151LbPgJE",
                        "ossPrw6Uu6gK69mwwyv151LbPgJE", "hallohallo", 1, "Shanghai", "Shanghai",
                        "http://wx.qlogo.cn/mmopen/PiajxSqBRaEKw2WtoLPzTUwBulgeCMZ3YlJnlT0h3CzHwOicnb7H73LVTAwFickWWw35rGhJtdvjp25DvgpTZkabg/0"
          ).then(function(instance){
            expect(instance).to.exist;
            done();
          })
          .catch(function(err){
            console.log(err);
          })

      })
      .catch(function(err) {
        done(err);
      })
    })

    it("用户绑定单元成功", function(done){

      request(app)
        .post("/api/bind/bind")
        .send({
          unit_number: '11-503',
          username: '123456',
          reg_code: '5555355',
          mobile: '123457674444',
          appId: 'test',
          wechat_user_id: 'wechat_ossPrw6Uu6gK69mwwyv151LbPgJE'
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body)
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

    it("验证用户绑定成功", function(done) {
      db.sequelize.model("UserUnitBinding").findOne({
        username: '123456',
        unit_id: 1
      })
      .then(function(bind) {
        expect(bind).to.exist;
        expect(bind.username).to.equal('123456');
        expect(bind.unit_id).to.equal(1)
        done();
      })
      .catch(function(err) {
        done(err)
      })
    })

    it("用户注册码错误, 无法绑定", function(done) {
      request(app)
        .post("/api/bind/bind")
        .send({
          username: '123456',
          unit_number: '11-503',
          name: 'test1',
          reg_code: '355',
          mobile: '123457674444'
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.false;
        })
        .end(done);
    })

    it("房屋号错误, 无法绑定", function(done) {
      request(app)
        .post("/api/bind/bind")
        .send({
          username: '123456',
          unit_number: '-503',
          name: 'test1',
          reg_code: '5555355',
          mobile: '123457674444'
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.false;
        })
        .end(done);
    })

    it("用户房屋对应关系错误, 无法绑定", function(done){

      request(app)
        .post("/api/bind/bind")
        .send({
          username: '123456',
          unit_number: '12-503',
          name: 'test1',
          reg_code: '5555355',
          mobile: '123457674444'
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.false;
        })
        .end(done);
    })

    it("查询业主", function(done){

      request(app)
        .post("/api/bind/queryUserUnitBind")
        .send({
          wechat_user_id: 'wechat_ossPrw6Uu6gK69mwwyv151LbPgJE',
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body)
          expect(res.body.success).to.be.true;
          expect(res.body.data).to.exist;
        })
        .end(done);
    })

  })

}
