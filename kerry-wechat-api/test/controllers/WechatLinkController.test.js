let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken'),
    xml2js = require('xml2js');

module.exports = function(app, db, config){

  var sequelize = db.sequelize

  describe("API修改微信链接配置", function(){

    var property_name = "测试微信链接"

    before((done) => {
      sequelize.model("KerryProperty").sync({force: false})
      .then(()=> {
        return sequelize.query("DELETE FROM kerry_properties where name = ?", {replacements: [property_name]})
      })
      .then(() => {
        return sequelize.model("WechatLink").sync({force: false})
      })
      .then(() => {
        return sequelize.query("DELETE FROM  wechat_links")
      })
      .then(() => {
        done()
      })
      .catch((error) => {
        console.error(error)
        done(error)
      })
    })

    var now = (new Date()).getTime()
    var appId = now+""
    it("创建物业时, 创建wechat link model成功", (done) => {
      var property_id

      request(app)
        .post("/api/properties/create")
        .send({
          name: property_name,
          appId: appId,
          telephone: now+"",
          province: 'test',
          city: 'test',
          street: 'tes2t',
          start_time: (new Date()),
          end_time: (new Date()),
          zipcode: 'test',
          isjde: false,
          bill_sync_date: 5
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).to.be.true
          expect(res.body.data).to.exist
          property_id = res.body.data.id

          expect(property_id).to.be.exist
        })
        .end(done)
    })

    var id
    it("查询微信链接配置", (done) => {
      request(app)
        .post("/api/wechatLink/query")
        .send({
          appId: appId
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).to.be.true
          expect(res.body.data).to.exist
          id = res.body.data[0].id
          expect(id).to.be.exist
        })
        .end(done)
    })

    it("更新微信链接配置", (done) => {
      request(app)
        .post("/api/wechatLink/update")
        .send({
          id: id,
          is_open: false
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).to.be.true
        })
        .end(done)
    })

    it("根据link 查询", (done) => {
      request(app)
        .post("/api/wechatLink/check")
        .send({
          appId: appId,
          link: '/wechat/my_bind'
        })
        .expect(200)
        .expect((res) => {
          console.log(res.body)
          expect(res.body.success).to.be.true
        })
        .end(done)
    })

  })
}
