---
layout:     post
title:      "MySQL 常用命令"
subtitle:   "MySQL common commands"
date:       2018-08-09
author:     "Mr.厉害"
header-img: "img/post-bg/2018-08-11-03.jpg"
header-mask: 0.3
catalog:    true
tags:
  - MySQL
---

### 一、基础命令

1. 启动服务
    1. 说明：以管理员身份运行cmd
    2. 格式：net start 服务名称
    3. 示例：net start MySQL57
2. 停止服务
    1. 说明：以管理员身份运行cmd
    2. 格式：net stop 服务名称
    3. 示例：net stop MySQL57
3. 连接数据
    1. 格式：mysql -u 用户名 -p
    2. 示例：mysql -u root -p
            输入安装时设置的密码
4. 退出登录（断开连接）
    1. quit或exit
5. 查看版本（连接后可以执行）
    1. 示例：select version();
6. 显示当前时间（连接后可以执行）
    1. 示例：select now();
7. 远程连接
    1. 格式：mysql -h ip地址 -u 用户名 -p
            输入远程MySQL密码

### 二、数据库操作

1. 创建数据库
    1. 格式：create database 数据库名 charset=utf8;
    2. 示例：create database mrlihai charset=utf8;
2. 删除数据库
    1. 格式：drop database 数据库名;
    2. 示例：drop database mrlihai;
3. 切换数据库
    1. 格式：use 数据库名;
    2. 示例：use mrlihai;
4. 查看当前选择的数据库
    1. select database();

### 三、表操作

1. 查看当前数据库中所有的表
    1. show tables;
2. 创建表
    1. 格式：create table 表名(列及类型);
    2. 说明：
        1. auto_increment 表示自增长
        2. primary key 表示主键
        3. not null 表示不为空
    3. 示例：create table student(id int auto_increment primary key, name varchar(20) not null, age int not null, gender bit default 1, address varchar(20), isDelete bit default 0);
3. 删除表
    1. 格式：drop table 表名;
    2. 示例：drop table student;
4. 查看表结构
    1. 格式：desc 表名
    2. 示例：desc student;
5. 查看建表语句
    1. 格式：show create table 表名;
    2. 示例：show create table student;
6. 重命名表名
    1. 格式：rename table 原表名 to 新表明;
    2. 示例：rename table car to newcar;
7. 修改表
    1. 格式：alter table 表名 add|change|drop 列名 类型;
    2. 示例：alter table newcar add isDelete bit default 0;

### 四、数据操作

1. 增
    1. 全列插入
        1. 格式：insert into 表名 values(...);
        2. 说明：主键列是自动增长，但是在全列插入时需要占位，通常使用0，插入成功以后以实际数据为准
        3. 示例：insert into student values(0, "tom", 19, 1, "北京", 0);
    2. 缺省插入
        1. 格式：insert into 表名(列1, 列2, ...) values(值1, 值2, ...);
        2. 示例：insert into student(name, age, address) values("李雷", 19, "上海");
    3. 同时插入多条数据
        1. 格式：insert into 表名 values(...), (...), ...
        2. 示例：insert into student values(0, "韩梅梅", 18, 0, "北京", 0), (0, "pony", 22, 1, "西安", 0), (0, "lili", 20, 0, "成都", 0);
2. 删
    1. 格式：delete from 表名 where 条件;
    2. 示例：delete from student where id=4;
    3. 注意：没有条件是全部删除，慎用。
3. 改
    1. 格式：update 表名 set 列1=值1, 列2=值2, ... where 条件;
    2. 示例：update student set age=16 where id=7;
    3. 注意：没有条件是全部列都修改，慎用。
4. 查
    1. 说明：查询表中的全部数据
    2. 格式：select * from 表名;
    3. 示例：select * from student;

### 五、查

1. 基本语法
    1. 格式：select * from 表名
    2. 说明：
        1. from 关键字后面是表名，表示数据来源于这张表
        2. select 后面写表中的列名，如果是*表示在结果集中显示表中的所有列
        3. 在select后面的列名部分，可以使用as为列名起别名，这个别名显示在结果集中
        4. 如果要查询多个列，之间使用逗号分隔
    3. 示例
        1. select * from student;
        2. select name, age from student;
        3. select name as n, age from student;
2. 消除重复行
    在select后面列前面使用distinct可以消除重复的行
    1. 示例：select gender from student;
3. 条件查询
    1. 语法
        1. select * from 表名 where 条件;
    2. 比较运算符
        1. 等于     =
        2. 大于     >
        3. 小于     <
        4. 大于等于 >=
        5. 小于等于 <=
        6. 不等于   != 或 <>
            1. 需求：查询id值大于8的所有数据
            2. 示例：select * from student where id>8;
    3. 逻辑运算符
        1. and      并且
        2. or       或者
        3. not      非
            1. 需求：查询id值大于7的女同学
            2. 示例：select * from student where id>7 and gender=0;
    4. 模糊查询
        insert into student values(0, "习近平", 65, 1, "北京", 0);
        insert into student values(0, "习大", 66, 1, "北京", 0);
        1. 关键词：like
        2. 说明：%表示任意多个任意字符
        3. _表示一个任意字符
        4. 需求：查询姓习的同学
        5. 示例：
            1. select * from student where name like "习%";
            2. select * from student where name like "习__";
            3. select * from student where name like "习_";
    5. 范围查询
        1. in                       表示在一个非连续的范围内
        2. between ... and ...      表示在一个连续的范围内
            1. 需求：查询编号为8、10、12的学生
            2. 示例：select * from student where id in (8, 10, 12);
            3. 需求：查询编号为6到8的学生
            4. 示例：select * from student where id between 6 and 8;
    6. 空判断
        insert into student(name, age) values("特朗普", 70);

        1. 注意：null 与 "" 是不同的
        2. 判断空： is null
        3. 判断非空： is not null
            1. 需求：查询没有地址的同学
            2. 示例：select * from student where address is null;
            3. 需求：查询有地址的同学
            4. 示例：select * from student where address is not null;
    7. 优先级
        1. 小括号 > not > 比较运算符 > 逻辑运算符
        2. and 比 or 优先级高，如果同时出现并希望先选or，需要结合()来使用
4. 聚合
    为了快速得到统计数据，提供了5个聚合函数
    1. count(*)     表示计算总行数，括号中可以写*和列名
    2. max(列)      表示求此列的最大值
    3. min(列)      表示求此列的最小值
    4. sum(列)      表示求此列的和
    5. avg(列)      表示求此列的平均值
        1. 需求：查询学生总数
        2. 示例：select count(*) form student;
        3. 需求：查询女生的编号最大值
        4. 示例：select max(id) from student where gender=0;
        5. 需求：查询女的编号的最小值
        6. 示例：select min(id) from student where gender=0;
        7. 需求：查询所有女生的年龄和
        8. 示例：select sum(age) from student;
        9. 需求：查询所有学生的年龄平均值
        10. 示例：select avg(age) from student;
5. 分组
    按照字段分组，表示此字段相同的数据会被放到一个集合中。
    分组后，只能查询出相同的数据列，对于有差异的数据列无法显示在结果集中
    可以对分组后的数据进行统计，做聚合运算

    1. 语法：select 列1,列2,聚合... from 表名 group by 列1,列2,列3,...
    2. 需求：查询男女生总数
    3. 示例：
        1. select gender,count(*) from student group by gender;
        2. select name,gender,count(*) from student group by gender,age;
    4. 分组后的数据筛选：select 列1,列2,聚合... from 表名 group by 列1, 列2, 列3, ... having 列1,...聚合...
    5. 示例：select gender,count(*) from student group by gender having gender=1;

    > where 与 having 的区别：
    > where 是对 from 后面指定的表进行筛选，属于对原始数据的筛选
    > having 是对 group by 的结果进行筛选
6. 排序
    1. 语法：select * from 表名 order by 列1 asc|desc, lie2 asc|desc, ...
    2. 说明：
        1. 将数据按照列1进行排序，如果某些列1的值相同，则按照列2进行排序
        2. 默认按照从小到大的顺序排序
        3. asc升序
        4. desc降序
    3. 需求：将没有被删除的数据按照年龄排序
    4. 示例：
        1. select * from student where isDelete=0 order by age desc;
        2. select * from student where isDelete=0 order by age desc, id desc;
7. 分页
    1. 语法：select * from 表名 limit start, count;
    2. 说明：start 索引从0开发
    3. 示例：
        1. select * from student limit 0, 3;
        2. select * from student limit 3, 3;
        3. select * from student where gender=1 limit 0, 3;

### 六、关联

1. 建表语句：
    1. create table class(id int auto_increment primary key, name varchar(20) not null, stuNum int not null);
    2. create table students(id int auto_increment primary key, name varchar(20) not null, gender bit default 1, classid int not null, foreign key(classid) references class(id));
2. 插入一些数据：
    1. insert into class values(0, "class01", 55), (0, "class02", 50), (0, "class03", 60), (0, "class04", 80);
    2. insert into students values(0, "tom", 1, 1);
    3. insert into students values(0, "lucy", 1, 10);   //创建不成功，报错
    4. insert into students values(0, "jack", 1, 2);
    select * from students;
3. 关联查询：
    1. select students.name, class.name from class inner join students on calss.id=students.classid;
    2. select students.name, class.name from class left join students on class.id=students.classid;
    3. select students.name, class.name from class right join students on class.id=students.class.id;
4. 分类：
    1. 表A innner join 表B;
        表A与表B匹配的行会出现在结果集中
    2. 表A left join 表B;
        表A与表B匹配的行会出现在结果集中，外加表A中独有的数据，未对应的数据使用null填充
    3. 表A right join 表B;
        表A与表B匹配的行会出现在结果集中，外加表B中独有的数据，未对应的数据使用null填充
