// import { useEffect, useRef } from "react";
// // import echarts from "echarts";
// import "echarts-wordcloud";

// export default function WordCloud() {
//   const wordCloudRef = useRef();
//   useEffect(() => {
//     // const data = {
//     //   value: [
//     //     {
//     //       name: "花鸟市场",
//     //       value: 1446,
//     //     },
//     //     {
//     //       name: "汽车",
//     //       value: 928,
//     //     },
//     //     {
//     //       name: "视频",
//     //       value: 906,
//     //     },
//     //     {
//     //       name: "电视",
//     //       value: 825,
//     //     },
//     //     {
//     //       name: "Lover Boy 88",
//     //       value: 514,
//     //     },
//     //     {
//     //       name: "动漫",
//     //       value: 486,
//     //     },
//     //     {
//     //       name: "音乐",
//     //       value: 53,
//     //     },
//     //     {
//     //       name: "直播",
//     //       value: 163,
//     //     },
//     //     {
//     //       name: "广播电台",
//     //       value: 86,
//     //     },
//     //     {
//     //       name: "戏曲曲艺",
//     //       value: 17,
//     //     },
//     //     {
//     //       name: "演出票务",
//     //       value: 6,
//     //     },
//     //     {
//     //       name: "给陌生的你听",
//     //       value: 1,
//     //     },
//     //     {
//     //       name: "资讯",
//     //       value: 1437,
//     //     },
//     //     {
//     //       name: "商业财经",
//     //       value: 422,
//     //     },
//     //     {
//     //       name: "娱乐八卦",
//     //       value: 353,
//     //     },
//     //     {
//     //       name: "军事",
//     //       value: 331,
//     //     },
//     //     {
//     //       name: "科技资讯",
//     //       value: 313,
//     //     },
//     //     {
//     //       name: "社会时政",
//     //       value: 307,
//     //     },
//     //     {
//     //       name: "时尚",
//     //       value: 43,
//     //     },
//     //     {
//     //       name: "网络奇闻",
//     //       value: 15,
//     //     },
//     //     {
//     //       name: "旅游出行",
//     //       value: 438,
//     //     },
//     //     {
//     //       name: "景点类型",
//     //       value: 957,
//     //     },
//     //     {
//     //       name: "国内游",
//     //       value: 927,
//     //     },
//     //     {
//     //       name: "远途出行方式",
//     //       value: 908,
//     //     },
//     //     {
//     //       name: "酒店",
//     //       value: 693,
//     //     },
//     //     {
//     //       name: "关注景点",
//     //       value: 611,
//     //     },
//     //     {
//     //       name: "旅游网站偏好",
//     //       value: 512,
//     //     },
//     //     {
//     //       name: "出国游",
//     //       value: 382,
//     //     },
//     //     {
//     //       name: "交通票务",
//     //       value: 312,
//     //     },
//     //     {
//     //       name: "旅游方式",
//     //       value: 187,
//     //     },
//     //     {
//     //       name: "旅游主题",
//     //       value: 163,
//     //     },
//     //     {
//     //       name: "港澳台",
//     //       value: 104,
//     //     },
//     //     {
//     //       name: "本地周边游",
//     //       value: 3,
//     //     },
//     //     {
//     //       name: "小卖家",
//     //       value: 1331,
//     //     },
//     //     {
//     //       name: "全日制学校",
//     //       value: 941,
//     //     },
//     //     {
//     //       name: "基础教育科目",
//     //       value: 585,
//     //     },
//     //     {
//     //       name: "考试培训",
//     //       value: 473,
//     //     },
//     //     {
//     //       name: "语言学习",
//     //       value: 358,
//     //     },
//     //     {
//     //       name: "留学",
//     //       value: 246,
//     //     },
//     //     {
//     //       name: "K12课程培训",
//     //       value: 207,
//     //     },
//     //     {
//     //       name: "艺术培训",
//     //       value: 194,
//     //     },
//     //     {
//     //       name: "技能培训",
//     //       value: 104,
//     //     },
//     //     {
//     //       name: "IT培训",
//     //       value: 87,
//     //     },
//     //     {
//     //       name: "高等教育专业",
//     //       value: 63,
//     //     },
//     //     {
//     //       name: "家教",
//     //       value: 48,
//     //     },
//     //     {
//     //       name: "体育培训",
//     //       value: 23,
//     //     },
//     //     {
//     //       name: "职场培训",
//     //       value: 5,
//     //     },
//     //     {
//     //       name: "金融财经",
//     //       value: 1328,
//     //     },
//     //     {
//     //       name: "银行",
//     //       value: 765,
//     //     },
//     //     {
//     //       name: "股票",
//     //       value: 452,
//     //     },
//     //     {
//     //       name: "保险",
//     //       value: 415,
//     //     },
//     //     {
//     //       name: "贷款",
//     //       value: 253,
//     //     },
//     //     {
//     //       name: "基金",
//     //       value: 211,
//     //     },
//     //     {
//     //       name: "信用卡",
//     //       value: 180,
//     //     },
//     //     {
//     //       name: "外汇",
//     //       value: 138,
//     //     },
//     //     {
//     //       name: "P2P",
//     //       value: 116,
//     //     },
//     //     {
//     //       name: "贵金属",
//     //       value: 98,
//     //     },
//     //     {
//     //       name: "债券",
//     //       value: 93,
//     //     },
//     //     {
//     //       name: "网络理财",
//     //       value: 92,
//     //     },
//     //     {
//     //       name: "信托",
//     //       value: 90,
//     //     },
//     //     {
//     //       name: "征信",
//     //       value: 76,
//     //     },
//     //     {
//     //       name: "期货",
//     //       value: 76,
//     //     },
//     //     {
//     //       name: "公积金",
//     //       value: 40,
//     //     },
//     //     {
//     //       name: "银行理财",
//     //       value: 36,
//     //     },
//     //     {
//     //       name: "银行业务",
//     //       value: 30,
//     //     },
//     //     {
//     //       name: "典当",
//     //       value: 7,
//     //     },
//     //     {
//     //       name: "海外置业",
//     //       value: 1,
//     //     },
//     //     {
//     //       name: "汽车",
//     //       value: 1309,
//     //     },
//     //     {
//     //       name: "汽车档次",
//     //       value: 965,
//     //     },
//     //     {
//     //       name: "汽车品牌",
//     //       value: 900,
//     //     },
//     //     {
//     //       name: "汽车车型",
//     //       value: 727,
//     //     },
//     //     {
//     //       name: "购车阶段",
//     //       value: 461,
//     //     },
//     //     {
//     //       name: "二手车",
//     //       value: 309,
//     //     },
//     //     {
//     //       name: "汽车美容",
//     //       value: 260,
//     //     },
//     //     {
//     //       name: "新能源汽车",
//     //       value: 173,
//     //     },
//     //     {
//     //       name: "汽车维修",
//     //       value: 155,
//     //     },
//     //     {
//     //       name: "租车服务",
//     //       value: 136,
//     //     },
//     //     {
//     //       name: "车展",
//     //       value: 121,
//     //     },
//     //     {
//     //       name: "违章查询",
//     //       value: 76,
//     //     },
//     //     {
//     //       name: "汽车改装",
//     //       value: 62,
//     //     },
//     //     {
//     //       name: "汽车用品",
//     //       value: 37,
//     //     },
//     //     {
//     //       name: "路况查询",
//     //       value: 32,
//     //     },
//     //     {
//     //       name: "汽车保险",
//     //       value: 28,
//     //     },
//     //     {
//     //       name: "陪驾代驾",
//     //       value: 4,
//     //     },
//     //     {
//     //       name: "网络购物",
//     //       value: 1275,
//     //     },
//     //     {
//     //       name: "做我的猫",
//     //       value: 1088,
//     //     },
//     //     {
//     //       name: "只想要你知道",
//     //       value: 907,
//     //     },
//     //     {
//     //       name: "团购",
//     //       value: 837,
//     //     },
//     //     {
//     //       name: "比价",
//     //       value: 201,
//     //     },
//     //     {
//     //       name: "海淘",
//     //       value: 195,
//     //     },
//     //     {
//     //       name: "移动APP购物",
//     //       value: 179,
//     //     },
//     //     {
//     //       name: "支付方式",
//     //       value: 119,
//     //     },
//     //     {
//     //       name: "代购",
//     //       value: 43,
//     //     },
//     //     {
//     //       name: "体育健身",
//     //       value: 1234,
//     //     },
//     //     {
//     //       name: "体育赛事项目",
//     //       value: 802,
//     //     },
//     //     {
//     //       name: "运动项目",
//     //       value: 405,
//     //     },
//     //     {
//     //       name: "体育类赛事",
//     //       value: 337,
//     //     },
//     //     {
//     //       name: "健身项目",
//     //       value: 199,
//     //     },
//     //     {
//     //       name: "健身房健身",
//     //       value: 78,
//     //     },
//     //     {
//     //       name: "运动健身",
//     //       value: 77,
//     //     },
//     //     {
//     //       name: "家庭健身",
//     //       value: 36,
//     //     },
//     //     {
//     //       name: "健身器械",
//     //       value: 29,
//     //     },
//     //     {
//     //       name: "办公室健身",
//     //       value: 3,
//     //     },
//     //     {
//     //       name: "商务服务",
//     //       value: 1201,
//     //     },
//     //     {
//     //       name: "法律咨询",
//     //       value: 508,
//     //     },
//     //     {
//     //       name: "化工材料",
//     //       value: 147,
//     //     },
//     //     {
//     //       name: "广告服务",
//     //       value: 125,
//     //     },
//     //     {
//     //       name: "会计审计",
//     //       value: 115,
//     //     },
//     //     {
//     //       name: "人员招聘",
//     //       value: 101,
//     //     },
//     //     {
//     //       name: "印刷打印",
//     //       value: 66,
//     //     },
//     //     {
//     //       name: "知识产权",
//     //       value: 32,
//     //     },
//     //     {
//     //       name: "翻译",
//     //       value: 22,
//     //     },
//     //     {
//     //       name: "安全安保",
//     //       value: 9,
//     //     },
//     //     {
//     //       name: "公关服务",
//     //       value: 8,
//     //     },
//     //     {
//     //       name: "商旅服务",
//     //       value: 2,
//     //     },
//     //     {
//     //       name: "展会服务",
//     //       value: 2,
//     //     },
//     //     {
//     //       name: "特许经营",
//     //       value: 1,
//     //     },
//     //     {
//     //       name: "休闲爱好",
//     //       value: 1169,
//     //     },
//     //     {
//     //       name: "收藏",
//     //       value: 412,
//     //     },
//     //     {
//     //       name: "摄影",
//     //       value: 393,
//     //     },
//     //     {
//     //       name: "温泉",
//     //       value: 230,
//     //     },
//     //     {
//     //       name: "博彩彩票",
//     //       value: 211,
//     //     },
//     //     {
//     //       name: "美术",
//     //       value: 207,
//     //     },
//     //     {
//     //       name: "书法",
//     //       value: 139,
//     //     },
//     //     {
//     //       name: "DIY手工",
//     //       value: 75,
//     //     },
//     //     {
//     //       name: "舞蹈",
//     //       value: 23,
//     //     },
//     //     {
//     //       name: "钓鱼",
//     //       value: 21,
//     //     },
//     //     {
//     //       name: "棋牌桌游",
//     //       value: 17,
//     //     },
//     //     {
//     //       name: "KTV",
//     //       value: 6,
//     //     },
//     //     {
//     //       name: "密室",
//     //       value: 5,
//     //     },
//     //     {
//     //       name: "采摘",
//     //       value: 4,
//     //     },
//     //     {
//     //       name: "电玩",
//     //       value: 1,
//     //     },
//     //     {
//     //       name: "真人CS",
//     //       value: 1,
//     //     },
//     //     {
//     //       name: "轰趴",
//     //       value: 1,
//     //     },
//     //     {
//     //       name: "家电数码",
//     //       value: 1111,
//     //     },
//     //     {
//     //       name: "手机",
//     //       value: 885,
//     //     },
//     //     {
//     //       name: "电脑",
//     //       value: 543,
//     //     },
//     //     {
//     //       name: "大家电",
//     //       value: 321,
//     //     },
//     //     {
//     //       name: "家电关注品牌",
//     //       value: 253,
//     //     },
//     //     {
//     //       name: "网络设备",
//     //       value: 162,
//     //     },
//     //     {
//     //       name: "摄影器材",
//     //       value: 149,
//     //     },
//     //     {
//     //       name: "影音设备",
//     //       value: 133,
//     //     },
//     //     {
//     //       name: "办公数码设备",
//     //       value: 113,
//     //     },
//     //     {
//     //       name: "生活电器",
//     //       value: 67,
//     //     },
//     //     {
//     //       name: "厨房电器",
//     //       value: 54,
//     //     },
//     //     {
//     //       name: "智能设备",
//     //       value: 45,
//     //     },
//     //     {
//     //       name: "个人护理电器",
//     //       value: 22,
//     //     },
//     //     {
//     //       name: "服饰鞋包",
//     //       value: 1047,
//     //     },
//     //     {
//     //       name: "服装",
//     //       value: 566,
//     //     },
//     //     {
//     //       name: "饰品",
//     //       value: 289,
//     //     },
//     //     {
//     //       name: "鞋",
//     //       value: 184,
//     //     },
//     //     {
//     //       name: "箱包",
//     //       value: 168,
//     //     },
//     //     {
//     //       name: "奢侈品",
//     //       value: 137,
//     //     },
//     //     {
//     //       name: "母婴亲子",
//     //       value: 1041,
//     //     },
//     //     {
//     //       name: "孕婴保健",
//     //       value: 505,
//     //     },
//     //     {
//     //       name: "母婴社区",
//     //       value: 299,
//     //     },
//     //     {
//     //       name: "早教",
//     //       value: 103,
//     //     },
//     //     {
//     //       name: "奶粉辅食",
//     //       value: 66,
//     //     },
//     //     {
//     //       name: "童车童床",
//     //       value: 41,
//     //     },
//     //     {
//     //       name: "关注品牌",
//     //       value: 271,
//     //     },
//     //     {
//     //       name: "宝宝玩乐",
//     //       value: 30,
//     //     },
//     //     {
//     //       name: "母婴护理服务",
//     //       value: 25,
//     //     },
//     //     {
//     //       name: "纸尿裤湿巾",
//     //       value: 16,
//     //     },
//     //     {
//     //       name: "妈妈用品",
//     //       value: 15,
//     //     },
//     //     {
//     //       name: "宝宝起名",
//     //       value: 12,
//     //     },
//     //     {
//     //       name: "童装童鞋",
//     //       value: 9,
//     //     },
//     //     {
//     //       name: "胎教",
//     //       value: 8,
//     //     },
//     //     {
//     //       name: "宝宝安全",
//     //       value: 1,
//     //     },
//     //     {
//     //       name: "宝宝洗护用品",
//     //       value: 1,
//     //     },
//     //     {
//     //       name: "软件应用",
//     //       value: 1018,
//     //     },
//     //     {
//     //       name: "系统工具",
//     //       value: 896,
//     //     },
//     //     {
//     //       name: "理财购物",
//     //       value: 440,
//     //     },
//     //     {
//     //       name: "生活实用",
//     //       value: 365,
//     //     },
//     //     {
//     //       name: "影音图像",
//     //       value: 256,
//     //     },
//     //     {
//     //       name: "社交通讯",
//     //       value: 214,
//     //     },
//     //     {
//     //       name: "手机美化",
//     //       value: 39,
//     //     },
//     //     {
//     //       name: "办公学习",
//     //       value: 28,
//     //     },
//     //     {
//     //       name: "应用市场",
//     //       value: 23,
//     //     },
//     //     {
//     //       name: "母婴育儿",
//     //       value: 14,
//     //     },
//     //     {
//     //       name: "游戏",
//     //       value: 946,
//     //     },
//     //     {
//     //       name: "手机游戏",
//     //       value: 565,
//     //     },
//     //     {
//     //       name: "PC游戏",
//     //       value: 353,
//     //     },
//     //     {
//     //       name: "网页游戏",
//     //       value: 254,
//     //     },
//     //     {
//     //       name: "游戏机",
//     //       value: 188,
//     //     },
//     //     {
//     //       name: "模拟辅助",
//     //       value: 166,
//     //     },
//     //     {
//     //       name: "个护美容",
//     //       value: 942,
//     //     },
//     //     {
//     //       name: "护肤品",
//     //       value: 177,
//     //     },
//     //     {
//     //       name: "彩妆",
//     //       value: 133,
//     //     },
//     //     {
//     //       name: "美发",
//     //       value: 80,
//     //     },
//     //     {
//     //       name: "香水",
//     //       value: 50,
//     //     },
//     //     {
//     //       name: "个人护理",
//     //       value: 46,
//     //     },
//     //     {
//     //       name: "美甲",
//     //       value: 26,
//     //     },
//     //     {
//     //       name: "SPA美体",
//     //       value: 21,
//     //     },
//     //     {
//     //       name: "花鸟萌宠",
//     //       value: 914,
//     //     },
//     //     {
//     //       name: "绿植花卉",
//     //       value: 311,
//     //     },
//     //     {
//     //       name: "狗",
//     //       value: 257,
//     //     },
//     //     {
//     //       name: "其他宠物",
//     //       value: 131,
//     //     },
//     //     {
//     //       name: "水族",
//     //       value: 125,
//     //     },
//     //     {
//     //       name: "猫",
//     //       value: 122,
//     //     },
//     //     {
//     //       name: "动物",
//     //       value: 81,
//     //     },
//     //     {
//     //       name: "鸟",
//     //       value: 67,
//     //     },
//     //     {
//     //       name: "宠物用品",
//     //       value: 41,
//     //     },
//     //     {
//     //       name: "宠物服务",
//     //       value: 26,
//     //     },
//     //     {
//     //       name: "书籍阅读",
//     //       value: 913,
//     //     },
//     //     {
//     //       name: "网络小说",
//     //       value: 483,
//     //     },
//     //     {
//     //       name: "关注书籍",
//     //       value: 128,
//     //     },
//     //     {
//     //       name: "文学",
//     //       value: 105,
//     //     },
//     //     {
//     //       name: "报刊杂志",
//     //       value: 77,
//     //     },
//     //     {
//     //       name: "人文社科",
//     //       value: 22,
//     //     },
//     //     {
//     //       name: "建材家居",
//     //       value: 907,
//     //     },
//     //     {
//     //       name: "装修建材",
//     //       value: 644,
//     //     },
//     //     {
//     //       name: "家具",
//     //       value: 273,
//     //     },
//     //     {
//     //       name: "家居风格",
//     //       value: 187,
//     //     },
//     //     {
//     //       name: "家居家装关注品牌",
//     //       value: 140,
//     //     },
//     //     {
//     //       name: "家纺",
//     //       value: 107,
//     //     },
//     //     {
//     //       name: "厨具",
//     //       value: 47,
//     //     },
//     //     {
//     //       name: "灯具",
//     //       value: 43,
//     //     },
//     //     {
//     //       name: "家居饰品",
//     //       value: 29,
//     //     },
//     //     {
//     //       name: "家居日常用品",
//     //       value: 10,
//     //     },
//     //     {
//     //       name: "生活服务",
//     //       value: 883,
//     //     },
//     //     {
//     //       name: "物流配送",
//     //       value: 536,
//     //     },
//     //     {
//     //       name: "家政服务",
//     //       value: 108,
//     //     },
//     //     {
//     //       name: "摄影服务",
//     //       value: 49,
//     //     },
//     //     {
//     //       name: "搬家服务",
//     //       value: 38,
//     //     },
//     //     {
//     //       name: "物业维修",
//     //       value: 37,
//     //     },
//     //     {
//     //       name: "婚庆服务",
//     //       value: 24,
//     //     },
//     //     {
//     //       name: "二手回收",
//     //       value: 24,
//     //     },
//     //     {
//     //       name: "鲜花配送",
//     //       value: 3,
//     //     },
//     //     {
//     //       name: "维修服务",
//     //       value: 3,
//     //     },
//     //     {
//     //       name: "殡葬服务",
//     //       value: 1,
//     //     },
//     //     {
//     //       name: "求职创业",
//     //       value: 874,
//     //     },
//     //     {
//     //       name: "创业",
//     //       value: 363,
//     //     },
//     //     {
//     //       name: "目标职位",
//     //       value: 162,
//     //     },
//     //     {
//     //       name: "目标行业",
//     //       value: 50,
//     //     },
//     //     {
//     //       name: "兼职",
//     //       value: 21,
//     //     },
//     //     {
//     //       name: "期望年薪",
//     //       value: 20,
//     //     },
//     //     {
//     //       name: "实习",
//     //       value: 16,
//     //     },
//     //     {
//     //       name: "雇主类型",
//     //       value: 10,
//     //     },
//     //     {
//     //       name: "星座运势",
//     //       value: 789,
//     //     },
//     //     {
//     //       name: "星座",
//     //       value: 316,
//     //     },
//     //     {
//     //       name: "算命",
//     //       value: 303,
//     //     },
//     //     {
//     //       name: "解梦",
//     //       value: 196,
//     //     },
//     //     {
//     //       name: "风水",
//     //       value: 93,
//     //     },
//     //     {
//     //       name: "面相分析",
//     //       value: 47,
//     //     },
//     //     {
//     //       name: "手相",
//     //       value: 32,
//     //     },
//     //     {
//     //       name: "公益",
//     //       value: 90,
//     //     },
//     //   ],
//     //   //小鸟图片
//     //   image:
//     //     "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAO4AAADICAYAAADvG90JAAAWNElEQVR4Xu2dedS/5ZzHX/6YmVJRKi1ojwqjydaqIilJacgkhFSYM5UkSyiFSpaypIXRiJBjyJqTZBjLjL2hxZpMRqEkSxznzJz3dH1PT0/P83zv5bqv5b7fn3O+5+l3uu/r8/m8r/t9L9f1We6GxQgYgeoQuFt1FttgI2AEMHF9ERiBChEwcSucNJtsBExcXwNGoEIETNwKJ80mGwET19dAbAS2BDYNv/sA9wLWAtYEVpuj7M/Ab8LvZuB64Mrw+3lsQ2sez8Stefby2r4TsBtw/wVEve+AJv0C+BxwOfAZ4GcD6ip+aBO3+CkqxsB1gKcBewK7Aqtntuwa4JPA24CfZLYluXoTNznkVSlcA/h74OnAYwq2/ELgNcBVBdsY1TQTNyqcoxnsAcAxgbB3r8grvUafCVxckc2dTDVxO8E22pM2CRf+Eyv38EvAUcA3KvdjWfNN3LHObHu/TgJe2f60os/Q6/PYfPp/wE3coq+7JMZtD7wf0NN2jPKFsKimraXSZGNgL+BfgNvaGGfitkFrfMe+FDhlfG7dxaNbgBcAWsTKLdrXfirwDGAH4BHA19oaZeK2RWwcx2vB6WOFrxQPgfR5wOFDDDxnTAWePBn4h/CEnR1+EPCBLvYMQdytp7Qs3wX0As5RIMPuBdiRw4QvA/uE6Kyh9e8NHBy21FZZpExrCid0NWAI4upOrjvM/sCtXQ3zeYMhoK2S2leN+4KjMMpdgJv6DrTE+YooU6CKnqYK9VxKPgQc2Ed3bOJuGOJLZdN3wmuBQtUsZSBwLnBYGaZkt+KK8NYRg7wK+3xm+G7daI5nXwce3tf72MQ9GnjzAqO0krcHcHVfQ31+bwQOAD7ce5RxDaCHi67PX3Vwa/0QoKJX4W0bnq/46ocCv2x4/LKHxSbuUt9OyvJ4PPDVvsb6/M4IKPj/v0KGTudBRnqiyKstsSbbMfcMC0xaFW67RqDxHwnoSd9bYhJ3XeDGZSz6Y3BY37+W9AhcBjw6vdpqNCrS6uSQdbSU0SLpc8O3a1en9gU+0fXkxefFJO6hwDvnGPY84JxYxnucRggcApzf6EgfpLfD2RPxr4ENIgWmHAu8MSa8MYnbdLXydcDxMZ3wWMsisCrwY0DfY5Y8CLwbeE5s1TGJ+78tjNNyuFbhmnxXtBjWhy5C4MQ+e4VGszcCegXfufcoSwwQi7jK1fxsSwMV5qX3/htanufDmyGwXkgw11PXkh4BJfdrBVmv39ElFnFPB/Qe31ZUR+hxwHfbnujj5yLwcuC1c4/yAUMg8NuwV/v9IQbXmLGIq62GB3U08vdhtc4rzh0BXOY0VYPYKu6QHq0hAtob1kr+YBKDuMp2+HUEC18GnBphHA9x+yuaInQs6RFQZNq83ZXeVsUgruJeY5UK6R3D2RuRcQxwRqgAMQ5v6vFCuL8whbkxiHsacFxEYxVhtd8KwRwRVY12KMWHa3HKkg6BSwBlAyWRGMRVhQFlWsQUXXgi73/GHHQiYz3Qi33JZ1rZRgpn/F0qzTGIq8WloSoBvgh4UyowRqLn+cBZI/GlBjeUoPAw4Kc9jd0GUHVNBcwofnpF6UtcKRo680erzcpv1A3CMh8BVVRQELwlDQJtSs8oSUG7L1rtF3dmf5UWKGm8xtOXuE8BLkqAj6rWKzF/6JtEAlcGV/E/DnEcHOOZAj1QVGhvsYiIWwSSiqD6t56o2oFZTrQS3ThXui9xXwW8OhFMeuIq5jPFjSKRS9HVbA78MPqoHnApBPQJp/xmkVK/Bweydtk7f0vbXYC+xNXdRgWwUkprJ1Mal1mXFvQ+mtkGq2+HgGIXFMPQSvoSV5Xit2ulMc7B3wrfcT+IM9xoRlHbkKjpY6NBpkxHVKxdRdtbS1/iql7tPVprjXOCkvO16vyOOMONYhStJmtV2VI+AgrUUMBGJ+lDXK2QqQlxblGrRSWLxwi7zO1LX/3qG6s2mJayEdDN9ew+JvYhrlbNSnlVVckcrfANGtjdB+hE5/4I2CyRLqvphoBalr6v26l3nNWHuIoUKa0AnJoc/1NfUCo+v00xg4rdrNZ07a9H2RXpQ9xHAf9WIIR6C1B1jdJuKimgMnFToNxNhyqdfrrbqXc9qw9x1bBI7RxKFRWle/GEuilokVCLhZbyEIien9uHuKrGXnoSgJIVjggNrsqbzrgW3dtlgOICGmE01VRTxtDnI4x1pyH6EPdvmwRDxza443iKcFGbxeXqPncctqjT7gdcV5RF0zZG5WtUlmmQT7Y+xFVol8qj1CICUnnDY63rXNIqfy3XxFB26pNFBei/OZSCPsRVrV4FtNcmAlPB3IOBmgkQ5+FmAn6RWsUTaOFWObqDSR/iyqiaVzHVue4lhQSRxJjgmj5dYvhb4hh6kKldibLZBpW+xFXy8Ly2goM60HNwtVhUGdMxvD4rz1PVNi15EFAnvl1DLevBLehLXIUban+qdtHq+FFDLSQkAidFUYNErlSnRrEDetKqrWwS6Utc9QFqnZKUxLNuSnQjUsaGso9qk01S3e1rA2Zge/UtK9Im3bHoS1xtLF86MDA5hv/XQOBBFxgiO7ZSm9PIqjxcQODbgNrvxOhq3wrUvsRVX5o/tNJY18EXhgofg7WSiAjH6hOKEosIW+ehRNZNAW0zJpe+xJXBCppW7akxi4p4nVLBK3TNq/y1XT9ajMq2MBuDuDsCaic4Bbk8lIuN1lk8MmgmbmRAVxhOZVn1eZJFYhBXhmvfalZiMosjiZWqu+CZgEqhJiuC3cBH2bJag+N8SH8EVLxQnydZJBZxp1qEW9/3Ks72HkDVJ3LLL4F1chsxIf2x+NMasliKVwGunXi/GpFGBP4goKbdOURJBko2sKRBIBZ/WlsbU7Gyb97e2oJxnqCbmMqT6FU6ZdNurX5vOU5Ii/RKrXdUtDC5xCSujFffEy2RW+5AQHvBWpX+SII0yCtCYW7jnwYBFS+4NY2qO2uJTVwVR1+qJUMO30rUqS4DIrD6If37AAb+B6BeNpY0CKyZq+pIbOIKLnVCV0d0y3wEVLNLW2lfDNVE+kbgaDyllFnSILB2jqgpuTYEcUus/phmGvtr0aa+4qT10z6hcju16KW/ioVdKYhdscp6JVfLR0saBNQ8PGmM8sytIYirsY/v2lohDd7WYgSiIKA6X7qxJpehiCtHvgJsn9wjKzQC6RBQ28yb06m7Q9OQxNV+orZCcvUWyoGndU4LAbXhqTbJYKWp2gcoNa53WpeYvR0CAYWXZsmOG/KJOwNKja/VANtiBMaGQAr+LIlZKsVKTH/S2GbN/kwegVT8uQvQXRQfCagrfFvRXuXObU/y8UagUASUibVGLtvaEndWZUElO5Q8r0igpiInFTG0W9MTfJwRKBiBGwDVFs8ibYm7MGle+YhHA+9sablCIhUaaTECNSOgXsTqHpFF2hL3ucB5iyxVaVPl47bpDHAicEIWj63UCMRB4DvAtnGGaj9KW+KeFvrvLKXpvaEuU9PKiAcAFwBKjbIYgdoQUJLILrmMbktckfPgOcZ+FjgbUIe8eaLcUWXLqO+NxQjUhIDWa/bLZXBb4l4SWgc2sVcf76oIIWIq/HE50RP3WOAYQJEoFiNQAwL/DByay9C2xNX3rBpatxU1Q7osEFhlXX4Ssl80jkIj1bBKokZcG7Yd3McbgQwIvD40jcugun1an5pKqbmUxQhMHQH1Wj49Fwhtn7haeNo6l7HWawQKQuA5wLtz2dOWuAq8eEguY63XCBSEwN6A1nyySFviuqZRlmmy0gIR0LpMtn7EbYmrrR51J7MYgakjkC2JXsC3Ja6KfR849Rmz/0agA3eigtaWuCp4rsLnFiMwZQTUgT5rr6y2xFWgRLYl8ClfKfa9KAT0yfjYnBa1Je4TgI/nNNi6jUABCCikV4k12aQtcVW7V1FPFiMwZQT05vnGnAC0Ja5sVQyy6slajMBUEdgfuDin812IK4OfmNNo6zYCmRFQ2O/3ctrQhbhHAWfkNNq6jUBmBFYFbstpQxfiqo2m2mlajMAUEbgG2Cq3412IK5tVtmOWipfbB+s3AikRUGO17EFIXYmrInFvTomWdRmBQhB4ZQkN7boSV5UqflMIkDbDCKREIPuKspztSlyd+y5AOYkWIzAlBDYGrsvtcB/ibgaotqzFCEwFATUbX7cEZ/sQV/afAxxegiO2wQgkQEDhvkXEMPQl7gaAMiXUbtBiBMaOQBELU32/cWeTpDQ/pftZjMDYEdgTuLQEJ/s+cWc+fBnYoQSHbIMRGBCBbB3oF/sUi7haafsuoG5+FiMwRgS+BWxXimOxiCt/9g1tNEvxzXYYgZgIKOBI3TaKkJjElUOvBV5ehGc2wgjEReBJwEfjDtl9tNjElSVn5a4O0B0On2kElkVgbeCmUvAZgrjy7UzgyFKctB1GoCcCRX3fypehiKux9cqsV2eLEagdgZOBV5XkxJDElZ+7AkqDKiJMrCTgbUtVCDwSUKfKYmRo4srR9UPn+T2K8dqGGIHmCBQTn7zQ5BTEnelTE2BVxnPz6uYXjY/Mj4A68hWXBZeSuJoCNa3WqvN++efDFhiBRggoqaC4WuKpiTtDavtQRcANxBpdOz4oEwK3AvfIpHtFtbmIOzNqF+DVwO4lgmObJo/Ae4BDSkQhN3FnmGwR8nqf5RXoEi+TydqkMN5PlOh9KcRdiM1BIe55N0D5vhYjkAOBW4A1cyhuorNE4i60W60MtRcsEu8MbNTEKR9jBCIgcC5wRIRxBhmidOIudlo9i3YMub9a4HoYcPdBkPGgU0dgJ0B55kVKbcRdCKIIrJhokddiBGIioCKIWncpVmojrkInDwAOBrQibTECQyBQTG2p5ZzLQdxtgFeE0q7XAj8F/rKMgSKqgjY2D9+6bnsyxGXqMRcjUETt5JWmJQdxtVJ3s68VI1AoAh8Jb3WFmne7WTmIK71fBZRxYTECpSGgXYwvlGbUYntyEfc44LTSwbF9k0PgKkCfcsVLLuK6x27xl8YkDXw2cH4NnucirrD5YgiqqAEn2zh+BIrMu10O9pzEPQxQdIrFCJSAwLEhX7wEW+bakJO4qwLXA2vNtdIHGIFhEVCv5/sBvxtWTbzRcxJXXiilr6giXPGg9UgVIXAScEJF9mbbDpphtE4IwHC8cU1Xzbhs/UNIXvl1TW7lfuIKK4WX6Y5nMQI5ENAbn8qvViUlEFe9dRXUvV5VyNnYMSBwI7AZ8PvanCmBuMJMxeOK6ctS2yTa3s4IPA84p/PZGU8shbiC4EJA1S8sRiAFAlcDW6dQNISOkoir5IMrXa5miGn2mEsgsBfwmVqRKYm4wnDbUHVAe7wWIzAUAh+rvbZ3acTVRKkA9cVDzZjHNQJh++dnNSNRInGF50uAU2sG1rYXi4A6SKqQQ9VSKnEF6hnAUVWja+NLQ0Dbjg8CbivNsLb2lExc+aKGSyqSbjECMRB4BPC1GAPlHqN04gqfC4Cn5wbK+qtH4A3Ai6v3IjhQA3Fl6vGhSdhYcLcfaREovtxqWzhqIa78UnSVgjSckNB2ln383wHfHhMMNRFXuD8YuAjYakyTYF8GRaCqBPmmSNRG3Jlf6mBwZFMnfdxkEbgM2GOM3tdKXM2FmmLr1Vn9hCxGYDECqiGlWGT9HZ3UTFxNhrqFK59Xr0MWI7AQgSrqI3edstqJO/Nb9YJOB57aFQifNyoEqkyObzMDYyHuzGd17jsR2KcNCD52VAhcCuw5Ko+WcGZsxJ25+ADgaOCZ3j4a+yV8J/9+HjoRqJv8qGWsxJ1Nmkq/Hgqo0oE6/lnGi4Aaye0ccrrH62XwbOzEXTiBegrvG36PGv3MTstBVWrcbSxxyE2mbkrEXYjHPYH9Q8/dHRzQ0eRSKfqYRwOXF21hZOOmStzFMIrIOwHbAzuGFqCrR8baww2DgAovfHyYocsd1cRdem5eP6ZMknIvv96WPQN4b+9RKhzAxL3rpGkrodoiYhVeg11N/kfgrK4n136eiXvnGdwF+DSgIu2WchHQXr36Tk1WTNw7pl6rkiLtKpO9GupwXBFyx9Vh6nBWmri3Y/sC4O3DweyRIyGguPTXRBqr6mGmTlzt7X4QeEjVszgN4xUJp3ROC2Rvs5lzEp4citF52yfnLDTTfThwXrNDp3HUFJ+42qt9HbD7NKa4ai/VRU832Euq9mIA46dEXNWs0uuWFqEs5SPw38DjphJ73HY6xk7c+wDPDokGm7QFx8dnQ+ArIaa8qi7xKdEaK3EVUSPC+nU45dUUR5eCKhRcYVkBgTERVxUglTjwfLfqrPaa1832/GqtT2h4zcRVfWUVjHtseK3yq3DCCyeyquvDTffrkccd7XC1EVcFwPT6qzQuhSda6kfgU8AhY63GONT0lEpcVW/cBrg/oCAJJb6ruoFlPAj8ETgGOHs8LqXzpATibgpsBqiTmoq96e9900FgTRkQUMe8gwD19LF0QCAFcbcIRBRBNw6/jQJZ/V3aYdIqP0VNpdVc2tIDgT7EVdWIDcMKruoaa89UPz0t1wdE1HV72OZTx4XAN8K37PfG5VYeb1Yirkj4ImANQPG8+qtvzxlZ3TUvz5zVqPVlwKk1Gl6qzfOeuNoXVVf4NUt1wHYVjcDnQjDF1UVbWaFx84grl9YJmRkiscUINEHgupDsrpRJywAINCHuTO2zgLeG1+YBTPGQI0BA9Y1PcbL78DPZhriyRqvCenV2DPDwc1OThtuAc8Nq8Y01GV6rrW2JO/NTkS5vAu5Vq+O2OxoCCqA4GVDfHksiBLoSV+ZphfmlwAtdYC3RbJWl5m1hpVhxxpbECPQh7szU9YCTAJUXsYwbAb0SK+1OBeNvGLerZXsXg7gzDxVwoYgYhbJZxoXAb0MVzDcAN43LtTq9iUncGQJKDlDB6qfUCYmtXoDAr4Azwm6CyGspBIEhiDtzTYkD+gY+rBBfbUZzBBT8r6erM3eaY5b0yCGJO3NE8coKnVTRcYVNWspF4DLgXcD7yzXRlgmBFMSdIa14Z3WG1yq04p0tZSDwTeB9oeud92DLmJO5VqQk7kJjjgCODMnyc430AdER+CHwAeAC4PvRR/eAgyOQi7gzx5Q4r1BKrUQ7mGPY6Vb88EWBsEqxs1SMQG7iLoTuwJCv+fiK8SzN9F8EsoqwXyrNONvTHYGSiDvzQnm+qmC/L7APcO/u7k3yTO2zfjg8WZVWZxkhAiUSdzHMOwQC7w1sN8I5iOGSvlkvBy4GPhljQI9RNgI1EHchgmsDe4Un8p6Awi2nKD8APr/g5wD/iV0FtRF38fQ8FNgJ0FNZP6UdjlFmT9QZWU3UMc5yC59qJ+5iV/U9LCLvCDw81GXeoAUeuQ/Vk/Qq4BpA5V709wrg1tyGWX9ZCIyNuEuhuyqwJaAysZuHvwrHVDVKkVrVKlOJYn/VPlI/pcNdG/ZRRdIrUxlhPfUjMAXizpulVUJZWZFYP0V1rQWsFvKM/yb81XGz318Bfwo/pbrN/lt/Z/++ZRFJXfx73kz4/zdGwMRtDJUPNALlIGDiljMXtsQINEbAxG0MlQ80AuUgYOKWMxe2xAg0RsDEbQyVDzQC5SBg4pYzF7bECDRG4P8A3SKu5/rwGYoAAAAASUVORK5CYII=",
//     // };
//     // const myChart = echarts.init(wordCloudRef.current);
//     // //温馨提示：image 选取有严格要求不可过大；，否则firefox不兼容  iconfont上面的图标可以
//     // // var maskImage = new Image();
//     // // maskImage.src = data.image;

//     // myChart.setOption({
//     //   backgroundColor: "#fff",
//     //   tooltip: {
//     //     show: false,
//     //   },
//     //   series: [
//     //     {
//     //       type: "wordCloud",
//     //       gridSize: 1,
//     //       sizeRange: [12, 55],
//     //       rotationRange: [-45, 0, 45, 90],
//     //       // maskImage: maskImage,
//     //       textStyle: {
//     //         normal: {
//     //           color: function () {
//     //             return (
//     //               "rgb(" +
//     //               Math.round(Math.random() * 255) +
//     //               ", " +
//     //               Math.round(Math.random() * 255) +
//     //               ", " +
//     //               Math.round(Math.random() * 255) +
//     //               ")"
//     //             );
//     //           },
//     //         },
//     //       },
//     //       left: "center",
//     //       top: "center",
//     //       // width: '96%',
//     //       // height: '100%',
//     //       right: null,
//     //       bottom: null,
//     //       // width: 300,
//     //       // height: 200,
//     //       // top: 20,
//     //       data: data.value,
//     //     },
//     //   ],
//     // });
//   }, []);

//   return <div ref={wordCloudRef} />;
// }
