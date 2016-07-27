let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken');

module.exports = function(app, db, config){

  describe("API平台系统创建公告", function(){

    before(function(done) {
      db.sequelize.model("KerryProperty").findOne({
        where: {
          app_id: 'shanghai'
        }
      })
      .then(function(property) {
        expect(property).to.exist;
        db.sequelize.model("KerryBillboard").sync({force: true})
        .then(function() {
          console.log("KerryBillboard sync success!!")
          done();
        })
        .catch(function(error) {
          console.error('KerryBillboard sync error: ' , error);
          done(error)
        })

      })
      .catch(function(error) {
        console.error("find property error: ", error);
        done(error)
      })
    })

    it("提交创建公告成功", function(done){
      request(app)
        .post("/api/billboards/create")
        .send({
          title: 'test',
          description: 'test billboards',
          img_url: '',
          content: 'test billboards',
          url: 'http://',
          appId: 'shanghai'
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
          expect(res.body.data).to.exist;

        })
        .end(done);
    })

    it("提交创建公告, 输入不存在的appId, 创建失败", function(done){
      request(app)
        .post("/api/billboards/create")
        .send({
          title: 'test',
          description: 'test billboards',
          img_url: '',
          content: 'test billboards',
          appId: 'shanghai111'
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.false;
        })
        .end(done);
    })

    it("提交发布公告", function(done){
      request(app)
        .post("/api/billboards/updateStatus")
        .send({
          id: 1,
          status: 5
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
          expect(res.body.data).to.exist;
        })
        .end(done);
    })

    it("后端查询公告", function(done){
      request(app)
        .post("/api/billboards/query")
        .send({
          appId: 'shanghai'
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
          expect(res.body.data).to.exist;
          expect(res.body.count).to.equal(1);
        })
        .end(done);
    })

    it("微信端查询公告", function(done){
      request(app)
        .post("/api/billboards/queryByWechat")
        .send({
          wechat_user_id: "wechat_ossPrw6Uu6gK69mwwyv151LbPgJE"
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
          expect(res.body.data).to.exist;
          expect(res.body.count).to.equal(1);
        })
        .end(done);
    })

    it("删除公告", function(done){
      request(app)
        .post("/api/billboards/delete")
        .send({
          id: 1
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;

        })
        .end(done);
    })

  })
}
