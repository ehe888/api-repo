let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken');

module.exports = function(app, db, config){


  describe("API平台系统微信用户", function(){

    // before(function(done) {
    //
    //   db.sequelize.model("Units").create({
    //     unit_number:'11#102',
    //     active:1,
    //     property_id:1
    //   })
    //   .then(function(unit){
    //     db.sequelize.model("WechatUsers").create({
    //       username:'ceshiyongli1',
    //       password:'123456'
    //     })
    //     .then(function(user){
    //       db.sequelize.model("UserUnitBinding").create({
    //         username:'ceshiyongli1',
    //         mobile:'18661198949',
    //         unit_id:unit.id,
    //         wechat_user_id:user.username
    //       })
    //       .then(function(binding){
    //         expect(binding).to.exist;
    //         done()
    //       })
    //       .catch(function(err){
    //         done(err);
    //       })
    //     })
    //   })
    //   .catch(function(err) {
    //     done(err);
    //   })
    // })


    it("POST查询微信用户", function(done){
      request(app)
        .post("/api/wechatUsers/queryWechatUsers")
        .send({
          username: '',
          offset:0,
          limit:20,
          appId: 'wxa0c45fc6d9e269ed'
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body);
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

    it("POST删除微信用户", function(done){
      request(app)
        .get("/api/wechatUsers/delete?id=1")
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

    it("微信用户判断是否解除绑定", function(done){
      request(app)
        .post("/api/wechatUsers/checkExpire")
        .send({
          wechat_user_id: "wechat_ossPrw6Uu6gK69mwwyv151LbPgJE"
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;

        })
        .end(done);
    })

  });
}
