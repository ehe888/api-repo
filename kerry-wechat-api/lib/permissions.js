"use strict"

module.exports = [
    {
      name: "ALL",
      httpMethod: "*",
      httpPath: "^\/.*"
    },
    {
      name: "创建户号",
      httpMethod: "POST",
      httpPath: "^\/api\/units(\/create|\/update)"
    },
    {
      name: "查询户号",
      httpMethod: "POST",
      httpPath: "^\/api\/units(\/query|\/query_all)"
    },
    {
      name: "物流操作",
      httpMethod: "POST",
      httpPath: "^\/api\/delivery.*"
    },
    {
      name: "账单查询",
      httpMethod: "POST",
      httpPath: "^\/api(\/propertyBills\/queryPropertyBills|\/propertyBills\/queryUserBills)"
    },
    {
      name: "账单创建",
      httpMethod: "POST",
      httpPath: "^\/api(\/propertyBills.*|\/propertyBillLines.*)"
    },
    {
      name: "业主操作",
      httpMethod: "POST",
      httpPath: "^\/api\/user_settings.*"
    },
    {
      name: "微信用户操作",
      httpMethod: "POST",
      httpPath: "^\/api\/wechatUsers.*"
    },
    {
      name: "微信菜单与消息操作",
      httpMethod: "POST",
      httpPath: "^(\/api\/wechatAssets.*|\/wxapi.*)"
    },
    {
      name: "个人中心",
      httpMethod: "POST",
      httpPath: "^\/api(\/auth.*|\/sysusers\/deleteUnit|\/sysusers\/updateUnits)"
    }

]
