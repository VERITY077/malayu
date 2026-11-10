# AI 生成图存放处

把生成好的图片放在这个目录，文件名必须匹配：

```
{课次ID}-{单词 slug}.jpg
```

例：

```
u01-anda.jpg
u03-selamat-pagi.jpg
u05-tengah-hari.jpg
```

规则：

- 尺寸 360×360，JPG，尽量小于 50KB
- slug = 单词小写，非字母数字换成 `-`，去掉首尾 `-`
- 放进来后刷新页面即自动生效，不需要改代码
- 优先级：课件原图 > AI 图 > 首字母占位

完整的 89 条清单（文件名、单词、中文、中英文提示词）见
[`docs/ai-image-prompts.csv`](../../docs/ai-image-prompts.csv)。

生成建议：一次生成 10–15 张，先看风格是否统一，再批量做。
