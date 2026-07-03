from copy import deepcopy

MBTI_TYPES = [
    "INTJ", "INTP", "ENTJ", "ENTP",
    "INFJ", "INFP", "ENFJ", "ENFP",
    "ISTP", "ISFP", "ESTP", "ESFP",
    "ISTJ", "ISFJ", "ESTJ", "ESFJ",
]

_NPD_INTJ_BASE_QUESTIONS = [
    {
        "id": "npd-intj-meet-01",
        "stage": "meet",
        "scene": "咖啡厅初次见面",
        "scene_image": "/assets/scene-meet.jpg",
        "dialogue_speaker": "场景 · 咖啡厅",
        "dialogue_text": "周末下午的咖啡厅，阳光透过玻璃洒在木桌上。你对面的 INTJ 穿着整洁的衬衫，眼神中带着一丝审视。TA 微笑着说：「今天穿得真好看，不像平时那么随意。」语气中带着微妙的对比感，似乎在暗示你平时不够好。",
        "options": [
            "欣然接受赞美，内心美滋滋的",
            "礼貌回应但保持警觉，观察TA后续言行",
            "笑着反问：「哦？你平时观察我挺仔细的嘛？」",
            "假装没听见，立刻转移话题聊工作"
        ],
        "correct_index": 1,
        "score_change": 10,
        "is_redline": False,
        "feedback_title": "选择正确",
        "feedback_knowledge_label": "NPD 识别 · 暗贬操控",
        "feedback_knowledge_text": "暗贬操控（Condescension）是自恋型人格的经典手段：表面是赞美，实则隐含贬低信息。通过建立「我评价你」的上下关系，NPD 会在初次接触就悄悄测试你是否愿意接受被评判的角色。敏锐识别这种双重信息是自保第一步。",
        "feedback_advice": "初次接触任何赞美都照单全收，但不因此降低防备。真正善意的赞美不会附带「平时不如现在」的对比。"
    },
    {
        "id": "npd-intj-meet-02",
        "stage": "meet",
        "scene": "咖啡厅初次见面",
        "scene_image": "/assets/scene-meet.jpg",
        "dialogue_speaker": "场景 · 咖啡厅",
        "dialogue_text": "聊到一半，TA 突然放下咖啡杯，身体微微前倾，用一种看穿一切的语气说：「我感觉你其实挺孤独的，虽然你看起来朋友很多。」这是典型的「冷读术」，通过看似精准的共性描述建立心理优势。",
        "options": [
            "立刻防御：「你错了，我一点都不孤独」",
            "大方承认自己也有独处时刻，然后反问TA的感受",
            "转移话题：「今天这咖啡师拉花挺好看的」",
            "谦虚感谢TA的理解，觉得遇到了知己"
        ],
        "correct_index": 1,
        "score_change": 10,
        "is_redline": False,
        "feedback_title": "选择正确",
        "feedback_knowledge_label": "边界建立 · 平等对话",
        "feedback_knowledge_text": "冷读测试（Cold Reading Test）是 INTJ + NPD 组合常用的开局策略：利用「每个人都有孤独感」这一共性，包装成「我特别懂你」的专属洞察，目的是快速建立权威感和不平等地位。识别后不否定、不仰视，才是破局之道。",
        "feedback_advice": "承认共性但不进入被分析的位置，用反问把对话拉回对等的双向交流。谁也不是谁的医生或导师。"
    },
    {
        "id": "npd-intj-meet-03",
        "stage": "meet",
        "scene": "约会结束街边",
        "scene_image": "/assets/scene-meet.jpg",
        "dialogue_speaker": "场景 · 街边人行道",
        "dialogue_text": "两小时的约会结束，你正准备打车回家。TA 突然靠近一步，语气带着委屈和试探：「你能不能把手机给我看一眼相册？就看一眼嘛，你是不是不信任我？情侣之间不该有秘密的对吧？」此时你们才第一次正式见面。",
        "options": [
            "为了证明信任，把手机递过去给TA看",
            "生气地说：「你有病吧？第一次见面就看我手机？」",
            "保持冷静，清晰说明：「我不跟任何人共享手机，这是我的边界，跟信任无关」",
            "笑着打哈哈：「下次吧，今天手机没电了」，拖延过去"
        ],
        "correct_index": 2,
        "score_change": 15,
        "is_redline": True,
        "feedback_title": "选择正确",
        "feedback_knowledge_label": "红线预警 · 隐私边界测试",
        "feedback_knowledge_text": "初次见面就要求查看手机，是极端的边界入侵测试（Boundary Violation Test）。NPD 会在关系最早期就寻找你的底线——如果此时妥协，TA 的潜意识会记录「这个人可以牺牲隐私来讨好我」，后续的操控会变本加厉、不可逆。",
        "feedback_advice": "任何健康关系都不会在第一天要求查看手机。情绪稳定、理由清晰地拒绝，是唯一正确答案。"
    },
    {
        "id": "npd-intj-love-01",
        "stage": "love",
        "scene": "周末家中",
        "scene_image": "/assets/scene-love.jpg",
        "dialogue_speaker": "场景 · 家中客厅",
        "dialogue_text": "你们确定关系三周了。周三 TA 明明微信上说「周末陪你去看展」，但到了周六你提起时，TA 却一脸困惑：「我从来没说过啊，你是不是记性不好？」你翻聊天记录但那几条被撤回了。这种事这是第三次发生，你开始怀疑自己的记忆。",
        "options": [
            "当场激烈争执，指责TA撒谎",
            "直接截图所有剩余聊天记录存到云端，不与TA争辩当下",
            "暂时不纠结这件事，但开始独立记录每次TA承诺的时间和内容",
            "自我检讨：是不是最近工作太忙，我记性真的变差了？"
        ],
        "correct_index": 2,
        "score_change": 12,
        "is_redline": False,
        "feedback_title": "选择正确",
        "feedback_knowledge_label": "NPD 识别 · 煤气灯效应",
        "feedback_knowledge_text": "煤气灯效应（Gaslighting）是情感虐待核心手段：通过系统性否认事实（撤消息、改说辞、质疑记忆），让受害者逐渐丧失对自身感知的信任。识别煤气灯的关键不是争辩「谁对谁错」，而是发现「我需要不断证明自己没疯」这个信号本身。",
        "feedback_advice": "不与煤气灯当场辩论，只做一件事：外部化你的记忆——写日记、云存截图、跟朋友复述。事实由第三方证据说了算。"
    },
    {
        "id": "npd-intj-love-02",
        "stage": "love",
        "scene": "傍晚视频通话",
        "scene_image": "/assets/scene-love.jpg",
        "dialogue_speaker": "场景 · 视频通话",
        "dialogue_text": "你今晚说好要参加闺蜜的生日聚会，TA 突然发来视频，语气带着受伤和沉重：「为了今天见你，我推掉了跟五年没见的发小的聚会，你就不能陪我一下吗？每次都是我迁就你。」TA的牺牲感扑面而来，让你瞬间充满内疚。",
        "options": [
            "妥协，取消闺蜜的聚会留下来陪TA",
            "反唇相讥：「是你自己要推的，我又没逼你」",
            "先真诚感谢TA的心意，然后坚持自己的计划不变",
            "不说话，直接挂掉视频冷暴力处理"
        ],
        "correct_index": 2,
        "score_change": 10,
        "is_redline": False,
        "feedback_title": "选择正确",
        "feedback_knowledge_label": "边界建立 · 情感绑架识别",
        "feedback_knowledge_text": "情感绑架（Emotional Blackmail）的公式是：「我为你牺牲了X → 你欠我的 → 你必须用Y偿还」。NPD 会主动制造牺牲（甚至没必要的牺牲），然后兑换成你身上的人情债。健康的付出不会附带利息和还款要求。",
        "feedback_advice": "感谢对方心意但拒绝被绑定。任何付出一旦变成要求你让步的筹码，那笔付出就已经变质了。"
    },
    {
        "id": "npd-intj-love-03",
        "stage": "love",
        "scene": "卧室争执",
        "scene_image": "/assets/scene-love.jpg",
        "dialogue_speaker": "场景 · 卧室",
        "dialogue_text": "因为一件小事你们起了争执，TA 突然切换到 INTJ 特有的冷静分析模式，用完美逻辑链对你说：「前提一：如果你真的在乎我，就不会在我累的时候提要求。前提二：你今天提了要求。结论：所以你不在乎我。」三段论无懈可击，你一时语塞。",
        "options": [
            "跟着TA的逻辑走，试图证明自己的行为是合理的",
            "跳出逻辑框架，直接指出「前提一不成立，累不等于不能提要求」",
            "道歉：「对不起是我错了，我不该在你累的时候提要求」",
            "起身离开卧室，拒绝继续沟通"
        ],
        "correct_index": 1,
        "score_change": 15,
        "is_redline": False,
        "feedback_title": "选择正确",
        "feedback_knowledge_label": "NPD 识别 · 伪逻辑陷阱",
        "feedback_knowledge_text": "INTJ + NPD 的杀手锏是「伪三段论」（False Syllogism）：用逻辑正确的形式，包裹逻辑错误的前提，再用极强的表达力和自信让你接受。本质不是在讨论问题，而是在用「理」的外壳实施「压」的目的——在关系中占据永远正确的位置。",
        "feedback_advice": "永远不要在对方设定的前提里辩论。先退一步，检查前提本身是谁规定的、为什么成立。谁说「在乎=不提要求」了？"
    },
    {
        "id": "npd-intj-love-04",
        "stage": "love",
        "scene": "餐厅晚餐",
        "scene_image": "/assets/scene-love.jpg",
        "dialogue_speaker": "场景 · 餐厅",
        "dialogue_text": "吃饭时 TA 看似漫不经心地说：「今天公司新来了个 INTP 同事，跟我聊维特根斯坦聊了一中午，特别懂我。你知道吗，这年头能跟我聊哲学的人太少了。」TA 边说边观察你的表情，语气中带着刻意的随意。",
        "options": [
            "立刻质问：「你说这话是什么意思？是不是对人家有意思？」",
            "醋意上涌，开始赌气或翻旧账",
            "平静地说：「听起来聊得不错」，不进入嫉妒或竞争的角色",
            "假装不在乎，「哦」一声然后低头刷手机"
        ],
        "correct_index": 2,
        "score_change": 12,
        "is_redline": False,
        "feedback_title": "选择正确",
        "feedback_knowledge_label": "NPD 识别 · 三角操控",
        "feedback_knowledge_text": "三角操控（Triangulation）是指故意引入第三方（真实或虚构的竞争者），制造嫉妒和不安全感，从而提升自己在关系中的议价权。NPD 享受你为TA争风吃醋的感觉——这证明了你在投入，而TA掌握着主动权。",
        "feedback_advice": "不接招、不比较、不竞争。你不需要跟任何人争夺「最懂TA的人」这个头衔，因为这个比赛本身就不该存在。"
    },
    {
        "id": "npd-intj-conflict-01",
        "stage": "conflict",
        "scene": "第48小时消息界面",
        "scene_image": "/assets/scene-conflict.jpg",
        "dialogue_speaker": "场景 · 微信界面",
        "dialogue_text": "上次争执后 TA 已整整 48 小时没回你任何消息。你发的 7 条微信、3 个语音通话全部石沉大海。你开始焦虑，担心是不是自己话说重了，又愤怒TA用这种方式折磨人。手机屏幕亮了又暗，你在输入框删了无数遍文字。",
        "options": [
            "疯狂道歉，连发十几条长文字，说都是自己不好",
            "也不回TA，以牙还牙开始冷战",
            "只发一条清晰的消息：「冷战对我伤害很大，24小时内不沟通我会认为你不想继续了」，然后等",
            "直接发一句「分手吧」测试TA反应"
        ],
        "correct_index": 2,
        "score_change": 12,
        "is_redline": False,
        "feedback_title": "选择正确",
        "feedback_knowledge_label": "边界建立 · 冷战应对",
        "feedback_knowledge_text": "沉默对待（Silent Treatment）是 NPD 最常用的惩罚手段：不是在「冷静」，而是在通过剥夺回应来训练你的服从性——就像训狗时不给食物一样。核心是让你对「被TA忽视」产生条件反射式的恐惧，从而下次自动让步。",
        "feedback_advice": "只沟通一次，明确说明你的底线和你接下来的动作，然后执行。不要反复联系——那会把「被忽视」的力量全部交到TA手上。"
    },
    {
        "id": "npd-intj-conflict-02",
        "stage": "conflict",
        "scene": "收到快递包裹",
        "scene_image": "/assets/scene-conflict.jpg",
        "dialogue_speaker": "场景 · 家门口",
        "dialogue_text": "冷战三天后的傍晚，门铃响了，是你念叨过很久的那款限量香水，附赠一张TA手写卡片：「都是我不好，不该不理你。你值得所有美好的东西，我不想失去你。」香水是对的，话是甜的，但之前争执的核心问题TA一个字都没提。",
        "options": [
            "被感动了，拍照发给TA说「谢谢宝贝我爱你」，主动和好",
            "收下礼物很开心，但回复TA：「东西我收到了，我们找个时间认真聊下上次的问题吧」",
            "收下礼物，表面原谅但内心记仇，以后算账",
            "直接拒收快递发回去，态度坚决"
        ],
        "correct_index": 1,
        "score_change": 12,
        "is_redline": False,
        "feedback_title": "选择正确",
        "feedback_knowledge_label": "NPD 识别 · 间歇性强化",
        "feedback_knowledge_text": "间歇性强化（Intermittent Reinforcement）是创伤性联结形成的关键机制：先让你体验极致的痛苦（三天冷战），然后突然给你极致的甜蜜（惊喜礼物+甜言蜜语），你的大脑会像赌徒上瘾一样，为了偶尔的甜头而容忍大多数的伤害。礼物本身从不等于道歉。",
        "feedback_advice": "礼物可以收，但问题必须谈。如果每次矛盾都用「送东西」跳过而不解决，它们会累积成关系里的癌细胞。"
    },
    {
        "id": "npd-intj-conflict-03",
        "stage": "conflict",
        "scene": "朋友聚会餐桌",
        "scene_image": "/assets/scene-conflict.jpg",
        "dialogue_speaker": "场景 · 朋友聚会",
        "dialogue_text": "周末 TA 带你跟 TA 的朋友们聚餐。酒过三巡，TA 突然用开玩笑的语气对桌上众人说：「你们不知道，TA 智商真的不行，上次连超市结账都算不明白。要不是我带着，TA 都不知道怎么跟人说话哈哈。」全桌人哄堂大笑，你脸一下子红了，血液冲上头顶。",
        "options": [
            "当场翻脸骂回去：「你才智商有问题，你全家都智商有问题」",
            "陪着笑跟着打哈哈，假装不在意，但心在滴血",
            "等笑声停后，冷静清晰地说：「这样说我让我很不舒服，请停止」",
            "直接站起来离席，不说话也不解释"
        ],
        "correct_index": 2,
        "score_change": 20,
        "is_redline": True,
        "feedback_title": "选择正确",
        "feedback_knowledge_label": "红线预警 · 公开贬低打压",
        "feedback_knowledge_text": "公开场合的贬低（Public Debasement）是 NPD 建立长期统治的关键一步：当众羞辱你而你不反抗，等于向所有人宣告「你们也可以这样对TA」。更可怕的是，你的自尊系统会在这种反复经历中被系统性摧毁，开始内化「我确实不行」的信念——这是不可逆的心理伤害。",
        "feedback_advice": "不当场炸但必须当场制止，语气平静、信息明确。公开场合的边界不捍卫，私下里就再也站不起来了。"
    },
    {
        "id": "npd-intj-conflict-04",
        "stage": "conflict",
        "scene": "深夜卧室",
        "scene_image": "/assets/scene-conflict.jpg",
        "dialogue_speaker": "场景 · 卧室",
        "dialogue_text": "TA 突然在床上把你抱得很紧，语气憧憬地说：「宝贝我最近在看瑞士的房子，我们以后去瑞士定居好不好？阿尔卑斯山下的小镇，我已经在做财务规划了。」停顿几秒后TA画风一转：「对了，我这边投资周转差15万，你能不能先转我？等我们去瑞士了这都不算什么。」",
        "options": [
            "被未来感动了，立刻转15万过去",
            "很兴奋地跟TA讨论瑞士的生活细节，但不接借钱这茬",
            "要求先看瑞士的具体规划文件和投资项目书再说",
            "直接拒绝：「我不跟伴侣有金钱往来」"
        ],
        "correct_index": 1,
        "score_change": 10,
        "is_redline": False,
        "feedback_title": "选择正确",
        "feedback_knowledge_label": "NPD 识别 · 未来伪造承诺",
        "feedback_knowledge_text": "未来伪造（Future Faking）是指描述极其具体、美好的共同未来（瑞士定居、海边婚礼、几岁生孩子），用你脑中的多巴胺，交换你当下真实的让步——金钱、时间、资源、妥协。承诺的成本为零，而你付出的代价是真金白银。",
        "feedback_advice": "为未来感动没问题，但用当下真金白银为「脑中的画」买单不行。任何健康关系里，谈钱和谈结婚计划是完全分开的两件事。"
    },
    {
        "id": "npd-intj-ending-01",
        "stage": "ending",
        "scene": "离家电梯口",
        "scene_image": "/assets/scene-victory.jpg",
        "dialogue_speaker": "场景 · 电梯口",
        "dialogue_text": "你冷静地说需要分开一段时间冷静。TA 突然崩溃，抓住你的手腕哭着说：「你走了我就自杀，我真的会，都是你逼我的，我死了你就满意了是吗？」TA 眼睛通红，整个人在颤抖，你瞬间犹豫了——万一TA真的做了傻事怎么办？",
        "options": [
            "害怕出事，马上留下来安抚TA说不走了",
            "直接甩开手走进电梯：「你要死就死关我屁事」",
            "冷静说：「我担心你的安全，我会立刻联系你家人陪你」然后联系TA家人",
            "先拨打110备案说明情况，然后离开但保持一个紧急联系渠道"
        ],
        "correct_index": 3,
        "score_change": 20,
        "is_redline": False,
        "feedback_title": "选择正确",
        "feedback_knowledge_label": "边界建立 · 分离威胁应对",
        "feedback_knowledge_text": "「你走我就自杀」90%是操控（Suicide Threat as Manipulation），10%是真实风险——所以你既不能被绑架留下，也不能完全不管。正确做法是把TA的生命安全交还给专业系统（警方、家人、急救），而不是由你一个人承担，这样既守住了边界也无愧于心。",
        "feedback_advice": "报警备案是标准操作，既留下了记录也获得了专业支持。用成年人的方式处理极端威胁，不要让别人的生死选择变成囚禁你的笼子。"
    },
    {
        "id": "npd-intj-ending-02",
        "stage": "ending",
        "scene": "客厅地板",
        "scene_image": "/assets/scene-victory.jpg",
        "dialogue_speaker": "场景 · 客厅",
        "dialogue_text": "冷静期第二周，TA 出现在你家门口，直接跪下来哭，眼泪鼻涕一起流：「我改，我真的改，我知道我以前不对。你看，这是我预约的心理咨询单，下周二第一次。再给我一次机会好不好？」TA掏出手机给你看预约确认短信。",
        "options": [
            "立刻心软扶TA起来，说「好，我原谅你」",
            "说「好，我给你一次机会，但我会观察你的行动」",
            "说「不用了，我们不可能了」，关门",
            "说「我需要至少3个月的时间，我只看真实持续的改变，不看道歉和预约单」"
        ],
        "correct_index": 3,
        "score_change": 15,
        "is_redline": False,
        "feedback_title": "选择正确",
        "feedback_knowledge_label": "边界建立 · 改变的验证",
        "feedback_knowledge_text": "NPD 的道歉分为三层：第一层是情绪（哭、跪、承诺），第二层是动作（挂号、买礼物、说改），第三层才是持续的行为改变（3个月以上、不用提醒、在压力下仍然不回退）。90%的人只做到前两层就被骗回去了，然后重蹈覆辙。",
        "feedback_advice": "预约单不值钱，值钱的是做完20次咨询后的人。时间和持续行为是检验改变的唯一标准，不能打折、不能提前、不能通融。"
    },
    {
        "id": "npd-intj-ending-03",
        "stage": "ending",
        "scene": "最终复盘书桌前",
        "scene_image": "/assets/scene-victory.jpg",
        "dialogue_speaker": "场景 · 书桌前 · 复盘",
        "dialogue_text": "经过全部四个阶段的复盘，你坐在书桌前整理这段时间的所有记录和感受。窗外是清晨的阳光，你需要最终决定跟TA的关系走向——不是基于情绪，不是基于习惯，而是基于这段时间你真实学到的所有东西。",
        "options": [
            "继续关系，但建立一份书面的「边界清单」，逐项明确不可触碰的红线和违反后果",
            "好聚好散，做朋友就好，不再做恋人",
            "拉黑所有联系方式，永不来往，彻底切割",
            "保持开放式关系，互不约束，想联系就联系"
        ],
        "correct_index": 0,
        "score_change": 15,
        "is_redline": False,
        "feedback_title": "选择正确",
        "feedback_knowledge_label": "INTJ 适配 · 结构化边界",
        "feedback_knowledge_text": "对 INTJ 类型的伴侣而言，结构化、书面化的边界协议（Written Boundary Contract）是最优解——INTJ 的理性系统尊重清晰规则和可预期后果，讨厌模糊的「你应该知道」。而极端切割（全部拉黑）虽然解气，但往往是另一种情绪化的极端，不利于建立真正健康的边界模式。",
        "feedback_advice": "把边界写成条目：做了什么、后果是什么、执行几次。不是为了约束TA，而是为了训练你自己在边界被越过时的执行力。"
    }
]


def _get_stage_questions(questions, stage):
    return [q for q in questions if q["stage"] == stage]


def _generate_questions_for_other_presets(base_questions, primary, secondary):
    generated = deepcopy(base_questions)
    knowledge_map = {
        "暗贬操控": "情绪投射",
        "煤气灯效应": "理想化/贬低循环",
        "三角操控": "分离焦虑反应",
    }
    logic_map = {
        "逻辑陷阱": "情绪绑架",
    }
    for q in generated:
        qid = q["id"]
        if secondary == "ENFP":
            for old, new in logic_map.items():
                if old in q["feedback_knowledge_label"]:
                    q["feedback_knowledge_label"] = q["feedback_knowledge_label"].replace(old, new)
        if primary == "双向":
            for old, new in knowledge_map.items():
                if old in q["feedback_knowledge_label"]:
                    q["feedback_knowledge_label"] = q["feedback_knowledge_label"].replace(old, new)
            if "NPD" in q["feedback_knowledge_label"]:
                q["feedback_knowledge_label"] = q["feedback_knowledge_label"].replace("NPD 识别", "双向情绪识别")
            if "NPD" in q["dialogue_text"]:
                q["dialogue_text"] = q["dialogue_text"].replace("NPD", "你那位情绪波动较大的伴侣")
            q["id"] = qid.replace("npd-intj", f"bipolar-{secondary.lower()}")
        else:
            q["id"] = qid.replace("npd-intj", f"npd-{secondary.lower()}")
    return generated


def get_questions(preset_category: str, primary_tag: str, secondary_tag: str, stage: str):
    if primary_tag == "NPD" and secondary_tag == "INTJ":
        return _get_stage_questions(_NPD_INTJ_BASE_QUESTIONS, stage)
    generated = _generate_questions_for_other_presets(
        _NPD_INTJ_BASE_QUESTIONS, primary_tag, secondary_tag
    )
    result = _get_stage_questions(generated, stage)
    return result
