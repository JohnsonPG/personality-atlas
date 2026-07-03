# 人格图鉴 MVP - 实施任务清单

## [x] Task 1: Python 后端项目初始化 + SQLite 数据库模型
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 初始化 backend/ 目录，pyproject.toml (poetry) 或 requirements.txt：fastapi uvicorn sqlalchemy pydantic pytest pytest-cov httpx python-multipart
  - 创建 SQLite 引擎 + SQLAlchemy 会话 (sessionmaker)
  - 定义 4 张 ORM 模型：Presets(id/category/primary_tag/secondary_tag/knowledge_json)、GameSessions(session_id UUID/preset_id/current_stage/current_score 100/status enum/stage_history JSON/created_at/finished_at)、GameRecords(session_id/question_index/question_text/options_json/user_choice/is_correct/score_change/ai_feedback/stage)、StatsCache(preset_id/stage/question_index/total_answers/correct_count/choice_distribution JSON)
  - 提供 `init_db()` 创建表 + 种子 presets 32条（2主×16MBTI）
  - 目录结构：backend/app/{main.py,models.py,schemas.py,database.py,crud.py,data/questions_seed.py,routers/__init__.py}
- **Acceptance Criteria Addressed**: AC-4, AC-11, FR-11, FR-12
- **Test Requirements**:
  - `programmatic` TR-1.1: pytest backend/tests/test_db.py - 数据库建表成功，presets 表有 32 条记录
  - `programmatic` TR-1.2: ORM 模型可以增删改查，JSON 字段能序列化/反序列化
  - `human-judgement` TR-1.3: 代码文件分层清晰，符合 FastAPI 最佳实践
- **Notes**: 预设 32 条 presets：category ∈ {npd_mbti, bipolar_mbti}，primary ∈ {NPD, 双向}，secondary 16 MBTI

---

## [x] Task 2: 预生成题库 JSON 种子数据 + 数据加载模块
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 在 backend/app/data/ 下创建 `questions_seed.py` 或 JSON 文件，为 32 种组合 × 4 阶段（meet/love/conflict/ending）生成示例题目（可用脚本批量 + 人工编写 NPD+INTJ 完整一套，其他组合复用结构即可）
  - 每题结构：{id, stage, scene, scene_image(原型assets路径), options:[4条], correct_index 0-3, score_change ±5~20, is_redline bool, feedback 心理学讲解 50字, knowledge 知识点}
  - 每阶段 meet:3题 / love:4题 / conflict:4题 / ending:3题
  - 提供 `get_questions(preset_id, stage)` 函数从种子数据返回题目
- **Acceptance Criteria Addressed**: AC-4, FR-12
- **Test Requirements**:
  - `programmatic` TR-2.1: NPD + INTJ 组合的 4 阶段题数量正确 (3+4+4+3=14 题)，每题 options 长度 4，correct_index 合法
  - `programmatic` TR-2.2: `get_questions()` 对任意 preset_id+stage 返回非空 list，且每道题结构符合 Question schema
  - `human-judgement` TR-2.3: 题目文本/选项真实可感，知识反馈言之有物

---

## [x] Task 3: FastAPI 路由层 - 游戏会话 API (start / next_stage / submit / end)
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - POST `/api/game/start` 入参 {preset_category, primary, secondary}，内部：找/建 preset → 建 session (UUID, score=100, stage=meet, status=playing) → 从种子取 meet 题 → 返回 {session_id, stage, questions, preset_info}
  - POST `/api/game/next_stage` 入参 {session_id}：阶段按 meet→love→conflict→ending 推进，返回下一阶段题；已是 ending 返回空
  - POST `/api/game/submit` 入参 {session_id, question_index, user_choice}：判正误→算score_change→更新session.current_score(0-100夹逼)→建record→判断红线is_redline→score≤0或红线→status=failed→返回 {is_correct, score_change, new_score, feedback, game_over(bool), is_redline}
  - POST `/api/game/end` 入参 {session_id, result, final_score, answers}：更新 sessions.status/finished_at
  - 统一 Pydantic schemas，422 校验错误返回
- **Acceptance Criteria Addressed**: AC-4, AC-6, AC-7, FR-11
- **Test Requirements**:
  - `programmatic` TR-3.1: `POST /api/game/start` 返回 200，session_id 是UUID，questions 3 道
  - `programmatic` TR-3.2: 三次 submit 正确后 next_stage 返回 love 阶段，4题
  - `programmatic` TR-3.3: submit 故意触发红线或扣到 0，返回 game_over=true，DB 中 status=failed
  - `programmatic` TR-3.4: 积分边界：初始100，扣115→new_score=0（夹逼），加30→仍是100

---

## [x] Task 4: FastAPI 报告 + 平行宇宙 API
- **Priority**: high
- **Depends On**: Task 3
- **Description**: 
  - GET `/api/presets`：返回 32 条预设，前端 MBIT 卡片用
  - GET `/api/report/{session_id}`：读取 session+records → 计算 {final_score, accuracy, stage_count, stage_breakdown[], radar_data(五维，按答题结果给分), summary(预设文案或简单拼接), strengths[], weaknesses[], advice, key_learnings[3]}
  - GET `/api/stats/parallel/{session_id}`：从 records 逐题 + 预设 stats_cache（或模拟数据）返回 {top_percentile: 12, total_players: 12847, questions_comparison: [{question_index, question_text, is_correct(bool), global_correct_pct, choice_distribution}]}
  - 路由分离：routers/game.py, routers/presets.py, routers/report.py
- **Acceptance Criteria Addressed**: AC-9, AC-10, FR-9, FR-11
- **Test Requirements**:
  - `programmatic` TR-4.1: `/api/presets` 200，body 含 32 条，MBTI 16 × 2 主标签齐全
  - `programmatic` TR-4.2: `/api/report/{sid}` 返回结构完整：radar_data 有5项 key，每项 0-100；summary 非空；stage_breakdown 4阶段
  - `programmatic` TR-4.3: `/api/stats/parallel/{sid}` top_percentile ∈ [1,99]，每题 global_correct_pct ∈ [5,95]
  - `human-judgement` TR-4.4: 报告文案逻辑通顺，可直接显示

---

## [x] Task 5: 后端 pytest 全量单元测试 + 覆盖率 ≥80%
- **Priority**: high
- **Depends On**: Task 3, Task 4
- **Description**:
  - 创建 backend/tests/{conftest.py, test_game_api.py, test_report_api.py, test_score_calc.py}
  - conftest.py: httpx.AsyncClient / TestClient，pytest fixture 带测试 SQLite 库（内存:memory: 或临时文件）
  - test_game_api.py: 覆盖 start → 4 阶段 submit → next → end 全链路；红线触发、score归0 两分支
  - test_score_calc.py: 独立测试分数计算、阶段推进顺序、边界夹逼
  - test_report_api.py: 模拟插入 N 条 records，断言 report 结构与 parallel 数据
  - 运行 `pytest backend/tests -v --cov=backend/app --cov-report term-missing`，要求 ≥80%
- **Acceptance Criteria Addressed**: AC-11, NFR-3
- **Test Requirements**:
  - `programmatic` TR-5.1: pytest 全部 green，零失败
  - `programmatic` TR-5.2: coverage 输出 terminal，覆盖率 ≥80%
  - `human-judgement` TR-5.3: 每段测试有 arrange/act/assert 三段式，命名可读

---

## [x] Task 6: 前端 Taro 4.x (React+TS) 项目初始化 + 目录分层
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 初始化 frontend/ 为 Taro 4.x 项目：`npm i -g @tarojs/cli` → `taro init frontend` 选择 React + TS
  - 安装 Zustand 状态管理、axios HTTP 请求库
  - 目录结构：frontend/src/{pages/[home|tag-select|mbti-select|loading|game|transition|death|victory|report|parallel|knowledge], components/, store/, utils/, services/, styles/, assets/}
  - 把原型 assets 图片拷贝到 frontend/src/assets/（可软链）
  - 全局 Apple Design tokens：CSS 变量 --bg-system #F2F2F7 / --card #FFFFFF / --text-primary #1C1C1E / --accent-blue #007AFF / --accent-red #FF3B30 / --accent-green #34C759 / --accent-orange #FF9500 / --fill-gray #E5E5EA / --radius-card 16px
  - 验证：`cd frontend && npm run dev:h5` → 浏览器访问 `http://localhost:10086` 能打开默认 Taro 页
- **Acceptance Criteria Addressed**: NFR-1, NFR-4, NFR-6
- **Test Requirements**:
  - `programmatic` TR-6.1: `taro info` 输出显示 Taro 4.x + React 18 + TS
  - `programmatic` TR-6.2: `npm run dev:h5` 启动无 fatal error，本地端口可访问
  - `human-judgement` TR-6.3: pages/components/store/utils 分层齐全，命名规范，CSS vars 定义到位

---

## [x] Task 7: 前端 4 个选择流程页面 (home / tag-select / mbti-select / loading)
- **Priority**: high
- **Depends On**: Task 6
- **Description**:
  - pages/home/index：启动页 Logo 图标 88×88 渐变圆角 → 人格图鉴 32px 粗体 → 副标题 → tagline 2行 → 描述 → 蓝色大按钮「开始挑战」 → 底部版本号
  - pages/tag-select/index：返回按钮 + large-title「选择人格类型」 → NPD 卡片（🎭 HOT 徽标 + 名/描述/chevron），双向卡片（🌊 NEW），底部 hint
  - pages/mbti-select/index：返回 + large-title + 已选 pill 条（🎭 已选：NPD 自恋型人格） + 四色系图例 → 16 格 4x4，每格用 assets/mbti-crops/mbti-xxx.png 背景 + 渐变蒙层 → 选中蓝色边框 + 右上角圆勾 → 底部按钮「NPD + XXX · 开始模拟」
  - pages/loading/index：旋转 spinner 40px → 「AI 正在编织你的命运...」 → 副标题 {标签 · 相识阶段剧本生成中} → 进度条 4px 呼吸动画 → hint 卡两行
  - 各页路由跳转：home→tag-select→mbti-select→loading（调 start API 拿 session）→ 跳 game
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, FR-1, FR-2
- **Test Requirements**:
  - `human-judgement` TR-7.1: 视觉 1:1 匹配原型 01-core-flow-apple 前 4 屏（色值、圆角、间距、字体）
  - `programmatic` TR-7.2: MBIT 页点选 INTJ 后，store 中 selectedMbti === 'INTJ'，按钮 disabled 状态在未选时为 true
  - `human-judgement` TR-7.3: loading 页动效流畅，spinner 不卡顿

---

## [x] Task 8: 前端游戏核心页 game + 状态管理 store/game.ts + 反馈弹窗
- **Priority**: high
- **Depends On**: Task 7, Task 3
- **Description**:
  - store/game.ts (Zustand + persist)：session_id, current_stage, current_q_idx, questions[], score 100, score_history[], answers[], status ∈ playing/feedback/transition/victory/failed；actions: startGame, submitAnswer, advanceStage, endGame
  - pages/game/index：
    - 顶部 stage badge 圆角卡片 + 题目序号 X/Y
    - 场景图 200px 高（用题目 scene_image 或默认 scene-meet.jpg）
    - 自尊值区：label左，右「-15 负徽章 + 72 大字号」；进度条 6px；danger（<30）红色渐变
    - 阶段进度点 4 个 dot done/current/pending 形状
    - 对话卡：speaker 蓝色小字 + 场景文本
    - 4 选项：A-D 字母圆 28px + 文本；选中时蓝色 border + #F0F5FF 背景
    - 无提交按钮：选项点击立即答
  - Feedback Modal (BottomSheet)：半透蒙层 + backdrop blur；正确绿✓圆/错误红✗；标题、自尊变化、知识蓝色卡 #F0F5FF + 避雷卡 橙左边框；「继续下一题」按钮 → 切下一题/阶段/结局
- **Acceptance Criteria Addressed**: AC-5, AC-6, FR-3, FR-4
- **Test Requirements**:
  - `human-judgement` TR-8.1: UI 视觉 1:1 原型 SCREEN5+6，选项卡 hover/pressed 有状态
  - `programmatic` TR-8.2: 连点 3 题都选正确，score 递增不超 100，阶段进度点更新正确
  - `programmatic` TR-8.3: 故意选红线选项 → status → failed → 路由 redirecTo death 页
  - `human-judgement` TR-8.4: BottomSheet 动画丝滑（translateY 300→0 + fade）

---

## [x] Task 9: 阶段过渡页 + 死亡结局页 + 胜利通关页
- **Priority**: high
- **Depends On**: Task 8
- **Description**:
  - pages/transition/index：上阶段名 label「相识破冰阶段完成」→ 下箭头 svg → 新阶段大 32px 粗体 + 副标题 → 4节点进度（2 done + 1 current active ring 4px）→ 三列统计卡（自尊值/3-3/100%）→ 难度点 5个点 → 底部 hint「点击任意处继续」→ 下一阶段题加载后跳 game
  - pages/death/index：⚠️ REDLINE 徽章 + 💔 大图标 → 红粗标题「模拟结束」+ 副说明 → score-bar 红色低占比 + reason卡红左边框 + knowledge蓝左边框 + 双按钮：查看报告 / 再来一局（跳 home）
  - pages/victory/index：🏆 ALL STAGES CLEARED 绿徽 + 🎉 图标 → 绿粗「成功通关」→ 3列统计大卡 → 4阶段 breakdown 卡（每 ✓ + 名 + 细节 + +XX 分）→ 双按钮：查看完整报告 / 分享战绩（假按钮 toast）
- **Acceptance Criteria Addressed**: AC-7, AC-8, FR-5, FR-6, FR-7
- **Test Requirements**:
  - `human-judgement` TR-9.1: 3 页完全对应原型 02-stage-system-apple Screen07/08/09
  - `programmatic` TR-9.2: victory 页 breakdown 4 行，行首勾选 icon 渲染
  - `human-judgement` TR-9.3: 死亡页红色配色和胜利页绿色配色无串色

---

## [x] Task 10: 报告页 + 平行宇宙页 + 知识点页
- **Priority**: high
- **Depends On**: Task 9, Task 4
- **Description**:
  - pages/report/index：
    - large-title「知识复盘报告」→ 成功绿徽 → 标签文本
    - AI 总结卡：{AI} 小蓝标 → 智能分析 → summary 正文
    - 3格 stats（得分/正确率/通关）
    - 五维雷达 SVG：五边形 3 环 + 5轴 + 数据多边形 rgba(0,122,255,.1) fill + 描边 + 顶点 5 圆点；5 个文字标签
    - 维度条 5 条：左 name + bar + 右分值，按维度给不同色
  - pages/parallel/index：
    - 返回「返回报告」+ 大标题「平行宇宙数据对比」
    - top-stat 大卡：渐变大字「Top 12%」→ label + N 数据
    - N 张 question-card：题目文本 → 进度条 6px → 标签你对/错 · 全球仅Y%做对
    - 分享卡虚边框 dashed + 「分享到朋友圈」（假）
  - pages/knowledge/index：
    - 返回 + title「核心知识点总结」
    - 4 张知识卡：蓝紫红绿左边框 + 标题 + 描述
    - 海报预览大卡：Logo+标题+3统计+分隔线+综合条+标签
    - 双按钮返回首页/保存海报（toast模拟）
- **Acceptance Criteria Addressed**: AC-9, AC-10, AC-12, FR-8, FR-9, FR-10
- **Test Requirements**:
  - `human-judgement` TR-10.1: 三页视觉对齐 03-report-data-apple Screen10/11/12
  - `programmatic` TR-10.2: 雷达 SVG 5 顶点坐标根据 radar_data 正确缩放（0=内环, 100=外环）
  - `human-judgement` TR-10.3: 平行宇宙题卡片进度条颜色与你对/错一致（蓝/红）

---

## [x] Task 11: 前后端联调 + 端到端走查
- **Priority**: high
- **Depends On**: Task 5, Task 10
- **Description**:
  - 配置前端 services/api.ts：baseURL=http://localhost:8000，axios 实例，统一处理 422/500 toast
  - 配置 FastAPI CORS middleware 允许 localhost:10086
  - 端到端走 4 条关键路径：
    a) 选NPD+INTJ→全对→通4关→看报告→平行宇宙→知识点（正常胜利）
    b) 选双向+ENFP→中途第2题选红线→死亡页→看报告（红线失败）
    c) 连续错题→score扣0→死亡页
    d) prev/next 按钮路由正确，store 数据在页间共享
  - 修 bug，确保所有 console 无红字 error
- **Acceptance Criteria Addressed**: AC-1~AC-12 全部
- **Test Requirements**:
  - `human-judgement` TR-11.1: 手动跑通 (a)(b)(c)(d) 四条路径无阻断
  - `programmatic` TR-11.2: Network 面板所有接口状态 200，返回体符合 schema
  - `human-judgement` TR-11.3: 无样式错乱，小屏 iPhone SE 适配（375×667）无横滚

---

## [x] Task 12: 一键启动脚本（start_backend.sh + start_frontend.sh）
- **Priority**: medium
- **Depends On**: Task 11
- **Description**:
  - 根目录新建 backend/README.md？不做（用户不让写文档），改为根目录 Makefile：`make install` `make backend` `make frontend` `make test-backend`
  - 或者简单写 2 个 shell 脚本：`scripts/start_backend.sh`（cd backend && uvicorn app.main:app --reload --port 8000）、`scripts/start_frontend.sh`（cd frontend && npm run dev:h5）
- **Acceptance Criteria Addressed**: NFR-1, NFR-2
- **Test Requirements**:
  - `programmatic` TR-12.1: 2 条脚本依次执行无 error，后端 8000/docs 可访问，前端 H5 可访问
- **Notes**: 不写 README.md（用户规则禁止主动创建文档），只写可执行脚本/Makefile

