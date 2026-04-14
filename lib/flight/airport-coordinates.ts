// 中国主要机场坐标数据
export const airportCoordinates: Record<string, { lat: number; lng: number; name: string; iata?: string }> = {
  // 华北地区
  "北京首都国际机场": { lat: 40.0799, lng: 116.6031, name: "北京首都国际机场", iata: "PEK" },
  "北京大兴国际机场": { lat: 39.5094, lng: 116.4108, name: "北京大兴国际机场", iata: "PKX" },
  "天津滨海国际机场": { lat: 39.1244, lng: 117.3462, name: "天津滨海国际机场", iata: "TSN" },
  "石家庄正定国际机场": { lat: 38.2807, lng: 114.6973, name: "石家庄正定国际机场", iata: "SJW" },
  "太原武宿国际机场": { lat: 37.7469, lng: 112.6281, name: "太原武宿国际机场", iata: "TYN" },
  "呼和浩特白塔国际机场": { lat: 40.8516, lng: 111.8242, name: "呼和浩特白塔国际机场", iata: "HET" },
  
  // 东北地区
  "沈阳桃仙国际机场": { lat: 41.6398, lng: 123.4831, name: "沈阳桃仙国际机场", iata: "SHE" },
  "大连周水子国际机场": { lat: 38.9656, lng: 121.5386, name: "大连周水子国际机场", iata: "DLC" },
  "长春龙嘉国际机场": { lat: 43.9958, lng: 125.6847, name: "长春龙嘉国际机场", iata: "CGQ" },
  "哈尔滨太平国际机场": { lat: 45.6236, lng: 126.2503, name: "哈尔滨太平国际机场", iata: "HRB" },
  
  // 华东地区
  "上海浦东国际机场": { lat: 31.1434, lng: 121.8052, name: "上海浦东国际机场", iata: "PVG" },
  "上海虹桥国际机场": { lat: 31.1979, lng: 121.3362, name: "上海虹桥国际机场", iata: "SHA" },
  "南京禄口国际机场": { lat: 31.7420, lng: 118.8621, name: "南京禄口国际机场", iata: "NKG" },
  "杭州萧山国际机场": { lat: 30.2295, lng: 120.4343, name: "杭州萧山国际机场", iata: "HGH" },
  "合肥新桥国际机场": { lat: 31.9900, lng: 116.9761, name: "合肥新桥国际机场", iata: "HFE" },
  "福州长乐国际机场": { lat: 25.9351, lng: 119.6633, name: "福州长乐国际机场", iata: "FOC" },
  "南昌昌北国际机场": { lat: 28.8650, lng: 115.9006, name: "南昌昌北国际机场", iata: "KHN" },
  "济南遥墙国际机场": { lat: 36.8572, lng: 117.2161, name: "济南遥墙国际机场", iata: "TNA" },
  "青岛胶东国际机场": { lat: 36.3611, lng: 120.0875, name: "青岛胶东国际机场", iata: "TAO" },
  "厦门高崎国际机场": { lat: 24.5444, lng: 118.1278, name: "厦门高崎国际机场", iata: "XMN" },
  "宁波栎社国际机场": { lat: 29.8267, lng: 121.4619, name: "宁波栎社国际机场", iata: "NGB" },
  "温州龙湾国际机场": { lat: 27.9122, lng: 120.8519, name: "温州龙湾国际机场", iata: "WNZ" },
  "无锡苏南硕放国际机场": { lat: 31.4944, lng: 120.4294, name: "无锡苏南硕放国际机场", iata: "WUX" },
  
  // 中南地区
  "武汉天河国际机场": { lat: 30.7838, lng: 114.2081, name: "武汉天河国际机场", iata: "WUH" },
  "长沙黄花国际机场": { lat: 28.1892, lng: 113.2200, name: "长沙黄花国际机场", iata: "CSX" },
  "广州白云国际机场": { lat: 23.3924, lng: 113.2988, name: "广州白云国际机场", iata: "CAN" },
  "深圳宝安国际机场": { lat: 22.6393, lng: 113.8106, name: "深圳宝安国际机场", iata: "SZX" },
  "南宁吴圩国际机场": { lat: 22.6084, lng: 108.1729, name: "南宁吴圩国际机场", iata: "NNG" },
  "海口美兰国际机场": { lat: 19.9349, lng: 110.4589, name: "海口美兰国际机场", iata: "HAK" },
  "三亚凤凰国际机场": { lat: 18.3029, lng: 109.4121, name: "三亚凤凰国际机场", iata: "SYX" },
  "郑州新郑国际机场": { lat: 34.5197, lng: 113.8409, name: "郑州新郑国际机场", iata: "CGO" },
  "珠海金湾机场": { lat: 22.0064, lng: 113.3764, name: "珠海金湾机场", iata: "ZUH" },
  
  // 西南地区
  "成都双流国际机场": { lat: 30.5785, lng: 103.9470, name: "成都双流国际机场", iata: "CTU" },
  "成都天府国际机场": { lat: 30.3125, lng: 104.4411, name: "成都天府国际机场", iata: "TFU" },
  "重庆江北国际机场": { lat: 29.7193, lng: 106.6417, name: "重庆江北国际机场", iata: "CKG" },
  "昆明长水国际机场": { lat: 25.0961, lng: 102.9294, name: "昆明长水国际机场", iata: "KMG" },
  "贵阳龙洞堡国际机场": { lat: 26.5385, lng: 106.8008, name: "贵阳龙洞堡国际机场", iata: "KWE" },
  "拉萨贡嘎国际机场": { lat: 29.2978, lng: 90.9119, name: "拉萨贡嘎国际机场", iata: "LXA" },
  
  // 西北地区
  "西安咸阳国际机场": { lat: 34.4371, lng: 108.7567, name: "西安咸阳国际机场", iata: "XIY" },
  "兰州中川国际机场": { lat: 36.5152, lng: 103.6204, name: "兰州中川国际机场", iata: "LHW" },
  "银川河东国际机场": { lat: 38.4819, lng: 106.0092, name: "银川河东国际机场", iata: "INC" },
  "西宁曹家堡国际机场": { lat: 36.5275, lng: 102.0428, name: "西宁曹家堡国际机场", iata: "XNN" },
  "乌鲁木齐地窝堡国际机场": { lat: 43.9071, lng: 87.4742, name: "乌鲁木齐地窝堡国际机场", iata: "URC" },
  
  // 其他主要机场
  "烟台蓬莱国际机场": { lat: 37.6597, lng: 120.9778, name: "烟台蓬莱国际机场", iata: "YNT" },
  "威海大水泊国际机场": { lat: 37.1871, lng: 122.2291, name: "威海大水泊国际机场", iata: "WEH" },
  "泉州晋江国际机场": { lat: 24.7964, lng: 118.5900, name: "泉州晋江国际机场", iata: "JJN" },
  "桂林两江国际机场": { lat: 25.2181, lng: 110.0394, name: "桂林两江国际机场", iata: "KWL" },
  "丽江三义国际机场": { lat: 26.6772, lng: 100.2461, name: "丽江三义国际机场", iata: "LJG" },
  "西双版纳嘎洒国际机场": { lat: 21.9736, lng: 100.7597, name: "西双版纳嘎洒国际机场", iata: "JHG" },
  
  // 补充缺失的机场坐标
  "北海福成机场": { lat: 21.5394, lng: 109.2940, name: "北海福成机场", iata: "BHY" },
  "万州五桥机场": { lat: 30.8017, lng: 108.4330, name: "万州五桥机场", iata: "WXN" },
  "三明沙县机场": { lat: 26.4267, lng: 117.8344, name: "三明沙县机场", iata: "SQJ" },
  "上饶三清山机场": { lat: 28.3797, lng: 117.9643, name: "上饶三清山机场", iata: "SQD" },
  "东营胜利机场": { lat: 37.5077, lng: 118.7881, name: "东营胜利机场", iata: "DOY" },
  "中卫沙坡头机场": { lat: 37.5730, lng: 105.1544, name: "中卫沙坡头机场", iata: "ZHY" },
  "临沂启阳机场": { lat: 35.0466, lng: 118.4124, name: "临沂启阳机场", iata: "LYI" },
  "乌兰浩特机场": { lat: 46.1953, lng: 122.0083, name: "乌兰浩特机场", iata: "HLH" },
  "乌海机场": { lat: 39.7934, lng: 106.7993, name: "乌海机场", iata: "WUA" },
  "九江庐山机场": { lat: 29.4769, lng: 115.8011, name: "九江庐山机场", iata: "JIU" },
  "伊宁机场": { lat: 43.9558, lng: 81.3303, name: "伊宁机场", iata: "YIN" },
  "佳木斯东郊国际机场": { lat: 46.8434, lng: 130.4654, name: "佳木斯东郊国际机场", iata: "JMU" },
  "保山云瑞机场": { lat: 25.0533, lng: 99.1683, name: "保山云瑞机场", iata: "BSD" },
  "信阳明港机场": { lat: 32.5412, lng: 114.0790, name: "信阳明港机场", iata: "XAI" },
  "十堰武当山机场": { lat: 32.5916, lng: 110.9078, name: "十堰武当山机场", iata: "WDS" },
  "南充高坪机场": { lat: 30.7954, lng: 106.1622, name: "南充高坪机场", iata: "NAO" },
  "南通兴东国际机场": { lat: 32.0708, lng: 120.9759, name: "南通兴东国际机场", iata: "NTG" },
  "南阳姜营机场": { lat: 32.9808, lng: 112.6150, name: "南阳姜营机场", iata: "NNY" },
  "博乐阿拉山口机场": { lat: 44.8955, lng: 82.3000, name: "博乐阿拉山口机场", iata: "BPL" },
  "台州路桥机场": { lat: 28.5622, lng: 121.4286, name: "台州路桥机场", iata: "HYN" },
  "呼伦贝尔海拉尔东山国际机场": { lat: 49.2050, lng: 119.8250, name: "呼伦贝尔海拉尔东山国际机场", iata: "HLD" },
  "和田昆冈机场": { lat: 37.0385, lng: 79.8649, name: "和田昆冈机场", iata: "HTN" },
  "哈密机场": { lat: 42.8414, lng: 93.6692, name: "哈密机场", iata: "HMI" },
  "唐山三女河机场": { lat: 39.7178, lng: 118.0017, name: "唐山三女河机场", iata: "TVS" },
  "喀什徕宁国际机场": { lat: 39.5429, lng: 76.0200, name: "喀什徕宁国际机场", iata: "KHG" },
  "塔城机场": { lat: 46.6725, lng: 83.3408, name: "塔城机场", iata: "TCG" },
  
  // 继续补充缺失的机场坐标
  "井冈山机场": { lat: 26.8569, lng: 114.7372, name: "井冈山机场", iata: "JGS" },
  "大理凤仪机场": { lat: 25.6494, lng: 100.3192, name: "大理凤仪机场", iata: "DLU" },
  "安康富强机场": { lat: 32.7081, lng: 108.9309, name: "安康富强机场", iata: "AKA" },
  "安阳红旗渠机场": { lat: 35.8578, lng: 114.3696, name: "安阳红旗渠机场", iata: "AYN" },
  "宜昌三峡机场": { lat: 30.5566, lng: 111.4800, name: "宜昌三峡机场", iata: "YIH" },
  "宜春明月山机场": { lat: 27.8025, lng: 114.3062, name: "宜春明月山机场", iata: "YIC" },
  "岳阳三荷机场": { lat: 29.2672, lng: 113.2817, name: "岳阳三荷机场", iata: "YYA" },
  "巴中恩阳机场": { lat: 31.7383, lng: 106.6430, name: "巴中恩阳机场", iata: "BZX" },
  "巴彦淖尔天吉泰机场": { lat: 40.9260, lng: 107.7428, name: "巴彦淖尔天吉泰机场", iata: "RLK" },
  "广元盘龙机场": { lat: 32.3911, lng: 105.7020, name: "广元盘龙机场", iata: "GYS" },
  "庆阳西峰机场": { lat: 35.7997, lng: 107.6028, name: "庆阳西峰机场", iata: "IQN" },
  "库尔勒梨城机场": { lat: 41.6975, lng: 86.1289, name: "库尔勒梨城机场", iata: "KRL" },
  "库车龟兹机场": { lat: 41.7181, lng: 82.9869, name: "库车龟兹机场", iata: "KCA" },
  "延安南泥湾机场": { lat: 36.6367, lng: 109.5542, name: "延安南泥湾机场", iata: "ENY" },
  "张家口宁远机场": { lat: 40.7386, lng: 114.9303, name: "张家口宁远机场", iata: "ZQZ" },
  "张家界荷花国际机场": { lat: 29.1028, lng: 110.4433, name: "张家界荷花国际机场", iata: "DYG" },
  "张掖甘州机场": { lat: 38.8019, lng: 100.6444, name: "张掖甘州机场", iata: "YZY" },
  "徐州观音国际机场": { lat: 34.0590, lng: 117.5552, name: "徐州观音国际机场", iata: "XUZ" },
  "德宏芒市机场": { lat: 24.4011, lng: 98.5317, name: "德宏芒市机场", iata: "LUM" },
  "怀化芷江机场": { lat: 27.4411, lng: 109.7000, name: "怀化芷江机场", iata: "HJJ" },
  "恩施许家坪机场": { lat: 30.3203, lng: 109.4850, name: "恩施许家坪机场", iata: "ENH" },
  "惠州平潭机场": { lat: 23.0500, lng: 114.5994, name: "惠州平潭机场", iata: "HUZ" },
  "扬州泰州国际机场": { lat: 32.5606, lng: 119.7178, name: "扬州泰州国际机场", iata: "YTY" },
  "揭阳潮汕国际机场": { lat: 23.5520, lng: 116.5033, name: "揭阳潮汕国际机场", iata: "SWA" },
  "敦煌莫高国际机场": { lat: 40.1611, lng: 94.8092, name: "敦煌莫高国际机场", iata: "DNH" },
  "日照山字河机场": { lat: 35.4051, lng: 119.3243, name: "日照山字河机场", iata: "RIZ" },
  "昌都邦达机场": { lat: 30.5536, lng: 97.1083, name: "昌都邦达机场", iata: "BPX" },
  "林芝米林机场": { lat: 29.3033, lng: 94.3353, name: "林芝米林机场", iata: "LZY" },
  "柳州白莲机场": { lat: 24.2075, lng: 109.3910, name: "柳州白莲机场", iata: "LZH" },
  "格尔木机场": { lat: 36.4006, lng: 94.7861, name: "格尔木机场", iata: "GOQ" },
  "梅州梅县机场": { lat: 24.3500, lng: 116.1333, name: "梅州梅县机场", iata: "MXZ" },
  "榆林榆阳机场": { lat: 38.3591, lng: 109.5909, name: "榆林榆阳机场", iata: "UYN" },
  "毕节飞雄机场": { lat: 27.2670, lng: 105.4720, name: "毕节飞雄机场", iata: "BFJ" },
  "永州零陵机场": { lat: 26.3389, lng: 111.6100, name: "永州零陵机场", iata: "LLF" },
  "汉中城固机场": { lat: 33.1344, lng: 107.2068, name: "汉中城固机场", iata: "HZG" },
  "池州九华山机场": { lat: 30.7403, lng: 117.6856, name: "池州九华山机场", iata: "JUH" },
  "沧源佤山机场": { lat: 23.2756, lng: 99.3716, name: "沧源佤山机场", iata: "CWJ" },
  "泸州云龙机场": { lat: 29.1334, lng: 105.3928, name: "泸州云龙机场", iata: "LZO" },
  "洛阳北郊机场": { lat: 34.7411, lng: 112.3880, name: "洛阳北郊机场", iata: "LYA" },
  "济宁曲阜机场": { lat: 35.2928, lng: 116.3467, name: "济宁曲阜机场", iata: "JNG" },
  "淮安涟水国际机场": { lat: 33.7908, lng: 119.1250, name: "淮安涟水国际机场", iata: "HIA" },
  "湘西边城机场": { lat: 28.3272, lng: 109.5995, name: "湘西边城机场", iata: "XFN" },
  "湛江吴川机场": { lat: 21.2144, lng: 110.3583, name: "湛江吴川机场", iata: "ZHA" },
  "满洲里西郊国际机场": { lat: 49.5668, lng: 117.3300, name: "满洲里西郊国际机场", iata: "NZH" },
  "澜沧景迈机场": { lat: 22.4178, lng: 99.7867, name: "澜沧景迈机场", iata: "JMJ" },
  "牡丹江海浪国际机场": { lat: 44.5241, lng: 129.5692, name: "牡丹江海浪国际机场", iata: "MDG" },
  "玉林福绵机场": { lat: 22.4337, lng: 110.1521, name: "玉林福绵机场", iata: "YLX" },
  "玉树巴塘机场": { lat: 32.8364, lng: 97.0364, name: "玉树巴塘机场", iata: "YUS" },
  "琼海博鳌机场": { lat: 19.1383, lng: 110.4542, name: "琼海博鳌机场", iata: "BAR" },
  "盐城南洋国际机场": { lat: 33.4258, lng: 120.2031, name: "盐城南洋国际机场", iata: "YNZ" },
  "绵阳南郊机场": { lat: 31.4281, lng: 104.7409, name: "绵阳南郊机场", iata: "MIG" },
  "腾冲驼峰机场": { lat: 24.9381, lng: 98.4856, name: "腾冲驼峰机场", iata: "TCZ" },
  "舟山普陀山机场": { lat: 29.9342, lng: 122.3620, name: "舟山普陀山机场", iata: "HSN" },
  "芜湖宣州机场": { lat: 31.9478, lng: 118.6669, name: "芜湖宣州机场", iata: "WHA" },
  "荆州沙市机场": { lat: 30.3244, lng: 112.2811, name: "荆州沙市机场", iata: "SHS" },
  "菏泽牡丹机场": { lat: 35.2122, lng: 115.7342, name: "菏泽牡丹机场", iata: "HZA" },
  "衡阳南岳机场": { lat: 26.7253, lng: 112.6278, name: "衡阳南岳机场", iata: "HNY" },
  "襄阳刘集机场": { lat: 32.1506, lng: 112.2914, name: "襄阳刘集机场", iata: "XFN" },
  "赣州黄金机场": { lat: 25.8538, lng: 114.7789, name: "赣州黄金机场", iata: "KOW" },
  "赤峰玉龙机场": { lat: 42.2350, lng: 118.9075, name: "赤峰玉龙机场", iata: "CIF" },
  "达州金垭机场": { lat: 31.3102, lng: 107.4295, name: "达州金垭机场", iata: "DAX" },
  "连云港花果山机场": { lat: 34.5717, lng: 118.8738, name: "连云港花果山机场", iata: "LYG" },
  "迪庆香格里拉机场": { lat: 27.7936, lng: 99.6772, name: "迪庆香格里拉机场", iata: "DIG" },
  "通辽机场": { lat: 43.5567, lng: 122.2000, name: "通辽机场", iata: "TGO" },
  "遵义新舟机场": { lat: 27.5895, lng: 107.0007, name: "遵义新舟机场", iata: "ZYI" },
  "遵义茅台机场": { lat: 27.9692, lng: 106.3331, name: "遵义茅台机场", iata: "WMT" },
  "邢台褡裢机场": { lat: 36.8831, lng: 114.4293, name: "邢台褡裢机场", iata: "XNT" },
  "邯郸机场": { lat: 36.5258, lng: 114.4256, name: "邯郸机场", iata: "HDG" },
  "邵阳武冈机场": { lat: 26.8065, lng: 110.9202, name: "邵阳武冈机场", iata: "WGN" },
  "郴州北湖机场": { lat: 25.7614, lng: 112.9456, name: "郴州北湖机场", iata: "HCZ" },
  "锡林浩特机场": { lat: 43.9556, lng: 115.9647, name: "锡林浩特机场", iata: "XIL" },
  "阜阳西关机场": { lat: 32.8821, lng: 115.7344, name: "阜阳西关机场", iata: "FUG" },
  "阿克苏红旗坡机场": { lat: 41.2625, lng: 80.2917, name: "阿克苏红旗坡机场", iata: "AKU" },
  "陇南成县机场": { lat: 33.7900, lng: 105.7970, name: "陇南成县机场", iata: "LNL" },
  "韶关丹霞机场": { lat: 24.9598, lng: 113.4206, name: "韶关丹霞机场", iata: "HSC" },
  "鸡西兴凯湖机场": { lat: 45.2931, lng: 131.1931, name: "鸡西兴凯湖机场", iata: "JXA" },
  "黄山屯溪国际机场": { lat: 29.7333, lng: 118.2558, name: "黄山屯溪国际机场", iata: "TXN" },
  
  // 其他缺失的机场
  "二连浩特赛乌素国际机场": { lat: 43.4225, lng: 111.9775, name: "二连浩特赛乌素国际机场", iata: "ERL" },
  "于田万方机场": { lat: 36.8500, lng: 81.6670, name: "于田万方机场", iata: "YTW" },
  "图木舒克唐王城机场": { lat: 39.8664, lng: 79.1958, name: "图木舒克唐王城机场", iata: "TWC" },
  "那拉提机场": { lat: 43.4322, lng: 83.3786, name: "那拉提机场", iata: "NLT" },
  "鄂州花湖国际机场": { lat: 30.3436, lng: 114.9214, name: "鄂州花湖国际机场", iata: "EHU" },
  "阆中古城机场": { lat: 31.6313, lng: 105.9685, name: "阆中古城机场", iata: "LZJ" },
  "阿拉尔塔里木机场": { lat: 40.6309, lng: 81.3189, name: "阿拉尔塔里木机场", iata: "ACX" },
  "霍林郭勒机场": { lat: 45.4872, lng: 119.4072, name: "霍林郭勒机场", iata: "HUO" },
  "苏南硕放国际机场": { lat: 31.4944, lng: 120.4294, name: "苏南硕放国际机场", iata: "WUX" },
  
  "延吉朝阳川国际机场": { lat: 42.8828, lng: 129.4508, name: "延吉朝阳川国际机场", iata: "YNJ" },
  "包头东河机场": { lat: 40.5600, lng: 109.9975, name: "包头东河机场", iata: "BAV" },
  "鄂尔多斯伊金霍洛国际机场": { lat: 39.4936, lng: 109.8614, name: "鄂尔多斯伊金霍洛国际机场", iata: "DSN" },
  
  // 阿尔山伊尔施机场
  "阿尔山伊尔施机场": { lat: 47.3106, lng: 119.9117, name: "阿尔山伊尔施机场", iata: "YIE" },
  
  // 安庆天柱山机场
  "安庆天柱山机场": { lat: 30.5822, lng: 117.0501, name: "安庆天柱山机场", iata: "AQG" },
};

// 根据城市名获取坐标
export function getAirportCoordinatesByCity(city: string): { lat: number; lng: number; name: string; iata?: string } | undefined {
  // 直接查找城市名
  for (const [key, value] of Object.entries(airportCoordinates)) {
    if (key.includes(city) || value.name.includes(city)) {
      return value;
    }
  }
  
  // 根据城市名查找（移除"市"等后缀）
  const cityName = city.replace(/市|县|区|自治州|自治县/g, '');
  for (const [key, value] of Object.entries(airportCoordinates)) {
    if (key.includes(cityName) || value.name.includes(cityName)) {
      return value;
    }
  }
  
  // Fallback: 返回城市的默认坐标（可以根据城市名返回大概位置）
  const cityFallbackCoordinates: Record<string, { lat: number; lng: number; name: string }> = {
    "北京": { lat: 39.9042, lng: 116.4074, name: "北京市" },
    "上海": { lat: 31.2304, lng: 121.4737, name: "上海市" },
    "广州": { lat: 23.1291, lng: 113.2644, name: "广州市" },
    "深圳": { lat: 22.5431, lng: 114.0579, name: "深圳市" },
    "成都": { lat: 30.5728, lng: 104.0668, name: "成都市" },
    "重庆": { lat: 29.5313, lng: 106.5516, name: "重庆市" },
    "西安": { lat: 34.2658, lng: 108.9541, name: "西安市" },
    "杭州": { lat: 30.2741, lng: 120.1551, name: "杭州市" },
    "武汉": { lat: 30.5928, lng: 114.3055, name: "武汉市" },
    "南京": { lat: 32.0603, lng: 118.7969, name: "南京市" },
    "天津": { lat: 39.1255, lng: 117.1904, name: "天津市" },
    "长沙": { lat: 28.2282, lng: 112.9388, name: "长沙市" },
    "郑州": { lat: 34.7466, lng: 113.6253, name: "郑州市" },
    "沈阳": { lat: 41.8057, lng: 123.4315, name: "沈阳市" },
    "青岛": { lat: 36.0671, lng: 120.3826, name: "青岛市" },
    "济南": { lat: 36.6512, lng: 117.1205, name: "济南市" },
    "哈尔滨": { lat: 45.8038, lng: 126.5349, name: "哈尔滨市" },
    "大连": { lat: 38.9140, lng: 121.6147, name: "大连市" },
    "厦门": { lat: 24.4798, lng: 118.0894, name: "厦门市" },
    "太原": { lat: 37.8706, lng: 112.5489, name: "太原市" },
    "昆明": { lat: 25.0453, lng: 102.7144, name: "昆明市" },
    "贵阳": { lat: 26.6470, lng: 106.6302, name: "贵阳市" },
    "南宁": { lat: 22.8170, lng: 108.3669, name: "南宁市" },
    "兰州": { lat: 36.0611, lng: 103.8343, name: "兰州市" },
    "乌鲁木齐": { lat: 43.8256, lng: 87.6168, name: "乌鲁木齐市" },
    "呼和浩特": { lat: 40.8424, lng: 111.7498, name: "呼和浩特市" },
    "银川": { lat: 38.4879, lng: 106.2309, name: "银川市" },
    "石家庄": { lat: 38.0428, lng: 114.5149, name: "石家庄市" },
    "福州": { lat: 26.0745, lng: 119.2965, name: "福州市" },
    "南昌": { lat: 28.6829, lng: 115.8579, name: "南昌市" },
    "合肥": { lat: 31.8206, lng: 117.2272, name: "合肥市" },
    "长春": { lat: 43.8171, lng: 125.3235, name: "长春市" },
    "海口": { lat: 20.0442, lng: 110.1999, name: "海口市" },
    "拉萨": { lat: 29.6440, lng: 91.1144, name: "拉萨市" },
    "西宁": { lat: 36.6171, lng: 101.7782, name: "西宁市" },
    // 可以继续添加更多城市
  };
  
  if (cityFallbackCoordinates[cityName]) {
    console.log(`警告: 未找到 ${city} 的机场坐标，使用城市中心坐标作为fallback`);
    return { ...cityFallbackCoordinates[cityName], iata: undefined };
  }
  
  console.log(`警告: 未找到 ${city} 的任何坐标`);
  return undefined;
}

// 根据IATA代码获取坐标
export function getAirportCoordinatesByIATA(iata: string): { lat: number; lng: number; name: string; iata?: string } | undefined {
  for (const value of Object.values(airportCoordinates)) {
    if (value.iata === iata) {
      return value;
    }
  }
  return undefined;
}

// 根据机场名称获取坐标
export function getAirportCoordinatesByName(airportName: string): { lat: number; lng: number; name: string; iata?: string } | undefined {
  return airportCoordinates[airportName] || undefined;
}