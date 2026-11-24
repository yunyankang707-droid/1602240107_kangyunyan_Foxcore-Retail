-- 适用于已经执行过 001/setup.sql 的项目，可重复执行。
grant usage on schema public to service_role;
grant select on table venue, event, booth, shift, staff, shift_assignment,
  product_category, product, sale, sale_line to service_role;
grant execute on function register_sale(bigint, jsonb) to service_role;
