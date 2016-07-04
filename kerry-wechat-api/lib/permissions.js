"use strict"

module.exports = [
    {
      name: "ALL",
      httpMethod: /^(get|post|put|delete|option)$/ig,
      httpPath: /^\/.*/
    },
    {
      name: "创建角色",
      httpMethod: /^(post)$/ig,
      httpPath: /^\/wxapi\/roles.*/
    }
]
