# Foxcore Retail 销售管理系统

这是《系统分析与设计》课程大作业的可运行实现。系统严格对应需求文档中的 UC01 录入销售和 UC02 查询销售统计，采用 Next.js App Router、TypeScript、Tailwind CSS、Supabase PostgreSQL，并适配 Vercel 部署。

## 已实现功能

- 公开中文首页，以及基于 Supabase Auth 的账号登录与退出。
- 销售顾问、管理者两类角色，所有权限均在服务端重新验证。
- 销售顾问当前有效班次识别、多商品明细录入、金额自动计算。
- 商品有效性、正整数数量、最低售价、班次归属与有效时间的服务端和数据库校验。
- `register_sale` PostgreSQL 事务函数原子保存销售记录与全部销售明细。
- 管理者按日期、销售顾问、商品、活动查询，展示笔数、数量、总额和活动图表。
- 场地、活动、展位、班次、员工、商品基础数据查看。
- 数据库连接或保存失败时展示真实错误，不返回虚假成功。

## 数据模型说明

迁移文件包含文档规定的 11 张表、主外键、唯一约束和必要检查约束。ER 图把 `SALE_LINE` 画成复合主键，而正文 5.1.2 明确要求独立 `id` 主键并规定 `(sale_id, line_no)` 唯一。本项目采用正文方案：`id` 为主键，另建 `(sale_id, line_no)` 唯一约束。

认证用户不写入额外业务字段。Supabase Auth 邮箱的 `@` 前缀与 `STAFF.login_name` 匹配，例如 `sales.demo@foxcore.local` 对应 `sales.demo`。

## 本地运行

要求 Node.js 20.9 或更高版本。

```bash
npm install
cp .env.example .env.local
npm run dev
```

打开 `http://localhost:3000`。环境变量含义如下：

- `NEXT_PUBLIC_SUPABASE_URL`：Supabase 项目 URL。
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`：Supabase anon key，仅用于登录会话。
- `SUPABASE_SERVICE_ROLE_KEY`：仅供服务端读取和执行业务事务，绝不能暴露到浏览器或提交到 Git。

## 初始化 Supabase

1. 在 Supabase 创建免费项目。
2. 打开 SQL Editor，先执行 [001_initial_schema.sql](supabase/migrations/001_initial_schema.sql)，再执行 [seed.sql](supabase/seed.sql)。`seed.sql` 可重复执行，会重置业务表并生成展示数据。
3. 在本地临时配置环境变量，创建两个演示登录用户：

```bash
NEXT_PUBLIC_SUPABASE_URL='项目URL' \
SUPABASE_SERVICE_ROLE_KEY='service-role-key' \
DEMO_SALES_PASSWORD='自定义强密码' \
DEMO_MANAGER_PASSWORD='另一个自定义强密码' \
node scripts/create-demo-users.mjs
```

演示账号为：

- 销售顾问：`sales.demo@foxcore.local`
- 管理者：`manager.demo@foxcore.local`

密码只通过上述环境变量创建和交付，不写入代码或 README。

## 质量检查

```bash
npm run typecheck
npm run build
```

构建脚本使用 webpack，以避免部分受限环境中 Turbopack 处理 CSS 时无法绑定内部临时端口的问题。

## 部署到 Vercel

1. 将代码推送到 GitHub 私有或公开仓库，确认 `.env.local` 未被提交。
2. 在 Vercel 选择 **Add New → Project → Import Git Repository**。
3. Framework Preset 选择 **Next.js**，添加上述三个 Supabase 环境变量。
4. 点击 **Deploy**。部署完成后，在 Vercel 项目 **Settings → Domains** 查看公开地址。
5. 分别以两个演示账号验证首页、登录、销售录入、销售记录、统计和基础数据。

## 安全设计

- 数据库启用 RLS，浏览器 anon/authenticated 角色不能直接读写业务表。
- 业务数据只由 Next.js 服务端使用 service role 访问。
- 登录态用 Supabase 的服务端 Cookie 客户端校验，不信任前端传入的角色。
- `register_sale` 仅授权 `service_role` 执行，并在数据库内复核班次和价格规则。
- `.env*` 默认忽略，示例文件不含任何真实密钥。
