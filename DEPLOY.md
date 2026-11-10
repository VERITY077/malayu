# 部署与登录同步指南

目标：把 `app/` 发布成公网地址，并让每个用户用自己的账号保存进度。

GitHub Pages 只能托管静态文件，不能存数据，所以架构是：

```
GitHub Pages（前端）  ──►  Supabase（账号 + 进度存储）
```

不配置 Supabase 时，应用自动退回「本机模式」：进度只存在访问者自己的浏览器里，不需要登录。

---

## 一、先跑通本机模式

```bash
cd app
python3 -m http.server 8080
```

打开 <http://localhost:8080>，确认功能正常。此时进度存在 localStorage。

---

## 二、开通 Supabase（约 10 分钟）

1. 注册 <https://supabase.com>，新建项目，记下：
   - Project URL（形如 `https://xxxx.supabase.co`）
   - anon public key（Settings → API）

2. 打开 SQL Editor，执行：

```sql
create table if not exists public.progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

create policy "select own" on public.progress
  for select using (auth.uid() = user_id);

create policy "insert own" on public.progress
  for insert with check (auth.uid() = user_id);

create policy "update own" on public.progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

3. Authentication → URL Configuration：
   - **Site URL** 填你的正式地址，例如 `https://你的用户名.github.io/malay/`
   - **Redirect URLs** 加入同一个地址（可再加 `http://localhost:8080/` 方便本地测试）

4. Authentication → Providers → Email：保持开启。
   默认邮件服务有频率限制（每小时几封），正式上线建议在 Settings → Auth → SMTP 配自己的邮箱服务。

5. **让邮件包含 6 位验证码**（手机收信、电脑登录必需）：

   Authentication → Email Templates → **Magic Link**，把模板改成：

```html
<div style="font-family:-apple-system,'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#16211e;">
  <h2 style="margin:0 0 4px;font-size:20px;">登录验证码 · Sign-in code</h2>
  <p style="margin:0 0 20px;color:#6b7a75;font-size:14px;">马来语学习 · Malay Learning</p>

  <p style="margin:0 0 6px;">你的验证码是：</p>
  <p style="margin:0 0 4px;font-size:32px;font-weight:700;letter-spacing:8px;color:#0e7c66;">{{ .Token }}</p>
  <p style="margin:0 0 20px;color:#6b7a75;font-size:12px;">Your verification code is shown above.</p>

  <p style="margin:0 0 6px;">把上面的验证码填到网页输入框即可登录。</p>
  <p style="margin:0 0 20px;color:#6b7a75;font-size:13px;">Enter the code from this email on the website to sign in.</p>

  <p style="margin:0 0 6px;">也可以直接点链接登录：</p>
  <p style="margin:0 0 20px;"><a href="{{ .ConfirmationURL }}" style="color:#0e7c66;">直接登录 · Sign in directly</a></p>

  <hr style="border:none;border-top:1px solid #e2e8e3;margin:24px 0;">
  <p style="margin:0;color:#6b7a75;font-size:12px;">
    如果不是你本人操作，忽略这封邮件即可。<br>
    If you didn't request this, you can safely ignore this email.
  </p>
</div>
```

   标题建议：`马来语学习 · 登录验证码 / Your sign-in code`

   默认模板只有链接没有验证码。改完之后，登录框会出现「6 位验证码」输入框，在电脑上填手机收到的码即可，不需要把链接传来传去。

---

## 三、填入配置

编辑 `app/config.js`：

```js
window.SUPABASE_CONFIG = {
  url: "https://xxxx.supabase.co",
  anonKey: "eyJhbGciOi..."
};
```

anon key 是公开的，放在前端没问题；数据安全由上面的 RLS 策略保证。

刷新页面后，右上角会出现「登录」。输入邮箱 → 收到登录链接 → 点击后回到页面，进度开始同步。

---

## 四、发布到 GitHub Pages

1. 新建仓库，把 `app/` 里的**全部文件**复制到仓库根目录：

```
index.html
styles.css
app.js
data.js
cloud.js
config.js
img/
README.md
```

2. 推送到 GitHub。
3. 仓库 Settings → Pages → Source 选 `Deploy from a branch`，分支 `main`，目录 `/ (root)`。
4. 等一两分钟，访问 `https://你的用户名.github.io/仓库名/`。

> 注意：`config.js` 里的地址要和 Pages 的实际地址一致，否则登录链接会跳错。

---

## 五、同步规则

- 未登录：只写本机 localStorage。
- 登录后：
  - 云端没有记录 → 把本机进度上传。
  - 云端有记录 → 比较 `updatedAt`，取较新的那份。
  - 之后每次操作，800ms 防抖后写回云端。
- 退出登录：继续用本机进度，不删除云端数据。

冲突处理是「最后写入者胜」。同一账号在多设备同时学，可能丢少量进度；单人使用没有影响。

---

## 六、隐私与合规

公开运营时，至少要做到：

- 收集的数据：邮箱 + 学习进度 JSON（词汇掌握阶段、正确率、连续天数）。
- 不收集：录音、位置、设备标识。
- 提供账号删除方式（Supabase 后台删 `auth.users` 对应行即可级联删除进度）。
- 页面加隐私政策链接。
- 面向中国大陆用户时，注意《个人信息保护法》对境外存储的要求；Supabase 节点在境外，可能需要额外评估。

---

## 七、费用

Supabase 免费额度：500MB 数据库、5 万月活用户。学习进度是几 KB 的 JSON，正常使用远低于额度。

GitHub Pages 免费，公开仓库即可。

---

## 八、常见问题

**登录链接点开没反应？**
检查 Site URL 和 Redirect URLs 是否与访问地址完全一致（含结尾斜杠）。

**收不到邮件？**
Supabase 默认邮件服务有频率限制，等一会儿或用别的邮箱；正式上线配置自有 SMTP。

**换设备后进度没过来？**
确认两边登录的是同一个邮箱；首次登录时本机进度会被上传，云端较新时才会覆盖本机。

**想彻底不用后端？**
把 `config.js` 留空即可，所有人只能本机保存。
