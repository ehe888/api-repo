"use strict"

module.exports = [
    {
      name: "ALL",
      httpMethod: "*",
      httpPath: "/^\/.*/"
    },
    {
      name: "创建角色",
      httpMethod: "POST",
      httpPath: "/^\/wxapi\/roles.*/"
    }
]
