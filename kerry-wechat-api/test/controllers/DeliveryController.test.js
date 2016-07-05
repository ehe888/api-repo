let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken');


module.exports = function(app, db, config){

  describe("API平台系统快递信息", function(){

    before(function(done) {
      var data = {
        first: '欢迎',
        keyword1: '',
        keyword2: '',
        remark: '如有疑问，请联系物业服务中心，联系电话：023-88888888'
      }

      db.sequelize.model("Template").create({
        template_id: 'hQ-C8MM6ID4jXonE5Ul5BMn-dDmhhOcJ_TEiUfVhUZQ',
        template_type: 'delivery',
        data: JSON.stringify(data)
      })
      .then(function(instance) {

        db.sequelize.model("PushMessageLog").create({
          openid: '123456',
          template_id: 1,
          content: 'aaaaa',
          template_type: 'delivery',
          order_number: '123',
          unit_id: 1
        })
        .then(function(instance) {
          expect(instance).to.exist;
          done();
        })
        .catch(function(err) {
          done(err);
        })

      })
      .catch(function(err) {
        done(err);
      })
    })

    it("后台快递推送记录查询", function(done){
      request(app)
        .post("/api/delivery")
        .expect(200)
        .expect(function(res){
          var result = res.body
          expect(result.success).to.be.true
        })
        .end(done);
    })

  })
}
