begin;
truncate sale_line, sale, shift_assignment, shift, booth, event, venue, product, product_category, staff restart identity cascade;
insert into venue(venue_name,address) values ('上海新国际博览中心','上海市浦东新区龙阳路2345号'),('梅赛德斯奔驰文化中心','上海市浦东新区世博大道1200号');
insert into event(venue_id,event_name,start_date,end_date) values (1,'Foxcore 夏日音乐节','2026-11-20','2026-12-05'),(1,'潮流生活展','2026-11-22','2026-11-30'),(2,'冬日独立音乐周','2026-11-23','2026-12-08');
insert into booth(event_id,booth_code,location_note) values (1,'A-01','主舞台入口东侧'),(1,'B-12','餐饮区北侧'),(2,'C-08','三号馆中央'),(3,'VIP-02','内场入口');
insert into staff(login_name,full_name,staff_role,is_active) values ('sales.demo','林晓','sales_consultant',true),('manager.demo','陈然','manager',true),('zhouyu','周宇','sales_consultant',true),('wangmin','王敏','sales_consultant',true);
insert into shift(booth_id,starts_at,ends_at) values (1,now()-interval '4 hours',now()+interval '8 hours'),(2,now()-interval '2 hours',now()+interval '10 hours'),(3,now()-interval '1 day',now()+interval '7 days'),(4,now()-interval '1 day',now()+interval '10 days');
insert into shift_assignment(shift_id,staff_id,assignment_status) values (1,1,'assigned'),(2,3,'assigned'),(3,4,'assigned'),(4,1,'assigned');
insert into product_category(category_name) values ('服饰'),('配饰'),('音像制品'),('生活周边');
insert into product(category_id,sku,product_name,min_unit_price,is_active) values
(1,'TEE-BLK-001','Foxcore 黑色巡演 T 恤',128,true),(1,'HOODIE-001','Foxcore 刺绣连帽衫',298,true),(2,'CAP-001','经典刺绣棒球帽',88,true),(2,'BAG-001','音乐节帆布袋',48,true),(3,'VINYL-001','限定黑胶唱片',218,true),(3,'CD-001','现场精选 CD',68,true),(4,'MUG-001','Foxcore 陶瓷马克杯',58,true),(4,'PIN-001','珐琅徽章套装',38,true);
select register_sale(1,'[{"product_id":1,"quantity":2,"unit_price":168},{"product_id":8,"quantity":1,"unit_price":48}]');
select register_sale(2,'[{"product_id":3,"quantity":1,"unit_price":108},{"product_id":4,"quantity":2,"unit_price":58}]');
select register_sale(3,'[{"product_id":5,"quantity":1,"unit_price":258}]');
select register_sale(4,'[{"product_id":2,"quantity":1,"unit_price":338},{"product_id":7,"quantity":2,"unit_price":68}]');
commit;
