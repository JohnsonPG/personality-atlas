# 人格图鉴 - MVP 产品需求文档

> ⚠️ **最高优先级 UI 约束**：所有页面视觉、样式、颜色、间距、圆角、字体、阴影、元素顺序必须 **严格逐像素对照 `/Users/pengjiansheng/Desktop/RGTJ/原型` 目录下的 HTML 原型实现，**不允许自行发挥**、不允许替换颜色、不允许调整布局。缺少任何元素视为未完成。

## Overview
- **Summary**: 一款 Taro 4.x (React + TS) 小程序前端 + Python FastAPI 后端的沉浸式关系生存模拟器。用户选择 NPD/双向情感障碍 + MBTI 共 32 种预设组合，经过 4 阶段闯关（相识→热恋→冲突→终局），通过答题+自尊值数值系统（0-100）动态推进，结束后生成五维雷达图 + 平行宇宙数据对比 + 核心知识点总结海报。
- **Purpose**: 让年轻人在虚拟恋爱/社交生死局中低成本演练人际交往，识破 NPD 煤气灯/操控等心理学陷阱，建立健康边界。
- **Target Users**: 对 MBTI、NPD、回避型依恋等心理学标签感兴趣的年轻人（18-35岁）。

## Goals
- 跑通「选标签 → 分阶段答题 → 即时反馈 → 数值系统 → 失败/胜利结算 → 复盘报告（含平行宇宙）」完整 MVP 闭环
- 32 种预设词条组合（NPD+16MBTI、双向+16MBTI）× 4 阶段，全部可玩
- **严格逐像素实现原型目录 12 个 SCREEN**（详见 Background & Context）
- 后端采用预生成题库 JSON（无实时 AI 成本），接口预留可无缝切换为真实 AI API

## Non-Goals (Out of Scope)
- 不做用户登录/注册系统（MVP 匿名会话模式）
- 不做自定义文本/文档/RAG 输入（后期扩展）
- 不做 VIP 商业化、AI 心理学导师场外指导
- 不做多模态（语音、环境音）
- 不做小程序上架/CDN 部署（只在本地 H5 可运行验证）
- 不做实时通义万相生图（场景图用原型 `/原型/assets` 目录下的静态资源）
- 不做 `04-extension-apple.html` 扩展页（历史回顾中心等，MVP 不含）

## Background & Context
### 原型 SCREEN ⇄ 页面映射（严格一一对应，必须全部实现）
| 原型 HTML 文件 | 原型 SCREEN | 前端页面路由 | 说明 |
|---|---|---|---|
| `01-core-flow-apple.html` | SCREEN 01 启动页 / 首页 | `pages/home` | Logo、标题、tagline、开始挑战按钮 |
| `01-core-flow-apple.html` | SCREEN 02 主标签选择 | `pages/tag-select` | NPD (HOT) / 双向 (NEW) 2 张卡片 |
| `01-core-flow-apple.html` | SCREEN 03 MBTI 16 型选择 | `pages/mbti-select` | 4×4 网格 MBTI 卡片（图+蒙层+勾+底部按钮） |
| `01-core-flow-apple.html` | SCREEN 04 AI 剧本生成加载 | `pages/loading` | 旋转 spinner、文案、4px 呼吸进度条、hint 卡 |
| `01-core-flow-apple.html` | SCREEN 05 生存闯关主界面 | `pages/game` | 阶段徽章、场景图、自尊值条、4 阶段点、对话卡、4 选项 |
| `01-core-flow-apple.html` | SCREEN 06 即时反馈弹窗 | `pages/game` 内嵌 BottomSheet | 毛玻璃背景 + 底部弹出 + 正确/错误卡 + 知识卡 + 避雷条 + 按钮 |
| `02-stage-system-apple.html` | SCREEN 07 Stage Transition 阶段过渡 | `pages/transition` | 上阶段完成 + 下箭头 + 新阶段名 + 4 节点进度 + 三列统计 + 难度点 |
| `02-stage-system-apple.html` | SCREEN 08 Redline / Death 红线死亡 | `pages/death` | 红线徽章 + 心碎 + score 红 + 原因红卡 + 知识蓝卡 + 双按钮 |
| `02-stage-system-apple.html` | SCREEN 09 Victory 胜利通关 | `pages/victory` | cleared 徽章 + 庆祝 + 三统计 + 4 行 breakdown + 双按钮 |
| `03-report-data-apple.html` | SCREEN 10 Report Overview 报告总览 | `pages/report` | 通关徽章 + AI 总结卡 + 3 stats + SVG 五维雷达 + 5 条维度条 |
| `03-report-data-apple.html` | SCREEN 11 Parallel Universe 平行宇宙 | `pages/parallel` | Top 12% 大卡 + N 题对比卡 + dashed 分享卡 |
| `03-report-data-apple.html` | SCREEN 12 Knowledge Poster 知识点总结 | `pages/knowledge` | 4 色左边框知识卡 + 海报预览 + 双按钮 |

### 原型设计资源绝对路径（必须直接引用/拷贝其 CSS 变量）
- 原型目录：`/Users/pengjiansheng/Desktop/RGTJ/原型`
- 图片资产：`/Users/pengjiansheng/Desktop/RGTJ/原型/assets`
  - mbti-crops/ 下 16 张 mbti-xxx.png（MBTI 卡背景图，严格使用，不能换图）
  - scene-meet.jpg / scene-love.jpg / scene-conflict.jpg / scene-redline.jpg / scene-victory.jpg（场景图）
  - splash-bg.jpg / avatar-*.jpg（备用）

### 原型 Apple Design 核心 CSS 变量（必须原封不动拷贝到前端全局样式，**不得修改色值**）
```css
--bg-system: #F2F2F7;
--bg-card:   #FFFFFF;
--text-primary:   #1C1C1E;
--text-secondary: #8E8E93;
--text-tertiary:  #AEAEB2;
--accent-blue:    #007AFF;
--accent-red:     #FF3B30;
--accent-green:   #34C759;
--accent-orange:  #FF9500;
--fill-gray:      #E5E5EA;
--separator:      #C6C6C8;
--mbti-blue:      #5B7FFF;   /* NT 分析师 */
--mbti-green:     #30D158;   /* NF 外交家 */
--mbti-orange:    #FF9F0A;   /* SP 探险家 */
--mbti-gold:      #AC8E68;   /* SJ 守卫者 */
--card-radius:    16px;
```

### 其他关键决策
- 前端：Taro 4.x + React + TypeScript
- 后端：Python FastAPI + SQLite
- 题库：预生成 JSON（非实时 AI）
- UI 数值：初始自尊值 100，每题 ±分，红线直接 GameOver
- 4 阶段：相识破冰 meet / 热恋博弈 love / 冲突考验 conflict / 终局抉择 ending

## Functional Requirements

### FR-1: 启动页 + 主标签选择 + MBTI 选择 + AI 加载页（严格对应原型 S01/S02/S03/S04）
- S01 pages/home：Logo 图标 88×88 `linear-gradient(135deg, #007AFF, #5856D6)` 圆角 22px + 🎭 emoji 42px → 人格图鉴 32px 粗体 letter-spacing:-0.3px → 副标题 15px #8E8E93 → tagline 16px 两行 → 描述 14px → 蓝色大按钮（宽度≤320px，14px 圆角 17px 字重600）→ 底部 12px 「已更新至 v1.0 · 32 种人格组合」
- S02 pages/tag-select：nav 返回蓝色 ← + 返回 17px → large-title 34px 700「选择人格类型」→ NPD 卡片 🎭 56×56 #FFF0F0 背景 + 标签 HOT 橙 (#FF9500 on #FFF3E0) + 描述 + chevron 灰；双向卡片 🌊 56×56 #F0F5FF + NEW 蓝 on #E8F0FE；底部 13px #AEAEB2 「更多人格类型即将解锁...」
- S03 pages/mbti-select：nav 返回 + large-title + pill 条 10-16px 圆角10 灰色底 #F0F0F5「🎭 已选：NPD 自恋型人格」→ 四色图例（蓝/绿/橙/金点+标签）→ 4×4 网格 gap:8，每张卡 aspect-ratio 5:6 圆角12、背景 `原型/assets/mbti-crops/mbti-INTJ.png` + 底部 55% 渐变蒙层 rgba(28,28,30,0.82)→透明、左上角标签色条（左border 3px 或 background-position）、选中时 2px #007AFF 边框 + 0 0 0 2px rgba(0,122,255,0.3) box-shadow + 右上角 20px 圆形对勾 ✓（白底蓝勾或蓝底白勾按原型）→ 底部按钮 「NPD + INTJ · 开始模拟」（未选 MBTI 时按钮 disabled）
- S04 pages/loading：spinner 40px（3px #E5E5EA border + top-color #007AFF，animation:spin 0.8s）→ 20px 600「AI 正在编织你的命运...」→ 14px 灰副标题 → 200×4 进度条 65% width 带 progress-pulse 动画（2s 20%→85%→20%）→ hint 卡 10-16 圆角 #F2F2F7 13px 两行
- MVP 共支持 32 种组合（2 主标签 × 16 MBTI），**严格按原型不增加第 3 种主标签**

### FR-2: 生存闯关主页面 + 即时反馈弹窗（严格对应原型 S05/S06）
- S05 pages/game：
  - 顶部 14-20px padding：阶段徽章圆角 20px（白背景灰阴影，字 13 600）「相识破冰」；右 13px 灰「第 2/3 题」
  - 场景图：0-16px margin，圆角 16，object-fit:cover，高 200px（默认用原型 scene-meet.jpg / scene-love.jpg 等，按阶段切换）
  - 自尊值区 14-20 padding：label 13px 灰；右侧徽章 (-15 / +12) 6 圆角 13px 600 字（负红 #FF3B30 on #FFF0F0 / 正绿 #34C759 on #F0FFF4）+ 22px 700 分值；底部 6px 高 progress 条：≥60 蓝 #007AFF；<30 红 #FF3B30；中间 橙 #FF9500（按原型阈值）
  - 4 阶段进度点 6px 圆点 × gap 6px：done 蓝、current 20px 宽蓝矩形 4 圆角、pending 灰
  - 对话卡 8-16px margin、16 圆角 1.5 阴影：speaker 13px 600 蓝「场景 · 咖啡厅」；text 14px line-height 1.65
  - 4 选项 gap 8：padding 12-14、12 圆角、1.5px #C6C6C8 border、字母圆 28px（灰背景灰字，选中时 #007AFF 背景白字）+ 14px 文本；**选中后立即提交（无额外 submit 按钮，按原型交互节奏自行确认即可，原型 S05 也无单独提交按钮）**
- S06 BottomSheet（内嵌 pages/game）：
  - 背景蒙层 rgba(0,0,0,0.3) + backdrop-filter blur 8px
  - 卡片底部 0，圆角 20-20-0-0，12-20 padding → 顶部 handle 条 36×5 灰；反馈 icon 52×52 圆：正确白+绿描边；标题 20px 700（正确绿/错误红）；分数变化 14px 灰；知识卡 14-16 圆角 #F0F5FF + label 12px 600 蓝 + 正文 13px 行高 1.7；避雷条 12-14 圆角 #FFFBF0 + 左 border 3px 橙 #FF9500；底部蓝色大按钮「继续下一题」

### FR-3: 阶段过渡 / 死亡 / 胜利结算页（严格对应原型 S07/S08/S09）
- S07 pages/transition：上阶段 label「相识破冰阶段完成」15px 灰；↓箭头 SVG 32×32；新阶段 title 32px 800 + 副标题 14px 灰；4 节点 28 圆（done: 绿✓ / current: 蓝+ 外发光 4px rgba(0,122,255,0.2) / pending 灰）；三列统计卡 16 圆角 白卡；难度 5 点 2 橙；hint 「点击任意处继续」13px 浅灰
- S08 pages/death：⚠️ REDLINE 触发 pill（#FFF0F0 红 #FF3B30）；心碎 💔 80×80 圆 on rgba(255,59,48,0.08)；红粗标题 28px 700；score-bar 8% 红；原因卡白 + 左 border 4px 红；知识卡白 + 左 border 4px 蓝；底部两按钮 14 圆角 16：左次级灰 #E5E5EA、右蓝色主按钮
- S09 pages/victory：🏆 ALL STAGES CLEARED pill rgba(52,199,89,0.12) 绿；🎉 80×80 庆祝；绿粗标题；3 列白卡统计；4 行 breakdown（每行 24 绿✓圆 + 名+细节+分数）；双按钮：查看完整报告 蓝主 / 分享战绩 白outline 灰border（分享点击 → toast 假提示）

### FR-4: 报告总览 + 平行宇宙 + 知识点总结页（严格对应原型 S10/S11/S12）
- S10 pages/report：
  - large-title 34 「知识复盘报告」；成功绿徽 12-28 绿底 绿字；标签副文本：NPD + INTJ · 全阶段完成
  - AI 总结卡：{AI} 蓝小方标 16×16 白字 + 「智能分析」13 500 蓝；正文 15px 行高 1.6
  - 3 列 stats 网格 16 圆角白：28 700 主字 + 13 灰标签
  - Section 标题 22px 700「五维能力雷达」；SVG 五边形 3 环 + 5 轴 + 数据多边形 fill rgba(0,122,255,0.1) stroke #007AFF 2px + 5 圆点 r=4；5 标签（共情/边界/沟通/觉察/风险）12px #8E8E93
  - 5 条维度条（5 色各不同 按原型：共情蓝/边界绿/沟通蓝/觉察紫#AF52DE/风险橙）：40 左名 15px + bar 高 6 + 30 右分值 15px 600
- S11 pages/parallel：
  - Nav 返回「返回报告」17px 蓝；large-title 28px「平行宇宙数据对比」
  - Top-stat 大卡 20 圆角白：48px 800 「Top 12%」渐变色文字 `-webkit-background-clip: text; linear-gradient(135deg,#007AFF,#5856D6); -webkit-text-fill-color: transparent`；15 灰 label；13 浅灰 sub「基于 12,847 份有效答卷数据」
  - 每题对比卡 16 圆角白：题文 15 500；progress 6 条高；标签 13：对=绿 #34C759、错=红 #FF3B30；间隔 · 灰；全球标签蓝 #007AFF 「全球仅 45% 做对」
  - 分享卡 dashed 2 #D1D1D6 16 圆角：灰 15px 提示 + 分享按钮
- S12 pages/knowledge：
  - Nav 返回；large-title「核心知识点总结」28px
  - 4 张知识卡：各 4px 左边框色条（蓝 #007AFF / 紫 #AF52DE / 红 #FF3B30 / 绿 #34C759）；17 600 标题 + 15 #8E8E93 描述
  - Section 标题 20「海报预览」；海报预览大卡 16 圆角：内部渐白背景 12 圆角 → Logo 40×40 + 标题 20 + 3 行统计 + 分隔线 1px + 五维综合条高 8 蓝紫渐变 + 底部标签 11px
  - 底部两按钮：返回灰 / 保存海报 蓝（点击 toast「保存成功（模拟）」）

### FR-5: 后端 API（7 个 endpoint，严格按以下路径）
- `GET  /api/presets`：返回 32 条预设（id/category ∈ {npd_mbti, bipolar_mbti}/primary_tag ∈ {NPD, 双向}/secondary_tag 16MBTI）
- `POST /api/game/start` body `{preset_category, primary, secondary}` → 返回 `{session_id:uuid, stage:"meet", questions:[], preset_info:{}}`
- `POST /api/game/submit` body `{session_id, question_index, user_choice}` → 返回 `{is_correct, score_change, new_score, feedback, game_over, is_redline, stage_finished?}`
- `POST /api/game/next_stage` body `{session_id}` → 返回 `{next_stage, questions:[]}` 或 `{next_stage:null, all_finished:true}`
- `POST /api/game/end` body `{session_id, result:"passed"|"failed", final_score, answers:[]}` → 返回 `{ok:true}`
- `GET  /api/report/{session_id}` → 返回 `{final_score, accuracy, stage_count, stage_breakdown[], radar_data:{empathy,boundary,communication,self_awareness,risk_detection}, summary, strengths[], weaknesses[], advice, key_learnings[3]}`
- `GET  /api/stats/parallel/{session_id}` → 返回 `{top_percentile, total_players, questions_comparison:[{question_index, question_text, is_correct, global_correct_pct, choice_distribution}]}`

### FR-6: 数据持久化 + 题库种子
- SQLite 4 张表：presets / game_sessions / game_records / stats_cache（结构见方案设计文档 1.4）
- presets 种子 32 条：npd_mbti × 16 + bipolar_mbti × 16
- 预生成题库：NPD+INTJ 完整 4 阶段（3+4+4+3=14 题），其余 31 组合可复用 NPD+INTJ 结构 + 轻微差异化文本即可，但必须保证 get_questions 返回非空
- 场景图路径严格指向原型 assets 图

## Non-Functional Requirements
- **NFR-1（最高优先级）**：所有 12 个 SCREEN 视觉必须 **逐像素对照原型 HTML 实现**，色值、圆角值、px 数值、类名结构、渐变角度、阴影 box-shadow、动画 keyframes、渐变蒙层的高度与透明度 必须与原型 HTML `<style>` 段保持 **完全一致**；**不得自行发挥**（自定义新颜色、新圆角、新间距、新阴影、新渐变角度都视为失败）
- **NFR-2**：前端 Taro H5 模式 `cd frontend && npm run dev:h5` 能本地启动，浏览器能访问首页（默认端口 10086 即可）
- **NFR-3**：后端 FastAPI 启动后 `http://localhost:8000/docs` 看到 Swagger UI，所有 7 个 endpoint Try it out 能成功返回 200
- **NFR-4**：后端 pytest 覆盖率 ≥80%，覆盖会话创建/答题/分数边界/报告/平行宇宙
- **NFR-5**：前后端分离，前端 axios 调 `http://localhost:8000`，CORS 中间件开启允许 `http://localhost:10086`
- **NFR-6**：代码分层清晰：backend/app/{main,models,schemas,database,crud,routers,data}; frontend/src/{pages,components,store,services,utils,styles,assets}
- **NFR-7**：MBTI 16 张背景图必须使用原型 `mbti-crops/*.png`，不得替换为 emoji 或其他图
- **NFR-8**：375×667 (iPhone SE) 和 390×844 (iPhone 12) 两尺寸下所有页面无横向滚动、无截断、元素不溢出

## Constraints
- **Technical**：
  - 前端：Taro 4.x + React 18 + TypeScript、Zustand、axios（**不能引入 NutUI/Taroify 等重 UI 库**，必须纯 CSS 严格还原原型视觉，引入 UI 库会破坏样式一致性）
  - 后端：Python 3.10+、FastAPI、SQLAlchemy 2.x、SQLite、pydantic v2、pytest + pytest-cov + httpx（TestClient）
  - MVP 不接真实 AI API（全部预生成）
- **Business**：无需登录；32 种预设；不含自定义输入
- **Dependencies**：原型 assets 图片必须拷贝到前端；原型 CSS 变量色值必须 copy 到全局 `app.scss`

## Assumptions
- 前后端均本地启动验证（不构建小程序包）
- 题库为示例题但结构正确、选项合理
- 平行宇宙数据使用预填模拟统计（top_percentile 根据用户最终 score 映射到 1~99）
- 保存海报/分享按钮 MVP 用 toast 假反馈（canvas 合成不做）

## Acceptance Criteria（每条都需注明对应原型 SCREEN）

### AC-1: 启动页 S01 完全匹配原型
- **Given**: 访问首页 pages/home
- **When**: 肉眼对比 `01-core-flow-apple.html` SCREEN 01
- **Then**: Logo 尺寸/渐变色值/圆角、标题字号/字重/字间距、tagline 两行、按钮宽高圆角、底部 footer 文本 一致；**任何颜色、字号、圆角、间距差异不超过 2px**
- **Verification**: `human-judgment`（并排对比图 + 色值取色器验证）

### AC-2: 主标签选择 S02 完全匹配原型
- **Given**: 进入 pages/tag-select
- **When**: 对比 S02 NPD 卡 HOT 徽标色值 #FF9500 on #FFF3E0、双向 NEW 蓝 on #E8F0FE、卡片左图标 56 圆角、chevron 右箭头
- **Then**: 元素顺序/颜色/尺寸与原型一致，点击卡片可跳转 mbti-select
- **Verification**: `human-judgment`

### AC-3: MBTI 选择 S03 完全匹配原型（含 16 张真实背景图）
- **Given**: pages/mbti-select，NPD 已选
- **When**: 对照 S03 网格 4×4 gap 8px，每张卡 aspect-ratio 5:6，蒙层 height 55% `linear-gradient(to top, rgba(28,28,30,0.82), transparent)`，INTJ 卡选中效果 2px #007AFF border + 右上角对勾圆 ✓（20 圆 白勾）
- **Then**: 16 张卡均使用原型 mbti-crops/mbti-xxx.png，不可用 emoji；底部按钮文案随选择变化为「NPD + INTJ · 开始模拟」
- **Verification**: `human-judgment` + `programmatic`（store.selectedMbti === 'INTJ'）

### AC-4: 加载页 S04 动效完全匹配原型
- **Given**: 调 start API 后进入 pages/loading
- **When**: 对照 S04 spinner 40px 尺寸 3px 边框宽度、进度条 4px 高度 animation progress-pulse keyframes 2s 20%-85%-20%、hint 卡 2 行
- **Then**: 显示 3-4 秒后自动跳转 game 页
- **Verification**: `human-judgment`（必须观察动画节奏）

### AC-5: 游戏闯关 S05 + 反馈弹窗 S06 完全匹配原型
- **Given**: 进入 pages/game，第一题相识阶段
- **When**: 对照 S05 的各区域 padding/margin 数值、S06 BottomSheet 毛玻璃 blur:8px + 20-20-0-0 圆角、handle 36×5、知识卡 #F0F5FF、避雷卡左橙条 3px
- **Then**: 点击选项 → 弹窗展示正确 ✓ or 错误 ✗ 对应颜色，按钮「继续下一题」
- **Verification**: `human-judgment`

### AC-6: 数值计算 & 红线 GameOver 正确
- **Given**: 某题 correct_index=2、score_change=15 且 is_redline=true
- **When**: 用户选 0（错误 → 红线）/ 选 3（连续错多题扣到 <0）
- **Then**: 正确 → new_score = min(old+15, 100)；错误红线 → new_score 降 → 返回 game_over=true & DB status=failed → 路由 death
- **Verification**: `programmatic`（pytest 3 用例：正/负/红线）

### AC-7: 阶段过渡 S07 / 死亡 S08 / 胜利 S09 完全匹配原型
- **Given**: 3 题全部完成相识阶段
- **When**: 对照 S07 进度节点 current 外发光 `0 0 0 4px rgba(0,122,255,0.2)`、S08 心碎 80 圆 红边框透明度 0.08、S09 breakdown 24 绿圆 ✓
- **Then**: 三页均逐像素匹配；点击 transition 任意处跳转下阶段；death 双按钮；victory 双按钮
- **Verification**: `human-judgment`

### AC-8: 报告 S10 五维 SVG 雷达 + 条带 完全匹配原型
- **Given**: 进入 pages/report
- **When**: 对照 S10 SVG 五边形 3 环 line coords（120,55 / 157,86 / 143,133 / 97,133 / 83,86 等真实坐标）、5 条维度条颜色蓝/绿/蓝/紫/橙
- **Then**: radar_data 5 key 都有且 0-100；条带颜色对应原型
- **Verification**: `human-judgment` + `programmatic`（API 返回结构断言）

### AC-9: 平行宇宙 S11 Top 12% 渐变字 + 条带 完全匹配原型
- **Given**: pages/parallel
- **When**: 对照 S11 top-stat 48px 800 渐变 clip-text；progress 条正确色（对=蓝、错=红）
- **Then**: top_percentile ∈ [1,99]；每题 global_correct_pct ∈ [5,95]
- **Verification**: `human-judgment` + `programmatic`

### AC-10: 知识点 S12 四色左边框 + 海报预览 完全匹配原型
- **Given**: pages/knowledge
- **When**: 对照 S12 四色条（蓝#007AFF / 紫#AF52DE / 红#FF3B30 / 绿#34C759）4px 宽度；海报内 Logo 40 圆 + 三统计 + separator 1px #D1D1D6 + 综合条高 8 渐变
- **Then**: 点击保存海报 → toast「保存成功（模拟）」
- **Verification**: `human-judgment`

### AC-11: 后端 pytest 全绿 + 覆盖率 ≥80%
- **Given**: backend/
- **When**: 运行 `pytest backend/tests -v --cov=backend/app --cov-report term-missing`
- **Then**: 所有用例 PASSED，终端 line coverage ≥80%
- **Verification**: `programmatic`

### AC-12: 后端 7 endpoint 全 200 + CORS 通过
- **Given**: 后端启动，前端 H5 启动
- **When**: 前端 Chrome DevTools Network 面板跑完整胜利链路（start → 3 submit → next → 4 submit → next → 4 submit → next → 3 submit → end → report → parallel）
- **Then**: 所有请求 200 OK，无 CORS 控制台报错，控制台无红字 error
- **Verification**: `human-judgment` + `programmatic`

## Open Questions（已确认的 MVP 暂定方案）
- [x] 保存海报：toast 假反馈，不做真实 canvas
- [x] 分享战绩 / 分享到朋友圈：toast 假反馈，不做真分享
- [x] 04-extension-apple.html 历史回顾 MVP 不做（Non-Goals）
