/* 马来语学习 · 课程数据
 * 来源：用户上传的 MPU1012 课件（T1）
 * 每条内容标注课件页码；未覆盖的内容不虚构。
 */
window.COURSE = {
  exam: {
    title: "Listening & Writing Assessment",
    weight: "30%",
    start: "2026-12-07",
    end: "2026-12-11",
    note: "课内时间，具体日期以 Moodle 通知为准",
    parts: [
      { name: "听写拼写", marks: 10 },
      { name: "词汇翻译", marks: 10 },
      { name: "听力理解", marks: 5 },
      { name: "看图造句", marks: 5 }
    ],
    others: [
      { name: "Final Project（视频）", weight: "40%", due: "12 月 25 日 17:00" },
      { name: "Quiz", weight: "30%", due: "时间待定" }
    ]
  },
  images: {
    "u04:kepala": "img/u04-kepala.jpg",
    "u04:tangan": "img/u04-tangan.jpg",
    "u04:kaki": "img/u04-kaki.jpg",
    "u04:mulut": "img/u04-mulut.jpg",
    "u04:mata": "img/u04-mata.jpg",
    "u04:hidung": "img/u04-hidung.jpg",
    "u04:rambut": "img/u04-rambut.jpg",
    "u04:telinga": "img/u04-telinga.jpg",
    "u04:pipi": "img/u04-pipi.jpg",
    "u04:gigi": "img/u04-gigi.jpg",
    "u04:bibir": "img/u04-bibir.jpg",
    "u04:lidah": "img/u04-lidah.jpg",
    "u04:jari": "img/u04-jari.jpg",
    "u05:ibu": "img/u05-ibu.jpg",
    "u05:bapa": "img/u05-bapa.jpg",
    "u05:abang": "img/u05-abang.jpg",
    "u05:kakak": "img/u05-kakak.jpg",
    "u05:adik": "img/u05-adik-lelaki.jpg",
    "u05:nenek": "img/u05-nenek.jpg",
    "u05:datuk": "img/u05-datuk.jpg"
  },
  lessons: [
    {
      id: "u01", week: 1, code: "L1",
      title: "Bunyi dan Sebutan I",
      zh: "语音与拼读",
      file: "LESSON 1 - BUNYI DAN SEBUTAN I.pdf",
      status: "ready",
      vocab: [
        { ms: "abang", zh: "哥哥", pos: "名词", syl: "a-bang", page: 21, note: "元音 a" },
        { ms: "anda", zh: "您", pos: "代词", syl: "an-da", page: 21, note: "元音 a" },
        { ms: "saya", zh: "我", pos: "代词", syl: "sa-ya", page: 21, note: "元音 a" },
        { ms: "empat", zh: "四", pos: "数词", syl: "em-pat", page: 21, note: "e pepet（弱）" },
        { ms: "emas", zh: "金子", pos: "名词", syl: "e-mas", page: 21, note: "e pepet（弱）" },
        { ms: "kelas", zh: "班级", pos: "名词", syl: "ke-las", page: 21, note: "e pepet（弱）" },
        { ms: "boleh", zh: "可以", pos: "助动词", syl: "bo-leh", page: 21, note: "e taling（清晰）" },
        { ms: "ini", zh: "这", pos: "代词", syl: "i-ni", page: 21, note: "元音 i" },
        { ms: "lima", zh: "五", pos: "数词", syl: "li-ma", page: 21, note: "元音 i" },
        { ms: "hari", zh: "天；日", pos: "名词", syl: "ha-ri", page: 21, note: "元音 i" },
        { ms: "orang", zh: "人", pos: "名词", syl: "o-rang", page: 21, note: "元音 o" },
        { ms: "ombak", zh: "浪", pos: "名词", syl: "om-bak", page: 21, note: "元音 o" },
        { ms: "ubat", zh: "药", pos: "名词", syl: "u-bat", page: 21, note: "元音 u" },
        { ms: "hujan", zh: "雨", pos: "名词", syl: "hu-jan", page: 21, note: "元音 u" },
        { ms: "buku", zh: "书", pos: "名词", syl: "bu-ku", page: 21, note: "元音 u" },
        { ms: "air", zh: "水", pos: "名词", syl: "a-ir", page: 29, note: "双元音 ai" },
        { ms: "pulau", zh: "岛", pos: "名词", syl: "pu-lau", page: 29, note: "双元音 au" },
        { ms: "limau", zh: "柠檬", pos: "名词", syl: "li-mau", page: 29, note: "双元音 au" },
        { ms: "pandai", zh: "聪明", pos: "形容词", syl: "pan-dai", page: 29, note: "双元音 ai" }
      ],
      groups: [
        { title: "元音 a 与 e", words: ["abang", "anda", "saya", "empat", "emas", "kelas", "boleh"] },
        { title: "元音 i、o、u", words: ["ini", "lima", "hari", "orang", "ombak", "ubat", "hujan", "buku"] },
        { title: "双元音 ai、au", words: ["air", "pulau", "limau", "pandai"] }
      ],
      sentences: [],
      dictation: { numbers: false, currency: false, time: false }
    },
    {
      id: "u02", week: 2, code: "L2",
      title: "Bunyi dan Sebutan II",
      zh: "数字、货币、时间",
      file: "LESSON 2 - BUNYI DAN SEBUTAN II-2.pdf",
      status: "ready",
      vocab: [
        { ms: "sifar", zh: "零", pos: "数词", syl: "si-far", page: 5 },
        { ms: "kosong", zh: "零（口语）", pos: "数词", syl: "ko-song", page: 5 },
        { ms: "satu", zh: "一", pos: "数词", syl: "sa-tu", page: 5 },
        { ms: "dua", zh: "二", pos: "数词", syl: "dua", page: 5 },
        { ms: "tiga", zh: "三", pos: "数词", syl: "ti-ga", page: 5 },
        { ms: "empat", zh: "四", pos: "数词", syl: "em-pat", page: 5 },
        { ms: "lima", zh: "五", pos: "数词", syl: "li-ma", page: 5 },
        { ms: "enam", zh: "六", pos: "数词", syl: "e-nam", page: 5 },
        { ms: "tujuh", zh: "七", pos: "数词", syl: "tu-juh", page: 5 },
        { ms: "lapan", zh: "八", pos: "数词", syl: "la-pan", page: 5 },
        { ms: "sembilan", zh: "九", pos: "数词", syl: "sem-bi-lan", page: 5 },
        { ms: "sepuluh", zh: "十", pos: "数词", syl: "se-pu-luh", page: 7 },
        { ms: "sebelas", zh: "十一", pos: "数词", syl: "se-be-las", page: 7 },
        { ms: "seratus", zh: "一百", pos: "数词", syl: "se-ra-tus", page: 7 },
        { ms: "seribu", zh: "一千", pos: "数词", syl: "se-ri-bu", page: 7 },
        { ms: "ringgit", zh: "令吉", pos: "名词", syl: "ring-git", page: 18 },
        { ms: "sen", zh: "仙（分）", pos: "名词", syl: "sen", page: 18 },
        { ms: "jam", zh: "小时；钟点", pos: "名词", syl: "jam", page: 31 },
        { ms: "minit", zh: "分钟", pos: "名词", syl: "mi-nit", page: 31 },
        { ms: "pukul", zh: "……点（钟点）", pos: "名词", syl: "pu-kul", page: 31 },
        { ms: "pagi", zh: "早上", pos: "名词", syl: "pa-gi", page: 31 },
        { ms: "tengah hari", zh: "中午", pos: "短语", syl: "te-ngah ha-ri", page: 31 },
        { ms: "petang", zh: "下午", pos: "名词", syl: "pe-tang", page: 31 },
        { ms: "malam", zh: "晚上", pos: "名词", syl: "ma-lam", page: 31 },
        { ms: "hari", zh: "天；日", pos: "名词", syl: "ha-ri", page: 34 },
        { ms: "orang", zh: "量词：人", pos: "量词", syl: "o-rang", page: 38 },
        { ms: "ekor", zh: "量词：动物", pos: "量词", syl: "e-kor", page: 38 },
        { ms: "buah", zh: "量词：大型物体", pos: "量词", syl: "bu-ah", page: 38 },
        { ms: "biji", zh: "量词：圆形小物、果实", pos: "量词", syl: "bi-ji", page: 39 },
        { ms: "batang", zh: "量词：长条物", pos: "量词", syl: "ba-tang", page: 39 }
      ],
      groups: [
        { title: "数字", words: ["sifar", "kosong", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "lapan", "sembilan", "sepuluh", "sebelas", "seratus", "seribu"] },
        { title: "货币与时间", words: ["ringgit", "sen", "jam", "minit", "pukul", "pagi", "tengah hari", "petang", "malam"] },
        { title: "量词与日期", words: ["hari", "orang", "ekor", "buah", "biji", "batang"] }
      ],
      sentences: [
        { ms: "Di situ ada lima orang pelajar.", zh: "那里有五名学生。", page: 40,
          note: "存在句：地点 + ada + 数量 + 名词。量词 orang 用于人，不能省略。" }
      ],
      dictation: { numbers: true, currency: true, time: true }
    },
    {
      id: "u03", week: 3, code: "L3",
      title: "Saya, Kawan dan Keluarga I",
      zh: "问候与自我介绍",
      file: "LESSON 3 - SAYA, KAWAN DAN KELUARGA I.pdf",
      status: "ready",
      vocab: [
        { ms: "selamat pagi", zh: "早上好", pos: "短语", syl: "se-la-mat pa-gi", page: 15 },
        { ms: "selamat tinggal", zh: "再见（离开的人说）", pos: "短语", syl: "se-la-mat ting-gal", page: 6 },
        { ms: "jumpa lagi", zh: "再见（留下的人说）", pos: "短语", syl: "jum-pa la-gi", page: 6 },
        { ms: "terima kasih", zh: "谢谢", pos: "短语", syl: "te-ri-ma ka-sih", page: 7 },
        { ms: "sama-sama", zh: "不客气", pos: "短语", syl: "sa-ma sa-ma", page: 7 },
        { ms: "maaf", zh: "对不起", pos: "名词", syl: "ma-af", page: 8 },
        { ms: "tolong", zh: "请帮忙", pos: "动词", syl: "to-long", page: 8 },
        { ms: "apa khabar", zh: "你好吗", pos: "短语", syl: "a-pa kha-bar", page: 9 },
        { ms: "khabar baik", zh: "很好", pos: "短语", syl: "kha-bar ba-ik", page: 9 },
        { ms: "gembira", zh: "高兴", pos: "形容词", syl: "gem-bi-ra", page: 10 },
        { ms: "berkenalan", zh: "认识、结识", pos: "动词", syl: "ber-ke-na-lan", page: 10 },
        { ms: "nama", zh: "名字", pos: "名词", syl: "na-ma", page: 15 },
        { ms: "umur", zh: "年龄", pos: "名词", syl: "u-mur", page: 15 },
        { ms: "tahun", zh: "年；岁", pos: "名词", syl: "ta-hun", page: 15 },
        { ms: "berasal", zh: "来自", pos: "动词", syl: "be-ra-sal", page: 15 },
        { ms: "dari", zh: "从（地点）", pos: "介词", syl: "da-ri", page: 15 },
        { ms: "tinggal", zh: "居住", pos: "动词", syl: "ting-gal", page: 16 },
        { ms: "di", zh: "在（地点）", pos: "介词", syl: "di", page: 16 },
        { ms: "asrama", zh: "宿舍", pos: "名词", syl: "as-ra-ma", page: 16 },
        { ms: "belajar", zh: "学习", pos: "动词", syl: "be-la-jar", page: 16 },
        { ms: "universiti", zh: "大学", pos: "名词", syl: "u-ni-ver-si-ti", page: 16 },
        { ms: "saya", zh: "我", pos: "代词", syl: "sa-ya", page: 22 },
        { ms: "aku", zh: "我（对亲密的人）", pos: "代词", syl: "a-ku", page: 22 },
        { ms: "kita", zh: "我们（含对方）", pos: "代词", syl: "ki-ta", page: 22 },
        { ms: "kami", zh: "我们（不含对方）", pos: "代词", syl: "ka-mi", page: 22 },
        { ms: "anda", zh: "您", pos: "代词", syl: "an-da", page: 23 },
        { ms: "kamu", zh: "你（平辈）", pos: "代词", syl: "ka-mu", page: 23 },
        { ms: "awak", zh: "你（亲近）", pos: "代词", syl: "a-wak", page: 23 },
        { ms: "dia", zh: "他 / 她", pos: "代词", syl: "di-a", page: 24 },
        { ms: "mereka", zh: "他们", pos: "代词", syl: "me-re-ka", page: 24 },
        { ms: "beliau", zh: "他 / 她（尊称）", pos: "代词", syl: "be-liau", page: 24 }
      ],
      groups: [
        { title: "问候与寒暄", words: ["selamat pagi", "selamat tinggal", "jumpa lagi", "terima kasih", "sama-sama", "maaf", "tolong", "apa khabar", "khabar baik", "gembira", "berkenalan"] },
        { title: "自我介绍", words: ["nama", "umur", "tahun", "berasal", "dari", "tinggal", "di", "asrama", "belajar", "universiti"] },
        { title: "人称代词", words: ["saya", "aku", "kita", "kami", "anda", "kamu", "awak", "dia", "mereka", "beliau"] }
      ],
      sentences: [
        { ms: "Nama saya Siti.", zh: "我叫 Siti。", page: 15,
          note: "「名词 + 名词」表示所属：Nama + 人 = 某人的名字，不用「的」。" },
        { ms: "Umur saya 25 tahun.", zh: "我 25 岁。", page: 15,
          note: "年龄句式：Umur + 人 + 数字 + tahun，句中不加「是」。" },
        { ms: "Saya berasal dari Kuala Lumpur.", zh: "我来自吉隆坡。", page: 15,
          note: "berasal dari 是固定搭配，表示「来自某地」。" },
        { ms: "Saya belajar di Universiti Xiamen Malaysia.", zh: "我在厦门大学马来西亚分校学习。", page: 16,
          note: "di + 地点，介词短语放在动词之后。" },
        { ms: "Saya tinggal di asrama.", zh: "我住在宿舍。", page: 16,
          note: "tinggal di + 地点 = 住在某处。" },
        { ms: "Gembira berkenalan dengan awak.", zh: "很高兴认识你。", page: 15,
          note: "berkenalan dengan 是固定搭配；主语省略，完整可说 Saya gembira berkenalan dengan awak." },
        { ms: "Saya pelajar universiti.", zh: "我是大学生。", page: 22,
          note: "名词谓语句：主语 + 名词，不用 adalah。" }
      ],
      dictation: { numbers: false, currency: false, time: false }
    },
    {
      id: "u04", week: 4, code: "L4",
      title: "Saya, Kawan dan Keluarga II",
      zh: "身体与形容词",
      file: "LESSON 4 - SAYA, KAWAN DAN KELUARGA II.pdf",
      status: "ready",
      vocab: [
        { ms: "kepala", zh: "头", pos: "名词", syl: "ke-pa-la", page: 6 },
        { ms: "tangan", zh: "手", pos: "名词", syl: "ta-ngan", page: 6 },
        { ms: "kaki", zh: "腿；脚", pos: "名词", syl: "ka-ki", page: 6 },
        { ms: "mulut", zh: "嘴", pos: "名词", syl: "mu-lut", page: 6 },
        { ms: "mata", zh: "眼睛", pos: "名词", syl: "ma-ta", page: 7 },
        { ms: "hidung", zh: "鼻子", pos: "名词", syl: "hi-dung", page: 7 },
        { ms: "rambut", zh: "头发", pos: "名词", syl: "ram-but", page: 7 },
        { ms: "telinga", zh: "耳朵", pos: "名词", syl: "te-li-nga", page: 7 },
        { ms: "pipi", zh: "脸颊", pos: "名词", syl: "pi-pi", page: 7 },
        { ms: "gigi", zh: "牙齿", pos: "名词", syl: "gi-gi", page: 8 },
        { ms: "bibir", zh: "嘴唇", pos: "名词", syl: "bi-bir", page: 8 },
        { ms: "lidah", zh: "舌头", pos: "名词", syl: "li-dah", page: 8 },
        { ms: "jari", zh: "手指", pos: "名词", syl: "ja-ri", page: 9 },
        { ms: "tinggi", zh: "高", pos: "形容词", syl: "ting-gi", page: 12 },
        { ms: "rendah", zh: "矮", pos: "形容词", syl: "ren-dah", page: 12 },
        { ms: "sangat", zh: "很", pos: "副词", syl: "sa-ngat", page: 11 },
        { ms: "kurang", zh: "不太", pos: "副词", syl: "ku-rang", page: 11 },
        { ms: "tidak", zh: "不", pos: "副词", syl: "ti-dak", page: 11 }
      ],
      groups: [
        { title: "身体部位", words: ["kepala", "tangan", "kaki", "mulut", "mata", "hidung", "rambut", "telinga", "pipi", "gigi", "bibir", "lidah", "jari"] },
        { title: "形容词与程度", words: ["tinggi", "rendah", "sangat", "kurang", "tidak"] }
      ],
      sentences: [
        { ms: "Saya tinggi.", zh: "我个子高。", page: 12,
          note: "形容词谓语句：主语 + 形容词，不用「是」。" },
        { ms: "Dia sangat rendah.", zh: "他很矮。", page: 12,
          note: "程度副词 sangat 放在形容词之前。" },
        { ms: "Ini pen saya.", zh: "这是我的笔。", page: 5,
          note: "指示词 ini + 名词 + 所有者，表示「这是……的……」。" }
      ],
      dictation: { numbers: false, currency: false, time: false }
    },
    {
      id: "u05", week: 5, code: "L5",
      title: "Saya, Kawan dan Keluarga III",
      zh: "朋友、家人与疑问词",
      file: "LESSON 5 -SAYA, KAWAN DAN KELUARGA III.pdf",
      status: "partial",
      vocab: [
        { ms: "kawan", zh: "朋友", pos: "名词", syl: "ka-wan", page: 4 },
        { ms: "sahabat", zh: "好友", pos: "名词", syl: "sa-ha-bat", page: 4 },
        { ms: "teman", zh: "同伴", pos: "名词", syl: "te-man", page: 4 },
        { ms: "ibu", zh: "妈妈", pos: "名词", syl: "i-bu", page: 9 },
        { ms: "bapa", zh: "爸爸", pos: "名词", syl: "ba-pa", page: 9 },
        { ms: "abang", zh: "哥哥", pos: "名词", syl: "a-bang", page: 10 },
        { ms: "kakak", zh: "姐姐", pos: "名词", syl: "ka-kak", page: 10 },
        { ms: "adik", zh: "弟弟 / 妹妹", pos: "名词", syl: "a-dik", page: 11 },
        { ms: "nenek", zh: "奶奶 / 外婆", pos: "名词", syl: "ne-nek", page: 8 },
        { ms: "datuk", zh: "爷爷 / 外公", pos: "名词", syl: "da-tuk", page: 8 },
        { ms: "sepupu", zh: "表 / 堂兄弟姐妹", pos: "名词", syl: "se-pu-pu", page: 12 },
        { ms: "apa", zh: "什么", pos: "疑问词", syl: "a-pa", page: 18 },
        { ms: "siapa", zh: "谁", pos: "疑问词", syl: "si-a-pa", page: 18 },
        { ms: "di mana", zh: "在哪里", pos: "疑问词", syl: "di ma-na", page: 18 },
        { ms: "bila", zh: "什么时候", pos: "疑问词", syl: "bi-la", page: 18 },
        { ms: "mengapa", zh: "为什么", pos: "疑问词", syl: "me-nga-pa", page: 18 },
        { ms: "bagaimana", zh: "怎么样", pos: "疑问词", syl: "ba-gai-ma-na", page: 18 },
        { ms: "berapa", zh: "多少", pos: "疑问词", syl: "be-ra-pa", page: 18 }
      ],
      groups: [
        { title: "朋友与家人", words: ["kawan", "sahabat", "teman", "ibu", "bapa", "abang", "kakak", "adik", "nenek", "datuk", "sepupu"] },
        { title: "疑问词", words: ["apa", "siapa", "di mana", "bila", "mengapa", "bagaimana", "berapa"] }
      ],
      sentences: [
        { ms: "Siapakah nama anda?", zh: "您叫什么名字？", page: 19,
          note: "-kah 附着在疑问词后，使问句更正式；口语也可说 Siapa nama anda?" },
        { ms: "Di mana kamu tinggal?", zh: "你住在哪里？", page: 20,
          note: "疑问词 di mana 放句首，后面语序不变。" },
        { ms: "Apa hobi awak?", zh: "你的爱好是什么？", page: 22,
          note: "apa 放句首，后面接名词；马来语疑问句不倒装。" }
      ],
      dictation: { numbers: false, currency: false, time: false }
    },
    {
      id: "u06", week: 6, code: "L6",
      title: "Persekitaran I",
      zh: "日常活动与介词",
      file: "UPDATED LESSON 6  7 - PERSEKITARAN I  II.pdf",
      status: "pending",
      vocab: [],
      sentences: [],
      dictation: { numbers: false, currency: false, time: false }
    },
    {
      id: "u07", week: 8, code: "L8–9",
      title: "Persekitaran III & IV",
      zh: "饮食与购物",
      file: "UPDATED LESSON 8  9 - PERSEKITARAN III  IV.pdf",
      status: "pending",
      vocab: [],
      sentences: [],
      dictation: { numbers: false, currency: false, time: false }
    },
    {
      id: "u08", week: 10, code: "L10",
      title: "Situasi Perbualan I",
      zh: "电话对话",
      file: "LESSON 10, 11  12 - SITUASI PERBUALAN.pdf",
      status: "pending",
      vocab: [],
      sentences: [],
      dictation: { numbers: false, currency: false, time: false }
    },
    {
      id: "u09", week: 13, code: "L13–14",
      title: "Percutian I & II",
      zh: "旅行与方向",
      file: "LESSON 13  14 - PERCUTIAN I  II.pdf",
      status: "pending",
      vocab: [],
      sentences: [],
      dictation: { numbers: false, currency: false, time: false }
    }
  ]
};
