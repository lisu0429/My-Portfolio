export const profile = {
  name: '李彬',
  role: 'AI 产品经理',
  location: '深圳',
  school: '深圳技术大学',
  major: '物联网工程',
  degree: '本科',
  cohort: '2026 届',
  intent: '全职 · AI 产品经理 · 深圳',
  email: '2539996722@qq.com',
  phone: '15889600791',
  resume: '/resume.pdf',
  github: 'lisu0429',
  githubUrl: 'https://github.com/lisu0429',
};

export const hero = {
  kicker: 'AI PRODUCT MANAGER · 深圳',
  name: 'LIBIN',
  labels: [
    { text: 'PORTFOLIO', align: 'left' },
    { text: '[AI PRODUCT MANAGER]', align: 'center' },
    { text: '[2026]', align: 'right' },
  ],
  lead: '独立设计 C 端 + B 端 AI 系统与多模态评测平台，把大模型能力变成可上线、可度量的产品',
  meta: [
    { label: '状态', value: '开放 AI 产品经理机会', dot: true },
    { label: '毕业院校', value: '深圳技术大学' },
    { label: '专业', value: '物联网工程 · 本科' },
    { label: '求职意向', value: 'AI 产品经理 · 全职' },
  ],
  cta: [
    { label: '查看精选项目', href: '#work', primary: true },
    { label: '下载简历', href: profile.resume },
  ],
};

/** 工具分组：星座图上同一组的星点连成一片星群 */
export const toolGroups = [
  { id: 'agent', label: 'AI 工具链', color: '#A9DEE8' },
  { id: 'rag', label: 'RAG · Agent', color: '#7EC8DC' },
  { id: 'train', label: '模型训练', color: '#9FB6D4' },
  { id: 'backend', label: '后端服务', color: '#E8BE96' },
  { id: 'infra', label: '工程环境', color: '#A9B6BE' },
];

export const tools = [
  { name: 'Codex', group: 'agent' },
  { name: 'Claude Code', group: 'agent' },
  { name: 'Cursor', group: 'agent' },
  { name: 'Trae', group: 'agent' },
  { name: 'WorkBuddy', group: 'agent' },
  { name: 'Coze', group: 'agent' },
  { name: 'Notion AI', group: 'agent' },
  { name: 'Figma AI', group: 'agent' },
  { name: 'MCP', group: 'agent' },
  { name: 'OpenRouter', group: 'rag' },
  { name: 'RAG', group: 'rag' },
  { name: 'LangGraph', group: 'rag' },
  { name: 'ReAct', group: 'rag' },
  { name: 'LoRA', group: 'train' },
  { name: 'Transformer', group: 'train' },
  { name: 'SFT', group: 'train' },
  { name: 'RLHF', group: 'train' },
  { name: 'Python', group: 'backend' },
  { name: 'FastAPI', group: 'backend' },
  { name: 'MySQL', group: 'backend' },
  { name: 'Chroma', group: 'backend' },
  { name: 'Redis', group: 'backend' },
  { name: 'SSE', group: 'backend' },
  { name: 'Linux', group: 'infra' },
  { name: 'Git', group: 'infra' },
];

export const stats = [
  { value: '0→1', label: '完整产品闭环', note: '需求 · 方案 · 原型 · 开发 · 验收 · 复盘', level: 6 },
  { value: '4', label: '项荣誉与嘉奖', note: '单位嘉奖 · 四有优秀个人 · 集体三等功 ×2', level: 4 },
  { value: '3', label: '段深度项目实践', note: 'C/B 端 AI 系统 · 多模态评测 · ERP', level: 3 },
  { value: '12+', label: '主流 AI 工具链', note: 'Codex · Claude Code · Cursor · Coze · MCP', level: 12 },
];

/** 图幅规格：全站四个板块共用一张"地图"，按比例尺逐级放大 */
export const survey = {
  about: [
    ['TILE', '01'],
    ['GRID', '22.5431°N 114.0579°E'],
    ['DATUM', 'WGS 84'],
  ],
  work: [
    ['TILE', '02'],
    ['SCALE', '1:50 000'],
    ['CONTOUR', '20 M'],
  ],
  strengths: [
    ['TILE', '03'],
    ['SCALE', '1:25 000'],
    ['CONTOUR', '10 M'],
  ],
  contact: [
    ['TILE', '04'],
    ['SCALE', '1:10 000'],
    ['CONTOUR', '5 M'],
  ],
};

export const about = {
  kicker: '01 · PROFILE',
  title: '个人经历',
  note: '技术出身的 AI 产品经理。既能把业务侧的真实痛点梳理成可执行的产品方案，也能亲手完成 Demo 与后端原型验证，把「模型能不能做」判断成「产品该不该做」。',
  paragraphs: [
    '我是李彬，深圳技术大学物联网工程专业 2026 届毕业生，目标是 AI 产品经理。相比做一个会聊天的 Demo，我更关心 AI 在真实业务里能不能被验证、被度量、被复盘。',
    '在深圳市睫芙美妆有限公司担任 AI 应用助理期间，我参与 PHP 版 ERP 的物料管理、法务审批与发票票据模块迭代，记录业务侧真实痛点并输出业务流程梳理文档；此后独立完成「FitHub 健身管理系统」与「工业文档多模态智能解析与评测平台」两个 AI 项目，从需求与方案设计、风险与异常体系设计到全链路可观测与原型技术验证形成完整闭环。',
  ],
  contacts: [
    { label: '邮箱', value: profile.email, href: `mailto:${profile.email}` },
    { label: '电话', value: profile.phone, href: `tel:${profile.phone}` },
    { label: '所在城市', value: '深圳 · 广东' },
    { label: '求职意向', value: 'AI 产品经理 · 全职' },
  ],
};

export const timeline = [
  {
    period: '2026.05 — 至今',
    org: 'FitHub 健身管理系统',
    role: '个人项目 · 独立设计与开发',
    detail:
      'C 端 + B 端一体化健身管理系统，集成大模型与 RAG 向量检索；主导产品方案与 AI 能力边界划分、RAG 管线、全链路可观测与失败兜底体系建设。',
  },
  {
    period: '2026.08 — 2026.09',
    org: '工业文档多模态智能解析与评测平台',
    role: '个人项目 · 独立设计开发',
    detail:
      '面向工业技术文档多模态推理问答评测任务，独立完成一站式多模态 RAG 评测工作台的产品方案、原型搭建与模型效果验证。',
  },
  {
    period: '2024.10 — 2025.02',
    org: '深圳市睫芙美妆有限公司',
    role: 'AI 应用助理（实习）',
    detail:
      '深度参与 PHP 版 ERP 业务模块迭代，对接内部业务人员梳理物料管理、法务审批与发票票据流程，输出业务流程梳理文档，并参与功能验收与业务逻辑验证。',
  },
];

export const projects = [
  {
    index: '01',
    kind: '个人项目 · C 端 + B 端 AI 系统',
    title: 'FitHub 健身管理系统',
    period: '2026.05 — 至今',
    image: '/media/project-fithub.svg',
    repo: 'https://github.com/2539996722/Fitness-ManagementSystem',
    summary:
      'C 端 + B 端一体化的健身管理系统，集成大模型与 RAG 向量检索：C 端提供动作库浏览、手动 / AI 生成训练计划、AI 健身问答与打卡；B 端覆盖会员管理、计划模板审核、数据看板与三栏人工会话工作台，打通「自助咨询 → 人工接管」闭环。',
    responsibilities: [
      {
        title: '产品方案与架构',
        text: '划分用户对话、计划生成、动作检索三条 AI 能力链路，设计会话状态机与角色路由；定义 user / trainer / admin 三类角色的 RBAC 权限边界。',
      },
      {
        title: 'RAG 与检索管线',
        text: '用 Chroma 嵌入式向量库隔离存储 1324 个动作与知识库文档，动作 RAG 与多知识库 RAG 两条管线并跑，Redis 缓存最近 5 轮上下文。',
      },
      {
        title: '全链路可观测',
        text: '埋点 Query、意图识别、检索、工具调用、LLM 生成与消息持久化；Token、耗时、错误码落库，支持按会话 ID 复现 Bad Case 并驱动迭代。',
      },
      {
        title: '强校验与失败兜底',
        text: '校验动作 ID 合法性与计划字段完整性，异常时触发 RAG 重生成；LLM 异常返回友好引导而非 500，SSE 断连主动关闭上游连接止损。',
      },
    ],
    metrics: [
      { value: '1324', label: '动作库向量化' },
      { value: '02', label: '条 RAG 管线' },
      { value: '03', label: '类角色权限' },
      { value: '385', label: '条单测通过' },
    ],
    flow: ['Redis 取近 5 轮上下文', 'MySQL 拉取用户画像', 'Chroma 检索 Top-K 动作', 'LLM 流式生成 SSE', '落库 + Trace 埋点'],
    tags: ['FastAPI', 'Chroma RAG', 'Redis', 'SSE 流式', 'RBAC', '链路追踪'],
  },
  {
    index: '02',
    kind: '独立项目 · AI 评测平台',
    title: '工业文档多模态智能解析与评测平台',
    period: '2026.08 — 2026.09',
    image: '/media/project-rag.svg',
    repo: 'https://github.com/2539996722/Multimodal-Reasoning-Question-Answering',
    summary:
      '针对工业专利 PDF 图文混排、扫描件分辨率低导致传统检索问答效果差的问题，独立设计一站式多模态 RAG 评测工作台，解决低质量 PDF 解析、证据溯源、模型效果难以量化评估三个产品问题。',
    responsibilities: [
      {
        title: '需求与方案设计',
        text: '定义完整链路：PDF 解析 + 低质量页面自动 OCR → 文档分块 → 向量化索引 → 召回 + 重排 → 图文联合输入多模态大模型生成答案；设计纯视觉、OCR 增强两套基线做效果对照。',
      },
      {
        title: '风险与异常体系',
        text: '针对解析失败、索引异常、模型调用失败设计多级降级路径，全链路 Trace 可审计；就 VLM 图纸识别不足调研并选择 LoRA 微调，完成微调与服务接入原型验证。',
      },
      {
        title: '评测体系构建',
        text: '支持批量评测与单题分析，统计答案准确率与失败 case 分布，按比赛标准导出 JSONL，沉淀 badcase 驱动链路策略迭代。',
      },
      {
        title: '原型与技术验证',
        text: '完成平台整体产品方案与后端原型搭建，统一管理多类型模型 API 端点，实现密钥脱敏与连通性校验。',
      },
    ],
    metrics: [
      { value: '06', label: '链路环节' },
      { value: '04', label: '类降级路径' },
      { value: '02', label: '效果对照基线' },
      { value: 'JSONL', label: '标准评测导出' },
    ],
    flow: ['PDF 解析 + 低质页 OCR', '文档分块', '向量化索引', '召回 + 重排', '图文联合生成', 'Trace 与评测'],
    tags: ['多模态 RAG', 'PDF / OCR 解析', 'Agent 评测', 'LoRA 微调', '链路 Trace'],
  },
  {
    index: '03',
    kind: '实习项目 · 企业系统',
    title: '智能 ERP 业务系统与 B 端 AI 改造',
    period: '2024.10 — 2025.02',
    image: '/media/project-erp.svg',
    summary:
      '参与 PHP 版 ERP 业务模块迭代，打通物料管理、法务审批与发票票据全流程；基于业务侧真实痛点，沉淀票据录入、单据信息提取场景的 B 端 AI 改造思路。',
    responsibilities: [
      {
        title: '业务流程梳理',
        text: '对接内部业务人员，梳理物料管理、法务审批、发票票据业务流程，记录业务侧实际痛点并输出业务流程梳理文档，辅助团队评估功能需求合理性。',
      },
      {
        title: '发票管理模块落地',
        text: '梳理发票录入、客户档案维护、单据流转全业务规则，识别重复单据、信息缺失等业务边界与异常场景，协助团队完成功能验收与业务逻辑验证。',
      },
      {
        title: 'AI 落地可行性推演',
        text: '结合 ERP 业务理解，评估 AI 在票据录入、单据信息提取场景的落地可能性，沉淀 B 端企业系统的 AI 改造思考。',
      },
    ],
    metrics: [
      { value: '03', label: '大业务模块' },
      { value: '02', label: '类异常场景' },
      { value: '01', label: '套流程梳理文档' },
      { value: 'B 端', label: '系统改造方向' },
    ],
    flow: ['物料档案维护', '法务审批流转', '发票录入校验', '异常场景阻断', '归档与复盘'],
    tags: ['ERP 业务', '发票 / 单据', '流程梳理', 'B 端 AI 改造'],
  },
];

export const strengths = [
  {
    index: '01',
    title: '技术背景扎实',
    text: '掌握 Python、MySQL、Linux、Git 等工具，理解 AI 产品背后的技术原理，能与算法、研发高效沟通，快速完成产品 Demo 与原型验证。',
    tags: ['Python', 'MySQL', 'Linux', 'Git'],
  },
  {
    index: '02',
    title: '结果导向，高度自律',
    text: '目标感强，结果导向，喜欢挑战新事物，自我驱动、务实求真，抗压皮实，坐得住。',
    tags: ['自我驱动', '务实求真', '抗压'],
  },
  {
    index: '03',
    title: '持续自学的开发者',
    text: '热爱编程，主动学习新技术，业余时间保持持续自学，用知识武装自己，跟得上 AI 迭代节奏。',
    tags: ['持续学习', '前沿跟踪', '工程实践'],
  },
  {
    index: '04',
    title: '责任心与使命感',
    text: '能够把所学应用到实际工作中，乐于分享，愿用所学帮助他人共同成长。',
    tags: ['责任心', '乐于分享', '团队'],
  },
  {
    index: '05',
    title: '表达与文档能力',
    text: '沟通表达准确，能清晰传递产品理念与需求，输出高质量产品白皮书、用户手册等规范文档。',
    tags: ['产品白皮书', '用户手册', '需求评审'],
  },
];

export const contact = {
  kicker: '05 · CONTACT',
  title: '让 AI 能力，\n落地成可用的产品',
  lead: '熟悉 Agent 工作流、RAG 应用、提示工程与模型选型，可共同定义需求、设计方案、搭建验证闭环，完成 AI 产品从 0 到 1 交付。',
  channels: [
    { label: '邮箱', value: profile.email, href: `mailto:${profile.email}` },
    { label: '电话', value: profile.phone, href: `tel:${profile.phone}` },
    { label: '城市', value: '深圳 · 广东' },
  ],
};






