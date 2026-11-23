import { createClient } from '@supabase/supabase-js';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
const salesPassword=process.env.DEMO_SALES_PASSWORD,managerPassword=process.env.DEMO_MANAGER_PASSWORD;
if(!url||!key||!salesPassword||!managerPassword) throw new Error('请配置 Supabase URL、service role key 和两个 DEMO_*_PASSWORD 环境变量');
const client=createClient(url,key,{auth:{persistSession:false}});
for(const u of [{email:'sales.demo@foxcore.local',password:salesPassword},{email:'manager.demo@foxcore.local',password:managerPassword}]){
  const {data:{users},error:listError}=await client.auth.admin.listUsers(); if(listError) throw listError;
  const existing=users.find(x=>x.email===u.email);
  const {error}=existing?await client.auth.admin.updateUserById(existing.id,{password:u.password,email_confirm:true}):await client.auth.admin.createUser({...u,email_confirm:true});
  if(error) throw error; console.log(`已就绪：${u.email}`);
}
