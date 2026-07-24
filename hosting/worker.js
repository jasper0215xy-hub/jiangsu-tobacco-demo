const now = "2026-07-01 08:00";
const metrics = [
  {
    code: "sales_plan_progress",
    name: "销售计划进度",
    value: 96.8,
    target: 96,
    unit: "%",
    status: "normal",
    trend: [88.2, 90.1, 93.4, 95.2, 96.8],
    definition: "演示实际完成量 / 演示计划量 × 100%",
  },
  {
    code: "tax_profit_progress",
    name: "税利目标完成进度",
    value: 94.6,
    target: 96,
    unit: "%",
    status: "attention",
    trend: [89.1, 91.8, 93.2, 94.1, 94.6],
    definition: "演示税利累计完成额 / 演示年度目标 × 100%",
  },
  {
    code: "sales_structure_index",
    name: "销售结构指数",
    value: 101.7,
    target: 102.5,
    unit: "指数",
    status: "attention",
    trend: [100.2, 100.8, 101.3, 101.5, 101.7],
    definition: "反映演示品类与价位结构的综合指数",
  },
  {
    code: "inventory_status_index",
    name: "库存状态指数",
    value: 114.2,
    target: 105,
    unit: "指数",
    status: "warning",
    trend: [98.3, 101.1, 104.5, 109.4, 114.2],
    definition: "反映演示库存周转与存销比状态的综合指数",
  },
  {
    code: "price_status_index",
    name: "价格状态指数",
    value: 99.4,
    target: 100,
    unit: "指数",
    status: "normal",
    trend: [100.1, 99.7, 99.8, 99.6, 99.4],
    definition: "反映演示市场价格稳定性的综合指数",
  },
];
const warnings = [
  {
    id: "warning-inventory-v1",
    title: "库存状态指数触发预警",
    level: "warning",
    indicatorCode: "inventory_status_index",
    description:
      "全省库存状态指数为 114.2，高于演示预警阈值 110；示范地市乙为主要影响组织。",
    ownerDepartment: "营销运行演示部门",
    deadline: "2026-07-08",
    status: "analysing",
  },
  {
    id: "warning-tax-v1",
    title: "税利目标完成进度需关注",
    level: "attention",
    indicatorCode: "tax_profit_progress",
    description: "税利目标完成进度为 94.6%，较当前演示目标低 1.4 个百分点。",
    ownerDepartment: "财务管理演示部门",
    deadline: "2026-07-10",
    status: "new",
  },
  {
    id: "warning-structure-v1",
    title: "销售结构指数阶段性偏离",
    level: "attention",
    indicatorCode: "sales_structure_index",
    description: "销售结构指数为 101.7，低于演示目标 0.8。",
    ownerDepartment: "营销运行演示部门",
    deadline: "2026-07-12",
    status: "new",
  },
];
const orgRows = [
  { name: "示范地市甲", value: 103.1, status: "normal" },
  { name: "示范地市乙", value: 126.8, status: "warning" },
  { name: "示范地市丙", value: 112.7, status: "attention" },
];
const demos = [
  { id: "overall", title: "月度总体运行分析", tag: "主营演示" },
  { id: "tax", title: "税利进度差异研判", tag: "新增数据" },
  { id: "structure", title: "销售结构与价格联动分析", tag: "新增数据" },
];
const module = (title, subtitle, stats, item, list) => ({
  title,
  subtitle,
  stats,
  item,
  list,
});
const modules = {
  strategy: module(
    "战略规划",
    "战略目标分解、年度任务与执行预警",
    [
      ["战略目标", "18"],
      ["正常推进", "14"],
      ["需关注", "3"],
      ["滞后任务", "1"],
    ],
    {
      title: "建设高质量发展示范目标",
      status: "滞后",
      detail: "年度重点任务 3 项；阶段进度低于计划 8 个百分点。",
      action: "发起跟踪提醒",
    },
    ["年度经营目标分解", "重点改革任务推进", "基层治理能力提升"],
  ),
  performance: module(
    "目标绩效",
    "统一指标、偏离预警与整改闭环",
    [
      ["考核指标", "56"],
      ["正常完成", "45"],
      ["关注指标", "8"],
      ["偏离预警", "3"],
    ],
    {
      title: "重点任务及时完成率",
      status: "偏离",
      detail: "当前 91.2%，较目标低 3.8 个百分点。",
      action: "生成整改任务",
    },
    ["省级重点指标", "部门考核指标", "预警整改进度"],
  ),
  innovation: module(
    "科技创新",
    "项目生命周期、里程碑和成果转化",
    [
      ["项目总数", "32"],
      ["实施中", "18"],
      ["临近验收", "6"],
      ["延期风险", "2"],
    ],
    {
      title: "数字化运营工具研究项目",
      status: "延期风险",
      detail: "阶段材料待补充，验收节点临近。",
      action: "发起进度提醒",
    },
    ["项目阶段分布", "里程碑执行情况", "成果转化清单"],
  ),
  benchmarking: module(
    "对追达创",
    "对标发现差距、追标推动改进、创标沉淀经验",
    [
      ["对标指标", "28"],
      ["先进", "9"],
      ["持平", "13"],
      ["落后", "6"],
    ],
    {
      title: "终端动销效率对标指标",
      status: "落后",
      detail: "与演示标杆差距 4.6 个百分点。",
      action: "创建追标任务",
    },
    ["对标差距分析", "追标计划执行", "创标案例库"],
  ),
};
let tasks = new Map(),
  reports = [],
  taskDrafts = [],
  mode = "auto";
const meta = () => ({
  request_id: crypto.randomUUID(),
  scenario_id: "economy-monthly-v1",
  data_version: "2026-demo-v1",
});
const send = (data, status = 200) =>
  new Response(JSON.stringify({ data, meta: meta() }), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
const error = (message, status = 400, details = {}) =>
  send(
    { error: { code: "DEMO_ERROR", message, recoverable: true, ...details } },
    status,
  );
const statusOf = (metric, value, target) =>
  metric.code === "inventory_status_index"
    ? value > target + 5
      ? "warning"
      : value > target
        ? "attention"
        : "normal"
    : value < target
      ? "attention"
      : "normal";
function analyse(overrides = [], caseId = "overall") {
  const input = overrides.length
    ? overrides
    : metrics.map((x) => ({
        indicatorCode: x.code,
        value: x.value,
        targetValue: x.target,
      }));
  const selected = input
    .map((x) => ({
      ...x,
      metric: metrics.find((m) => m.code === x.indicatorCode),
    }))
    .filter((x) => x.metric);
  const names = selected.map((x) => x.metric.name).join("、");
  const riskRows = selected.filter(
    (x) => statusOf(x.metric, x.value, x.targetValue) !== "normal",
  );
  const risks = (riskRows.length ? riskRows : selected.slice(0, 1)).map(
    (x, i) => ({
      id: `R-U${i + 1}`,
      title: `${x.metric.name}${statusOf(x.metric, x.value, x.targetValue) === "warning" ? "预警" : "偏离"}风险`,
      level:
        statusOf(x.metric, x.value, x.targetValue) === "warning"
          ? "warning"
          : "attention",
      description: `${x.metric.name}与本次设定目标存在差异，应核验组织、结构或业务对象明细后处置。`,
      evidenceIds: ["E1", "E3"],
    }),
  );
  const focus =
    caseId === "tax"
      ? "税利进度与结构贡献"
      : caseId === "structure"
        ? "销售结构与价格联动"
        : "当前经济运行";
  const evidence = [
    {
      id: "E1",
      type: "data",
      title: "本次分析数据快照",
      source: "合成演示数据集",
      updatedAt: now,
      summary: `本次选择指标：${names}。数据为业务人员选择并确认的合成演示数据。`,
    },
    {
      id: "E2",
      type: "definition",
      title: "指标口径",
      source: "指标口径库",
      updatedAt: now,
      summary: "指标值、目标值及单位均依据演示口径计算。",
    },
    {
      id: "E3",
      type: "calculation",
      title: "目标差异计算",
      source: "受控计算服务",
      updatedAt: now,
      summary: "已按本次选择数据计算各指标与目标的差异。",
    },
    {
      id: "E4",
      type: "warning",
      title: "经济运行预警",
      source: "预警中心",
      updatedAt: now,
      summary: "预警与目标差异已纳入分析。",
    },
    {
      id: "E5",
      type: "knowledge",
      title: "月度经济运行分析与处置模板",
      source: "演示业务知识库",
      updatedAt: now,
      summary: "建议先核查重点组织、结构和动销明细，并形成分类调控措施。",
    },
  ];
  return {
    status: "ai_draft",
    overallJudgement: `本次围绕${focus}，基于业务人员选择并确认的 ${selected.length} 项合成演示数据（${names}）生成。系统已计算目标差异，并将偏离项列为待核验风险。`,
    keyMetrics: selected.map((x) => ({
      indicatorCode: x.metric.code,
      displayName: x.metric.name,
      currentValue: x.value,
      unit: x.metric.unit,
      status: statusOf(x.metric, x.value, x.targetValue),
      summary: `当前值 ${x.value}${x.metric.unit}，目标 ${x.targetValue}${x.metric.unit}。`,
      evidenceIds: ["E1", "E3"],
    })),
    variances: selected.map((x, i) => ({
      id: `V-U${i + 1}`,
      subject: x.metric.name,
      description: `${x.metric.name}当前值 ${x.value}${x.metric.unit}，目标 ${x.targetValue}${x.metric.unit}。`,
      evidenceIds: ["E1", "E3"],
    })),
    risks,
    facts: selected.map((x, i) => ({
      id: `F-U${i + 1}`,
      content: `本次分析选取的${x.metric.name}为 ${x.value}${x.metric.unit}，目标为 ${x.targetValue}${x.metric.unit}。`,
      evidenceIds: ["E1", "E3"],
    })),
    hypotheses: [
      {
        id: "H-U1",
        content:
          "指标差异可能与组织、结构、动销或投放节奏有关；该判断属于待业务核验的分析假设。",
        verificationSuggestion: "按组织、品类和价位段下钻核验构成和变化来源。",
        evidenceIds: ["E1", "E5"],
      },
    ],
    recommendations: risks.map((risk, i) => ({
      id: `REC-U${i + 1}`,
      title: `核验并跟踪${risk.title}`,
      description:
        "围绕本次提交的演示数据开展明细核验，形成责任到人、时限明确的处置清单。",
      relatedRiskIds: [risk.id],
      knowledgeEvidenceIds: ["E5"],
    })),
    reportOutline: [
      "总体运行情况",
      "目标完成情况",
      "结构分析",
      "市场状态",
      "税利贡献",
      "存在问题",
      "后续建议",
    ].map((title) => ({
      title,
      content: `${title}：基于本次选择的 ${names} 及已核验证据形成初稿。`,
      evidenceIds: ["E1", "E3"],
    })),
    evidence,
  };
}
async function enrichWithKimi(result, env) {
  if (!env.MODEL_API_KEY) throw new Error("KIMI_MODEL_NOT_CONFIGURED");
  const response = await fetch(
    `${(env.MODEL_BASE_URL || "https://api.moonshot.cn/v1").replace(/\/$/, "")}/chat/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.MODEL_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.MODEL_NAME || "kimi-k3",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              '你是经济运行分析的文字润色助手。不得增加任何数值、事实、原因或建议，只能将给定总体判断改写为专业、谨慎的中文；返回 JSON：{"overallJudgement":string}。',
          },
          {
            role: "user",
            content: JSON.stringify({ judgement: result.overallJudgement }),
          },
        ],
      }),
    },
  );
  if (!response.ok) {
    const failurePayload = await response.json().catch(() => null);
    const failure = new Error(`KIMI_MODEL_HTTP_${response.status}`);
    failure.safeDetail = String(
      failurePayload?.error?.message || "Upstream request rejected",
    )
      .replace(/sk-[A-Za-z0-9_-]+/g, "[redacted]")
      .slice(0, 240);
    throw failure;
  }
  const payload = await response.json();
  const content = JSON.parse(payload.choices?.[0]?.message?.content || "{}");
  const sourceNumbers = new Set(
    result.overallJudgement.match(/\d+(?:\.\d+)?/g) || [],
  );
  const returnedNumbers = content.overallJudgement?.match(/\d+(?:\.\d+)?/g) || [];
  if (
    typeof content.overallJudgement !== "string" ||
    content.overallJudgement.length <= 20 ||
    returnedNumbers.some((value) => !sourceNumbers.has(value))
  )
    throw new Error("KIMI_MODEL_INVALID_RESPONSE");
  result.overallJudgement = content.overallJudgement;
  return result;
}
function events(task) {
  const e = new TextEncoder();
  return new Response(
    new ReadableStream({
      start(c) {
        const out = (type, data) =>
          c.enqueue(
            e.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`),
          );
        out("task.started", { taskId: task.id });
        task.steps.forEach((step, i) => {
          step.status = "completed";
          step.summary = [
            "范围与数据快照已确认",
            "已获取选择指标",
            "已核对演示口径",
            "已计算差异和风险",
            "已匹配处置模板",
            "已生成结构化分析草稿",
          ][i];
          out("step.completed", step);
        });
        out("analysis.draft", task.result);
        out("task.completed", { taskId: task.id });
        c.close();
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
async function api(request, url, env) {
  const path = url.pathname,
    p = path.split("/").filter(Boolean),
    body =
      request.method === "GET" ? {} : await request.json().catch(() => ({}));
  if (path === "/api/portal/summary")
    return send({
      modules: [
        { key: "strategy", name: "战略规划", status: "1 项任务滞后", todos: 2 },
        {
          key: "performance",
          name: "目标绩效",
          status: "3 项指标偏离",
          todos: 3,
        },
        { key: "economy", name: "经济运行", status: "3 条运行预警", todos: 2 },
        {
          key: "innovation",
          name: "科技创新",
          status: "2 个延期风险",
          todos: 1,
        },
        {
          key: "benchmarking",
          name: "对追达创",
          status: "6 项追标任务",
          todos: 2,
        },
      ],
      warnings,
      reports,
      tasks: taskDrafts,
    });
  if (p[1] === "modules" && request.method === "GET")
    return modules[p[2]] ? send(modules[p[2]]) : error("未找到模块", 404);
  if (path === "/api/economy/dashboard")
    return send({
      metrics,
      warning: warnings[0],
      warnings,
      demoCases: demos,
      orgRows,
      reportCount: reports.length,
      taskCount: taskDrafts.length,
      trendLabels: ["03月", "04月", "05月", "06月", "07月"],
    });
  if (p[1] === "indicators" && request.method === "GET") {
    const m = metrics.find((x) => x.code === p[2]);
    return m
      ? send({
          metric: m,
          warning: warnings.find((x) => x.indicatorCode === m.code) || null,
          organizationBreakdown:
            m.code === "inventory_status_index"
              ? orgRows
              : orgRows.map((x, i) => ({
                  ...x,
                  value: Math.round(m.value + (i - 1) * 2.1),
                })),
        })
      : error("指标不可用", 404);
  }
  if (p[1] === "warnings" && request.method === "GET") {
    const w = warnings.find((x) => x.id === p[2]);
    return w
      ? send({
          event: w,
          rule: {
            expression: "演示指标触发阈值",
            description: "当前状态已进入演示预警管理流程",
          },
        })
      : error("未找到预警", 404);
  }
  if (path === "/api/analysis/tasks" && request.method === "POST") {
    let result;
    try {
      result = await enrichWithKimi(
        analyse(body.context?.data_overrides, body.context?.scenario_id),
        env,
      );
    } catch (caught) {
      const modelError =
        caught instanceof Error &&
        /^KIMI_MODEL_(HTTP_\d+|NOT_CONFIGURED|INVALID_RESPONSE)$/.test(
          caught.message,
        )
          ? caught.message
          : "KIMI_MODEL_RESPONSE_ERROR";
      const modelErrorDetail =
        caught instanceof Error && typeof caught.safeDetail === "string"
          ? caught.safeDetail
          : undefined;
      return error(
        "Kimi K3 实时模型不可用，当前分析未执行。请检查服务端模型配置或网络后重试。",
        503,
        { model_error: modelError, model_error_detail: modelErrorDetail },
      );
    }
    const task = {
      id: crypto.randomUUID(),
      status: "draft",
      question: body.question,
      context: body.context || {},
      steps: [
        "正在确认分析范围",
        "正在查询指标数据",
        "正在核对指标口径",
        "正在分析差异和风险",
        "正在检索业务知识",
        "正在生成分析草稿",
      ].map((label, i) => ({ id: `S${i + 1}`, label, status: "pending" })),
      result,
    };
    tasks.set(task.id, task);
    return send(task, 201);
  }
  if (p[1] === "analysis" && p[2] === "tasks" && p[4] === "events")
    return tasks.has(p[3])
      ? events(tasks.get(p[3]))
      : error("分析任务不存在", 404);
  if (p[1] === "analysis" && p[2] === "tasks" && p[4] === "confirm") {
    const task = tasks.get(p[3]);
    if (!task) return error("分析任务不存在", 404);
    task.status = "confirmed";
    task.confirmedBy = body.confirmed_by;
    task.confirmedAt = now;
    if (body.edited_result) task.result = body.edited_result;
    return send(task);
  }
  if (p[1] === "analysis" && p[2] === "tasks")
    return tasks.has(p[3])
      ? send(tasks.get(p[3]))
      : error("分析任务不存在", 404);
  if (path === "/api/reports/drafts") {
    const task = tasks.get(body.analysisTaskId);
    if (!task || task.status !== "confirmed")
      return error("请先完成人工确认后再保存通报", 409);
    const report = {
      id: crypto.randomUUID(),
      title: "月度经济运行分析通报（演示草稿）",
      status: "confirmed",
      period: task.context.period,
      sections: task.result.reportOutline,
      confirmedBy: task.confirmedBy,
      updatedAt: now,
    };
    reports.unshift(report);
    return send(report, 201);
  }
  if (path === "/api/tasks/drafts" && request.method === "POST") {
    const task = tasks.get(body.analysisTaskId);
    if (!task || task.status !== "confirmed")
      return error("请先完成人工确认后再生成督办任务", 409);
    const risk =
      task.result.risks.find((x) => x.id === body.riskId) ||
      task.result.risks[0];
    const draft = {
      id: crypto.randomUUID(),
      title: `督办：${risk.title}`,
      status: "draft",
      responsibleDepartment: "营销运行演示部门",
      deadline: "2026-07-08",
      requirements: "核验问题范围，制定分类处置措施，并上传演示佐证材料。",
      risk,
    };
    taskDrafts.unshift(draft);
    return send(draft, 201);
  }
  if (p[1] === "tasks" && p[2] === "drafts" && request.method === "PATCH") {
    const i = taskDrafts.findIndex((x) => x.id === p[3]);
    if (i < 0) return error("督办任务草稿不存在", 404);
    taskDrafts[i] = {
      ...taskDrafts[i],
      ...body,
      status: "saved",
      updatedAt: now,
    };
    return send(taskDrafts[i]);
  }
  if (path === "/api/simulation/tax-profit") {
    const x = body.parameters || {},
      uplift =
        (x.structure_assumption === "optimized" ? 0.9 : 0) +
        (x.inventory_assumption === "controlled" ? 0.7 : 0) +
        (x.price_assumption === "stable" ? 0.4 : -0.2);
    return send({
      baseline: 94.6,
      projected: Number((94.6 + uplift).toFixed(1)),
      contributions: [
        { name: "销售结构优化", value: 0.9 },
        { name: "库存受控", value: 0.7 },
        { name: "价格稳定", value: 0.4 },
      ],
      recommendation:
        "建议以库存受控与结构优化的组合措施优先改善税利完成路径。",
      boundary: "仅用于合成演示数据下的辅助决策，不代表真实预测。",
    });
  }
  if (path === "/api/demo/health")
    return send({
      api: "healthy",
      model: env.MODEL_API_KEY ? "Kimi K3 已配置" : "Kimi K3 未配置",
      modelRequired: true,
      scenarioId: "economy-monthly-v1",
      dataVersion: "2026-demo-v1",
      mode,
    });
  if (path === "/api/demo/mode") {
    mode = body.mode || "auto";
    return send({ mode });
  }
  if (path === "/api/demo/reset") {
    tasks = new Map();
    reports = [];
    taskDrafts = [];
    mode = "auto";
    return send({ reset: true, message: "已恢复固定演示场景" });
  }
  return error("接口不存在", 404);
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS")
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    if (url.pathname.startsWith("/api/")) return api(request, url, env);
    const asset = await env.ASSETS.fetch(request);
    return asset.status !== 404 || url.pathname.includes(".")
      ? asset
      : env.ASSETS.fetch(new Request(new URL("/index.html", request.url)));
  },
};
