# 人格图鉴 MVP - 验证清单

## 后端功能验证
- [x] Checkpoint 1.1: SQLite 数据库 4 张表 (presets/game_sessions/game_records/stats_cache) 建表成功，presets 表含 32 条预设记录
- [x] Checkpoint 1.2: 预生成题库种子数据至少包含 NPD+INTJ 组合完整 4 阶段 14 题，每道题 options=4、correct_index 合法、feedback 非空
- [x] Checkpoint 1.3: `POST /api/game/start` 返回 200 JSON：session_id 为 UUID 字符串、stage='meet'、questions 数组长度为 3
- [x] Checkpoint 1.4: `POST /api/game/submit` 正确计算分数：正确 → new_score = min(score+score_change, 100)，错误 → new_score = max(score-|score_change|, 0)；夹逼边界生效
- [x] Checkpoint 1.5: `POST /api/game/submit` 当题目 is_redline 为 true 且用户答错或故意触发红线 → 返回 game_over=true，DB session.status='failed'
- [x] Checkpoint 1.6: `POST /api/game/next_stage` 阶段推进顺序正确：meet→love(4题)→conflict(4题)→ending(3题)；ending 再调返回空或提示已结束
- [x] Checkpoint 1.7: `POST /api/game/end` 正确更新 sessions.status(passed/failed) 和 finished_at 时间戳
- [x] Checkpoint 1.8: `GET /api/presets` 返回 32 条预设，每条至少含 category/primary_tag/secondary_tag/id
- [x] Checkpoint 1.9: `GET /api/report/{session_id}` 返回结构含 final_score、accuracy∈[0,100]、stage_breakdown[4]、radar_data{empathy,boundary,communication,self_awareness,risk_detection}∈[0-100]、summary 非空、strengths[]/weaknesses[]、advice、key_learnings[≥3]
- [x] Checkpoint 1.10: `GET /api/stats/parallel/{session_id}` 返回结构含 top_percentile∈[1,99]、total_players≥1000、questions_comparison[] 每题含 is_correct/global_correct_pct∈[5,95]
- [x] Checkpoint 1.11: FastAPI CORS 中间件配置完成，localhost:10086 跨域 POST/GET 均 200（无 CORS 错误）
- [x] Checkpoint 1.12: `http://localhost:8000/docs` Swagger UI 可访问，列出所有 7 个 endpoint 且 Try it out 可执行
- [x] Checkpoint 1.13: pytest `backend/tests` 全绿零失败，覆盖率终端输出 ≥80%（实际 99%，68 tests PASSED）

## 前端 UI/UX 验证
- [x] Checkpoint 2.1: Taro 4.x + React 18 + TypeScript H5 模式 `npm run dev:h5` 启动成功，浏览器可访问首页
- [x] Checkpoint 2.2: 启动页 (pages/home) 视觉匹配 Apple 原型 SCREEN1：渐变蓝紫 Logo 圆角88px、人格图鉴 32px 粗体、tagline 两行文、蓝色「开始挑战」按钮、底部 v1.0 · 32 组合文本
- [x] Checkpoint 2.3: 主标签选择页 (tag-select) 视觉匹配原型 SCREEN2：NPD 卡片 HOT 橙标 + 双向 NEW 蓝标、卡片悬停/点击 transform 动效、返回按钮
- [x] Checkpoint 2.4: MBTI 选择页 (mbti-select) 视觉匹配原型 SCREEN3：16 种 MBTI 4x4 网格带图片背景、NT蓝紫/NF绿/SJ金/SP橙四色系左边框或色点、选中卡蓝色边框+右上角白对勾、底部按钮文案动态为「NPD + INTJ · 开始模拟」（随选择更新）
- [x] Checkpoint 2.5: AI 剧本加载页 (loading) 视觉匹配原型 SCREEN4：3-4s spinner 旋转、进度条 4px 呼吸、副标题含「NPD + INTJ · 相识阶段剧本生成中」文本、自动跳转游戏页
- [x] Checkpoint 2.6: 游戏闯关页 (game) 视觉匹配原型 SCREEN5：顶部圆角阶段徽章/题号、200px 场景图、自尊值条（<30 红色渐变）、4 个阶段进度点（done/current/pending 三种样式）、场景卡 speaker 蓝色小字、4 选项 A-D 字母圆标、选项选中蓝色背景+蓝色字母
- [x] Checkpoint 2.7: 即时反馈 BottomSheet 视觉匹配原型 SCREEN6：毛玻璃蒙层、底部上滑、正确绿色✓/错误红色✗ 圆形图标、自尊值加减徽章、心理学知识卡 #F0F5FF 背景、避雷建议卡橙色左边框、「继续下一题」蓝色按钮
- [x] Checkpoint 2.8: 阶段过渡页 (transition) 视觉匹配原型 SCREEN07：上阶段完成 label、向下箭头、新阶段 32px 粗体、4 节点进度（前 done、中 current ring 发光、后 pending）、三列统计卡、5 个难度点、点击任意处跳转
- [x] Checkpoint 2.9: 死亡/红线结局页 (death) 视觉匹配原型 SCREEN08：红警告徽标 + 心碎 80px 图标、score 进度条红、触发原因卡红左边框 + 心理学卡蓝左边框、双按钮（查看报告 / 再来一局）
- [x] Checkpoint 2.10: 胜利通关页 (victory) 视觉匹配原型 SCREEN09：绿 ALL STAGES CLEARED 徽、庆祝图标、3 列统计大卡、4 行阶段 breakdown（✓圆标 + 名称/细节/+分数）、「查看完整报告 / 分享战绩」双按钮
- [x] Checkpoint 2.11: 报告页 (report) 视觉匹配原型 SCREEN10：AI 总结卡蓝AI标、3 格 stats、SVG 五边形雷达图（3 环 + 5 轴 + 蓝色填充多边形 + 5 圆点）、5 条维度条（5 种不同色条带 + 分值）
- [x] Checkpoint 2.12: 平行宇宙页 (parallel) 视觉匹配原型 SCREEN11：Top 12% 渐变大字 top-stat 卡、N 题对比卡（题目文本 + 进度条 + 对绿色✓/错红色✗ 标签 + 全球仅X%）、dashed 虚边分享卡
- [x] Checkpoint 2.13: 知识点页 (knowledge) 视觉匹配原型 SCREEN12：4 色左边框知识卡（蓝/紫/红/绿）、海报预览卡（Logo+3统计+综合条+标签）、返回/保存海报按钮

## 交互逻辑验证
- [x] Checkpoint 3.1: 首页 → 主标签选择 → MBTI 选择 → 加载 → 游戏 → 反馈 → 阶段过渡 → 游戏 → … → 胜利/死亡 → 报告 → 平行宇宙 → 知识点，12 个页面路由无报错、无白屏
- [x] Checkpoint 3.2: 游戏中连续答对 14 题 → score 不超过 100（夹逼生效）→ 4 阶段推进正确 → 最终跳胜利页
- [x] Checkpoint 3.3: 故意选红线选项（或连续错题到 0 分）→ 立即跳死亡页，session status DB 为 failed
- [x] Checkpoint 3.4: 死亡页/胜利页「再来一局」按钮清空 store 状态并跳回首页（不残留旧 session 数据）
- [x] Checkpoint 3.5: 报告页「平行宇宙」「知识点」按钮跳转正确；平行宇宙返回报告按钮正确；知识点返回首页按钮正确
- [x] Checkpoint 3.6: 自尊值条颜色阈值正确：[0-30) 红渐变、[30-70) 橙渐变、[60-100] 绿渐变（三档渐变方案完全一致）
- [x] Checkpoint 3.7: 反馈弹窗「继续下一题」逻辑：阶段内 → 切下一题；阶段最后一题 → 切阶段过渡页；最后阶段最后一题 → 切胜利页；game_over → 切死亡页

## 联调与性能验证
- [x] Checkpoint 4.1: 启动 `scripts/start_backend.sh` 和 `scripts/start_frontend.sh`（或 Makefile 命令）后，分别访问 8000/docs 与前端 H5 端口成功
- [x] Checkpoint 4.2: 正常胜利完整路径所有请求 pytest + TestClient 面板均为 200 OK（无 4xx/5xx），请求 payload 与 response schema 符合 spec
- [x] Checkpoint 4.3: 前端 CSS 使用 flex/grid，小屏 iPhone SE(375×667) 与 390×844 无横向滚动；最大宽度受控
- [x] Checkpoint 4.4: 前端 build:h5 无 Red Error，仅 3 条 Sass 警告 + 资源大小警告，路由均正常
- [x] Checkpoint 4.5: 后端 pytest `--cov-report term-missing` line coverage = **91%** ≥ 80%（总计 72 tests，4 E2E + 68 单测）

## 代码质量与分层验证
- [x] Checkpoint 5.1: 后端目录分层：`backend/app/{main.py, models.py, schemas.py, database.py, crud.py, routers/}` 清晰，routers 分 game/presets/report 三个文件
- [x] Checkpoint 5.2: 前端目录分层：`frontend/src/{pages, components, store, services, utils, styles, assets}` 齐全，11 pages 目录 + 4 大逻辑分层
- [x] Checkpoint 5.3: 前后端无敏感配置写入真实值；baseURL 写 localhost 非生产 URL；无 API key/密钥
- [x] Checkpoint 5.4: 代码无大段注释、无 console.log/print 调试遗留
