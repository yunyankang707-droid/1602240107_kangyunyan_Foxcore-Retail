import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
const makePassword=()=>`${randomBytes(9).toString('base64url')}Aa1!`;
const salesPassword=process.env.DEMO_SALES_PASSWORD||makePassword(),managerPassword=process.env.DEMO_MANAGER_PASSWORD||makePassword();
if(!url||!key) throw new Error('请配置 Supabase URL 和服务端 Secret Key');
const client=createClient(url,key,{auth:{persistSession:false}});
for(const u of [{email:'sales.demo@foxcore.local',password:salesPassword},{email:'manager.demo@foxcore.local',password:managerPassword}]){
  const {data:{users},error:listError}=await client.auth.admin.listUsers(); if(listError) throw listError;
  const existing=users.find(x=>x.email===u.email);
  const {error}=existing?await client.auth.admin.updateUserById(existing.id,{password:u.password,email_confirm:true}):await client.auth.admin.createUser({...u,email_confirm:true});
  if(error) throw error; console.log(`已就绪：${u.email}`);
}
await writeFile('DEMO_ACCOUNTS.txt',`Foxcore Retail 演示账号\n\n销售顾问\n账号：sales.demo@foxcore.local\n密码：${salesPassword}\n\n管理者\n账号：manager.demo@foxcore.local\n密码：${managerPassword}\n`,'utf8');
console.log('演示账号密码已安全写入本地 DEMO_ACCOUNTS.txt（该文件不会提交到 Git）');
