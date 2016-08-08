let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken');


module.exports = function(app, db, config){

  describe("API平台系统后台菜单权限", function(){

    before(function(done) {
      db.sequelize.model("SysRoleMenu").sync({force: true})
      .then(function() {
        done();
      })
    })

    it("后台菜单查询", function(done){
      request(app)
        .get("/api/sysRoleMenu")
        .expect(200)
        .expect(function(res){
          console.log(res.body);
          expect(res.body).to.be.exist;
        })
        .end(done);
    })

    it("后台菜单创建", function(done){
      request(app)
        .post("/api/sysRoleMenu/addMenu")
        .send({
          "name": "账单管理",
          "icon": "ti-files",
          "link": "/bill",
          "role_id": 7
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body);
          expect(res.body.success).to.be.true
        })
        .end(done);
    })

    it("后台菜单创建2", function(done){
      request(app)
        .post("/api/sysRoleMenu/addMenu")
        .send({
          "name": "自定义菜单",
          "icon": "ti-files",
          "link": "/menusetting",
          "role_id": 7
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body);
          expect(res.body.success).to.be.true
        })
        .end(done);
    })

    it("后台菜单创建, 不能创建相同菜单", function(done){
      request(app)
        .post("/api/sysRoleMenu/addMenu")
        .send({
          "name": "账单管理",
          "icon": "ti-files",
          "link": "/bill",
          "role_id": 7
        })
        .expect(500)
        .expect(function(res){
          console.log(res.body);
          expect(res.body.success).to.not.be.true
        })
        .end(done);
    })

    it("根据角色查询菜单", function(done){
      request(app)
        .post("/api/sysRoleMenu/queryByRole")
        .send({
          "role_id": 1
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body);
          expect(res.body.success).to.be.true
        })
        .end(done);
    })

    it("删除菜单", function(done){
      request(app)
        .post("/api/sysRoleMenu/deleteMenu")
        .send({
          "id": 1
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body);
          expect(res.body.success).to.be.true
        })
        .end(done);
    })

  })
}
