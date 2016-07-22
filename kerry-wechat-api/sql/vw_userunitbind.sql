select userunitbind.id, unit.unit_number,userunitbind.username,users.wechat_nickname,userunitbind.mobile,kerryproperties.name as kerryproname,
sysusers.first_name ||' ' ||sysusers.last_name as sysusername,kerryproperties.app_id as appid
 from user_unit_bindings userunitbind 
left join users on userunitbind.wechat_user_id =users.username
left join units unit on unit.id =userunitbind.unit_id
left join sys_users sysusers on sysusers."id" =unit.sys_user_id
left JOIN kerry_properties kerryproperties on unit.property_id=kerryproperties.id
where userunitbind.deleted_at is  null