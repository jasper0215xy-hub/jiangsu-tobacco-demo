import Fastify from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";

const app = Fastify({ logger: false });
await app.register(cors, { origin: true });

const scenarioId = "economy-monthly-v1";
const dataVersion = "2026-demo-v1";
const now = "2026-07-01 08:00";
const metrics = [
  {
    code: "sales_plan_progress",
    name: "销售计划进度",
    value: 96.8,
    target: 96.0,
    unit: "%",
    status: "normal",
    trend: [88.2, 90.1, 93.4, 95.2, 96.8],
    definition: "演示实际完成量 / 演示计划量 × 100%",
  },
  {
    code: "tax_profit_progress",
    name: "税利目标完成进度",
    value: 94.6,
    target: 96.0,
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
const warning = {
  id: "warning-inventory-v1",
  title: "库存状态指数触发预警",
  level: "warning",
  indicatorCode: "inventory_status_index",
  description:
    "全省库存状态指数为 114.2，高于演示预警阈值 110；示范地市乙为主要影响组织。",
  ownerDepartment: "营销运行演示部门",
  deadline: "2026-07-08",
  status: "analysing",
};
const warnings = [
  warning,
  {
    id: "warning-tax-v1",
    title: "税利目标完成进度需关注",
    level: "attention",
    indicatorCode: "tax_profit_progress",
    description:
      "税利目标完成进度为 94.6%，较当前演示目标低 1.4 个百分点；需核验结构贡献与重点组织进度。",
    ownerDepartment: "财务管理演示部门",
    deadline: "2026-07-10",
    status: "new",
  },
  {
    id: "warning-structure-v1",
    title: "销售结构指数阶段性偏离",
    level: "attention",
    indicatorCode: "sales_structure_index",
    description:
      "销售结构指数为 101.7，低于演示目标 0.8；中高价位段贡献需进一步核验。",
    ownerDepartment: "营销运行演示部门",
    deadline: "2026-07-12",
    status: "new",
  },
];
const demoCases = [
  {
    id: "overall",
    title: "月度总体运行分析",
    tag: "主营演示",
    indicator: "销售、税利、结构、库存、价格",
    question:
      "请分析当前周期全省经济运行情况，重点关注销售进度、税利完成、销售结构、库存价格状态；说明主要变化、风险点、可能原因和管理建议，并形成月度分析通报框架。",
    action: "生成月度通报与督办任务",
  },
  {
    id: "tax",
    title: "税利进度差异研判",
    tag: "新增数据",
    indicator: "税利目标完成进度 94.6%",
    question:
      "请基于当前演示数据分析税利目标完成进度的差异，识别重点关注组织和结构贡献线索，形成核验建议与跟踪任务草稿。",
    action: "形成税利进度跟踪任务",
  },
  {
    id: "structure",
    title: "销售结构与价格联动分析",
    tag: "新增数据",
    indicator: "结构指数 101.7 / 价格指数 99.4",
    question:
      "请分析销售结构指数和价格状态的联动情况，区分已证实的数据事实与待核验原因，并形成针对中高价位段的管理建议。",
    action: "形成结构优化建议",
  },
];
const orgRows = [
  { name: "示范地市甲", value: 103.1, status: "normal" },
  { name: "示范地市乙", value: 126.8, status: "warning" },
  { name: "示范地市丙", value: 112.7, status: "attention" },
];
const moduleData: Record<string, any> = {
  strategy: {
    title: "战略规划",
    subtitle: "战略目标分解、年度任务与执行预警",
    stats: [
      ["战略目标", "18"],
      ["正常推进", "14"],
      ["需关注", "3"],
      ["滞后任务", "1"],
    ],
    item: {
      title: "建设高质量发展示范目标",
      status: "滞后",
      detail:
        "关联综合计划演示部门，年度重点任务 3 项；阶段进度低于计划 8 个百分点。",
      action: "发起跟踪提醒",
    },
    list: ["年度经营目标分解", "重点改革任务推进", "基层治理能力提升"],
  },
  performance: {
    title: "目标绩效",
    subtitle: "统一指标、偏离预警与整改闭环",
    stats: [
      ["考核指标", "56"],
      ["正常完成", "45"],
      ["关注指标", "8"],
      ["偏离预警", "3"],
    ],
    item: {
      title: "重点任务及时完成率",
      status: "偏离",
      detail: "当前 91.2%，较目标低 3.8 个百分点；归口部门为综合管理演示部门。",
      action: "生成整改任务",
    },
    list: ["省级重点指标", "部门考核指标", "预警整改进度"],
  },
  innovation: {
    title: "科技创新",
    subtitle: "项目生命周期、里程碑和成果转化",
    stats: [
      ["项目总数", "32"],
      ["实施中", "18"],
      ["临近验收", "6"],
      ["延期风险", "2"],
    ],
    item: {
      title: "数字化运营工具研究项目",
      status: "延期风险",
      detail: "阶段材料待补充，验收节点临近；项目经费执行与里程碑需同步核验。",
      action: "发起进度提醒",
    },
    list: ["项目阶段分布", "里程碑执行情况", "成果转化清单"],
  },
  benchmarking: {
    title: "对追达创",
    subtitle: "对标发现差距、追标推动改进、创标沉淀经验",
    stats: [
      ["对标指标", "28"],
      ["先进", "9"],
      ["持平", "13"],
      ["落后", "6"],
    ],
    item: {
      title: "终端动销效率对标指标",
      status: "落后",
      detail: "与演示标杆差距 4.6 个百分点，已匹配追标措施与阶段里程碑。",
      action: "创建追标任务",
    },
    list: ["对标差距分析", "追标计划执行", "创标案例库"],
  },
};
type Task = {
  id: string;
  status: string;
  question: string;
  context: any;
  steps: any[];
  result: any;
  confirmedBy?: string;
  confirmedAt?: string;
};
let tasks = new Map<string, Task>();
let reports: any[] = [];
let businessTasks: any[] = [];
const hasLiveModel = () =>
  Boolean(process.env.MODEL_API_KEY && process.env.MODEL_BASE_URL);

function response(data: any) {
  return {
    data,
    meta: {
      request_id: crypto.randomUUID(),
      scenario_id: scenarioId,
      data_version: dataVersion,
    },
  };
}
function analysisResult() {
  const evidence = [
    {
      id: "E1",
      type: "data",
      title: "全省核心指标查询",
      source: "合成演示数据集 / economy-monthly-v1",
      updatedAt: now,
      summary:
        "查询范围：当前周期、全省；包含销售、税利、结构、库存和价格五项指标。",
    },
    {
      id: "E2",
      type: "definition",
      title: "库存状态指数口径",
      source: "指标口径库",
      updatedAt: now,
      summary: metrics[3].definition + "；归口：营销运行演示部门。",
    },
    {
      id: "E3",
      type: "calculation",
      title: "目标差异与趋势计算",
      source: "受控计算服务",
      updatedAt: now,
      summary: "库存状态指数较目标高 9.2，税利完成进度较目标低 1.4 个百分点。",
    },
    {
      id: "E4",
      type: "warning",
      title: warning.title,
      source: "预警中心",
      updatedAt: now,
      summary: warning.description,
    },
    {
      id: "E5",
      type: "knowledge",
      title: "月度经济运行分析与库存处置模板",
      source: "演示业务知识库",
      updatedAt: now,
      summary:
        "建议先核查重点组织库存结构、动销和投放节奏，并形成分类调控措施。",
    },
  ];
  return {
    status: "ai_draft",
    overallJudgement:
      "当前周期全省经济运行总体保持平稳，销售计划进度高于演示目标、价格总体稳定；但税利完成进度和销售结构需要持续关注，库存状态指数已触发预警，应优先核验示范地市乙的库存结构与动销情况。",
    keyMetrics: metrics.map((m) => ({
      indicatorCode: m.code,
      displayName: m.name,
      currentValue: m.value,
      unit: m.unit,
      status: m.status,
      summary:
        m.code === "inventory_status_index"
          ? "高于演示预警阈值，需重点处置。"
          : `当前值 ${m.value}${m.unit}，目标 ${m.target}${m.unit}。`,
      evidenceIds: [
        "E1",
        ...(m.code === "inventory_status_index" ? ["E2", "E3", "E4"] : ["E3"]),
      ],
    })),
    variances: [
      {
        id: "V1",
        subject: "库存状态",
        description:
          "库存状态指数 114.2，较目标 105 高 9.2，连续三个周期上行。",
        evidenceIds: ["E1", "E3"],
      },
      {
        id: "V2",
        subject: "税利完成",
        description: "税利目标完成进度 94.6%，较演示目标低 1.4 个百分点。",
        evidenceIds: ["E1", "E3"],
      },
    ],
    risks: [
      {
        id: "R1",
        title: "库存结构与周转风险",
        level: "warning",
        description: "示范地市乙库存状态指数 126.8，是当前预警的主要影响组织。",
        evidenceIds: ["E1", "E4"],
      },
      {
        id: "R2",
        title: "税利目标进度关注",
        level: "attention",
        description: "税利完成进度低于当前演示目标，需跟踪结构贡献和后续进度。",
        evidenceIds: ["E1", "E3"],
      },
    ],
    facts: [
      {
        id: "F1",
        content: "销售计划进度为 96.8%，高于演示目标 0.8 个百分点。",
        evidenceIds: ["E1", "E3"],
      },
      {
        id: "F2",
        content: "库存状态指数为 114.2，超过预警阈值 110。",
        evidenceIds: ["E1", "E4"],
      },
    ],
    hypotheses: [
      {
        id: "H1",
        content:
          "库存预警可能与局部品类动销节奏和投放结构不匹配有关，需结合地市明细进一步核验。",
        verificationSuggestion:
          "核验示范地市乙按品类、价位段的库存与动销明细。",
        evidenceIds: ["E1", "E5"],
      },
    ],
    recommendations: [
      {
        id: "REC1",
        title: "开展库存结构专项核验",
        description:
          "聚焦示范地市乙，按品类和价位段核验库存、动销和投放节奏，形成分类调控清单。",
        relatedRiskIds: ["R1"],
        knowledgeEvidenceIds: ["E5"],
      },
      {
        id: "REC2",
        title: "跟踪税利结构贡献",
        description:
          "将税利完成进度纳入周度跟踪，结合销售结构变化评估后续贡献路径。",
        relatedRiskIds: ["R2"],
        knowledgeEvidenceIds: ["E5"],
      },
    ],
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
      content:
        title === "存在问题"
          ? "库存状态指数触发预警，税利完成进度需持续关注；相关可能原因已单列为分析假设。"
          : `${title}：依据本期合成演示数据和已核验口径形成初稿。`,
      evidenceIds: ["E1", "E3"],
    })),
    evidence,
  };
}

function caseAnalysis(caseId = "overall") {
  const result = analysisResult();
  if (caseId === "tax") {
    result.overallJudgement =
      "当前周期税利目标完成进度为 94.6%，较演示目标低 1.4 个百分点，处于需关注状态。销售计划进度保持正常，但税利贡献路径需要结合销售结构与重点组织执行情况继续核验。";
    result.variances = [
      {
        id: "V-T1",
        subject: "税利目标完成",
        description: "税利目标完成进度 94.6%，较演示目标低 1.4 个百分点。",
        evidenceIds: ["E1", "E3"],
      },
    ];
    result.risks = [
      {
        id: "R-T1",
        title: "税利进度达成风险",
        level: "attention",
        description:
          "税利完成进度未达到当前演示目标，后续需跟踪结构贡献和重点组织进度。",
        evidenceIds: ["E1", "E3"],
      },
    ];
    result.facts = [
      {
        id: "F-T1",
        content: "税利目标完成进度为 94.6%，较演示目标低 1.4 个百分点。",
        evidenceIds: ["E1", "E3"],
      },
    ];
    result.hypotheses = [
      {
        id: "H-T1",
        content:
          "税利差异可能与销售结构阶段性变化有关，尚需按组织和价位段核验贡献。",
        verificationSuggestion:
          "按示范地市和价位段查询税利贡献、动销与结构变化。",
        evidenceIds: ["E1", "E5"],
      },
    ];
    result.recommendations = [
      {
        id: "REC-T1",
        title: "建立税利进度周度跟踪",
        description:
          "对重点组织建立税利、结构与动销联动跟踪清单，发现偏离后及时核验处置。",
        relatedRiskIds: ["R-T1"],
        knowledgeEvidenceIds: ["E5"],
      },
    ];
    result.evidence[3] = {
      id: "E4",
      type: "warning",
      title: warnings[1].title,
      source: "预警中心",
      updatedAt: now,
      summary: warnings[1].description,
    };
  }
  if (caseId === "structure") {
    result.overallJudgement =
      "销售结构指数为 101.7，较演示目标低 0.8；价格状态指数为 99.4，总体保持稳定。当前更应关注结构贡献变化，而不能仅依据价格状态推定原因。";
    result.variances = [
      {
        id: "V-S1",
        subject: "销售结构",
        description: "销售结构指数 101.7，较演示目标低 0.8。",
        evidenceIds: ["E1", "E3"],
      },
    ];
    result.risks = [
      {
        id: "R-S1",
        title: "销售结构优化风险",
        level: "attention",
        description:
          "中高价位段的结构贡献需要进一步核验，避免影响后续税利贡献路径。",
        evidenceIds: ["E1", "E3"],
      },
    ];
    result.facts = [
      {
        id: "F-S1",
        content:
          "销售结构指数为 101.7，低于演示目标 102.5；价格状态指数为 99.4，整体稳定。",
        evidenceIds: ["E1", "E3"],
      },
    ];
    result.hypotheses = [
      {
        id: "H-S1",
        content:
          "结构偏离可能与局部价位段动销节奏有关，属于待业务核验的分析假设。",
        verificationSuggestion: "核验各价位段的动销、库存和结构贡献明细。",
        evidenceIds: ["E1", "E5"],
      },
    ];
    result.recommendations = [
      {
        id: "REC-S1",
        title: "开展价位段结构核验",
        description:
          "按价位段核验动销、库存和结构贡献，形成有针对性的投放与调控建议。",
        relatedRiskIds: ["R-S1"],
        knowledgeEvidenceIds: ["E5"],
      },
    ];
    result.evidence[3] = {
      id: "E4",
      type: "warning",
      title: warnings[2].title,
      source: "预警中心",
      updatedAt: now,
      summary: warnings[2].description,
    };
  }
  return result;
}

/** Applies a user-selected synthetic-data snapshot before composing the analysis.
 * The snapshot is retained in the task context and becomes evidence E1. */
function applyDataOverrides(
  result: any,
  overrides: Array<{
    indicatorCode: string;
    value: number;
    targetValue: number;
  }> = [],
) {
  const selected = overrides
    .map((override) => ({
      metric: metrics.find((metric) => metric.code === override.indicatorCode),
      ...override,
    }))
    .filter(
      (
        row,
      ): row is {
        metric: (typeof metrics)[number];
        indicatorCode: string;
        value: number;
        targetValue: number;
      } => Boolean(row.metric),
    );
  if (!selected.length) return result;

  const statusOf = (row: (typeof selected)[number]) => {
    if (row.metric.code === "inventory_status_index")
      return row.value > row.targetValue + 5
        ? "warning"
        : row.value > row.targetValue
          ? "attention"
          : "normal";
    return row.value < row.targetValue ? "attention" : "normal";
  };
  const statusLabel: Record<string, string> = {
    normal: "正常",
    attention: "需关注",
    warning: "预警",
  };
  const names = selected.map((row) => row.metric.name).join("、");
  result.keyMetrics = selected.map((row) => {
    const status = statusOf(row);
    const gap = Number((row.value - row.targetValue).toFixed(1));
    return {
      indicatorCode: row.indicatorCode,
      displayName: row.metric.name,
      currentValue: row.value,
      unit: row.metric.unit,
      status,
      summary: `当前值 ${row.value}${row.metric.unit}，目标 ${row.targetValue}${row.metric.unit}，${gap >= 0 ? "差异 +" : "差异 "}${gap}${row.metric.unit}（${statusLabel[status]}）。`,
      evidenceIds: ["E1", "E3"],
    };
  });
  result.variances = selected.map((row, index) => ({
    id: `V-U${index + 1}`,
    subject: row.metric.name,
    description: `${row.metric.name} 当前值 ${row.value}${row.metric.unit}，目标 ${row.targetValue}${row.metric.unit}，差异 ${Number((row.value - row.targetValue).toFixed(1))}${row.metric.unit}。`,
    evidenceIds: ["E1", "E3"],
  }));
  result.facts = selected.map((row, index) => ({
    id: `F-U${index + 1}`,
    content: `本次分析选取的${row.metric.name}为 ${row.value}${row.metric.unit}，目标为 ${row.targetValue}${row.metric.unit}。`,
    evidenceIds: ["E1", "E3"],
  }));
  const risks = selected.filter((row) => statusOf(row) !== "normal");
  result.risks = risks.length
    ? risks.map((row, index) => ({
        id: `R-U${index + 1}`,
        title: `${row.metric.name}${statusOf(row) === "warning" ? "预警" : "偏离"}风险`,
        level: statusOf(row) === "warning" ? "warning" : "attention",
        description: `${row.metric.name}与本次设定目标存在差异，应核验组织、结构或业务对象明细后处置。`,
        evidenceIds: ["E1", "E3"],
      }))
    : [
        {
          id: "R-U1",
          title: "指标持续跟踪",
          level: "attention",
          description: "本次选取指标均处于目标范围附近，建议持续跟踪后续变化。",
          evidenceIds: ["E1", "E3"],
        },
      ];
  result.hypotheses = [
    {
      id: "H-U1",
      content:
        "指标差异可能与组织、结构、动销或投放节奏有关；该判断属于待业务核验的分析假设。",
      verificationSuggestion:
        "按组织、品类和价位段下钻核验本次选取指标的构成和变化来源。",
      evidenceIds: ["E1", "E5"],
    },
  ];
  result.recommendations = result.risks.map((risk: any, index: number) => ({
    id: `REC-U${index + 1}`,
    title: `核验并跟踪${risk.title}`,
    description:
      "围绕本次提交的演示数据开展明细核验，形成责任到人、时限明确的处置或跟踪清单。",
    relatedRiskIds: [risk.id],
    knowledgeEvidenceIds: ["E5"],
  }));
  result.overallJudgement = `本次分析基于业务人员选择并确认的 ${selected.length} 项合成演示数据（${names}）生成。系统已按本次设定值计算目标差异，并将偏离项列为需进一步核验的风险；可能原因均以分析假设呈现。`;
  result.evidence[0] = {
    ...result.evidence[0],
    summary: `查询范围：当前周期、当前组织；本次选择指标：${names}。数据快照来自业务人员修改并确认的合成演示数据。`,
  };
  result.evidence[2] = {
    ...result.evidence[2],
    summary: `已按本次选择数据计算各指标与目标的差异；计算结果可在关键指标和差异区复核。`,
  };
  result.reportOutline = result.reportOutline.map((section: any) => ({
    ...section,
    content: `${section.title}：基于本次选择的 ${names} 及已核验证据形成初稿。`,
  }));
  return result;
}

/** Kimi K3 is called only on the server. The deterministic tool result is the
 * evidence-bound input; the model must return a valid live response or the task fails. */
async function enrichWithKimi(result: ReturnType<typeof analysisResult>) {
  if (!hasLiveModel()) throw new Error("KIMI_MODEL_NOT_CONFIGURED");
  const baseUrl = process.env.MODEL_BASE_URL!.replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MODEL_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.MODEL_NAME || "kimi-k3",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            '你是经济运行分析的文字润色助手。不得增加任何数值、事实、原因或建议，只能将给定总体判断改写为专业、谨慎的中文；返回 JSON：{\\"overallJudgement\\":string}。',
        },
        {
          role: "user",
          content: JSON.stringify({ judgement: result.overallJudgement }),
        },
      ],
    }),
  });
  if (!response.ok) {
    const failurePayload = await response.json().catch(() => null);
    const failure = new Error(`KIMI_MODEL_HTTP_${response.status}`) as Error & {
      safeDetail?: string;
    };
    failure.safeDetail = String(
      (failurePayload as { error?: { message?: unknown } } | null)?.error
        ?.message || "Upstream request rejected",
    )
      .replace(/sk-[A-Za-z0-9_-]+/g, "[redacted]")
      .slice(0, 240);
    throw failure;
  }
  const payload = (await response.json()) as any;
  const content = JSON.parse(payload.choices?.[0]?.message?.content || "{}");
  // No digits prevents the model from adding unverified metric values to the evidence-bound result.
  if (
    typeof content.overallJudgement !== "string" ||
    content.overallJudgement.length <= 20 ||
    /\d/.test(content.overallJudgement)
  )
    throw new Error("KIMI_MODEL_INVALID_RESPONSE");
  result.overallJudgement = content.overallJudgement;
  return result;
}

app.get("/api/portal/summary", async () =>
  response({
    modules: [
      { key: "strategy", name: "战略规划", status: "1 项任务滞后", todos: 2 },
      {
        key: "performance",
        name: "目标绩效",
        status: "3 项指标偏离",
        todos: 3,
      },
      { key: "economy", name: "经济运行", status: "1 条库存预警", todos: 2 },
      { key: "innovation", name: "科技创新", status: "2 个延期风险", todos: 1 },
      {
        key: "benchmarking",
        name: "对追达创",
        status: "6 项追标任务",
        todos: 2,
      },
    ],
    warnings,
    reports,
    tasks: businessTasks,
  }),
);
app.get("/api/modules/:module/dashboard", async (req, reply) => {
  const key = (req.params as any).module;
  return moduleData[key]
    ? response(moduleData[key])
    : reply.code(404).send({
        error: {
          code: "MODULE_NOT_FOUND",
          message: "未找到模块",
          recoverable: true,
        },
      });
});
app.get("/api/economy/dashboard", async () =>
  response({
    metrics,
    warning,
    warnings,
    demoCases,
    orgRows,
    reportCount: reports.length,
    taskCount: businessTasks.length,
    trendLabels: ["03月", "04月", "05月", "06月", "07月"],
  }),
);
app.get("/api/indicators/:code", async (req, reply) => {
  const metric = metrics.find((m) => m.code === (req.params as any).code);
  if (!metric)
    return reply.code(404).send({
      error: {
        code: "INDICATOR_NOT_FOUND",
        message: "指标不可用",
        recoverable: true,
      },
    });
  return response({
    metric,
    warning: metric.code === warning.indicatorCode ? warning : null,
    organizationBreakdown:
      metric.code === "inventory_status_index"
        ? orgRows
        : orgRows.map((x, i) => ({
            ...x,
            value: Math.round(metric.value + (i - 1) * 2.1),
          })),
  });
});
app.get("/api/warnings/:id", async (req, reply) =>
  (req.params as any).id === warning.id
    ? response({
        event: warning,
        rule: {
          expression: "库存状态指数 > 110",
          description: "连续上行且超过演示阈值时触发预警",
        },
      })
    : reply.code(404).send({
        error: {
          code: "WARNING_NOT_FOUND",
          message: "未找到预警",
          recoverable: true,
        },
      }),
);
app.post("/api/analysis/tasks", async (req, reply) => {
  const body = z
    .object({ question: z.string().min(1), context: z.any() })
    .parse(req.body);
  const id = crypto.randomUUID();
  const scenario = body.context?.scenario_id || "overall";
  const base = applyDataOverrides(
    caseAnalysis(scenario),
    body.context?.data_overrides,
  );
  let result;
  try {
    result = await enrichWithKimi(base);
  } catch (error) {
    const modelError =
      error instanceof Error &&
      /^KIMI_MODEL_(HTTP_\d+|NOT_CONFIGURED|INVALID_RESPONSE)$/.test(
        error.message,
      )
        ? error.message
        : "KIMI_MODEL_RESPONSE_ERROR";
    const modelErrorDetail =
      error instanceof Error &&
      typeof (error as Error & { safeDetail?: unknown }).safeDetail === "string"
        ? (error as Error & { safeDetail: string }).safeDetail
        : undefined;
    return reply.code(503).send({
      error: {
        code: "KIMI_LIVE_MODEL_UNAVAILABLE",
        message:
          "Kimi K3 实时模型不可用，当前分析未执行。请检查服务端模型配置或网络后重试。",
        recoverable: true,
        model_error: modelError,
        model_error_detail: modelErrorDetail,
        suggested_action:
          "确认 MODEL_BASE_URL、MODEL_NAME 和 MODEL_API_KEY 已在服务端配置",
      },
      meta: { request_id: crypto.randomUUID() },
    });
  }
  const task: Task = {
    id,
    status: "draft",
    question: body.question,
    context: body.context,
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
  tasks.set(id, task);
  return reply.code(201).send(response(task));
});
app.get("/api/analysis/tasks/:id", async (req, reply) => {
  const task = tasks.get((req.params as any).id);
  return task
    ? response(task)
    : reply.code(404).send({
        error: {
          code: "TASK_NOT_FOUND",
          message: "分析任务不存在",
          recoverable: true,
        },
      });
});
app.get("/api/analysis/tasks/:id/events", async (req, reply) => {
  const task = tasks.get((req.params as any).id);
  if (!task) return reply.code(404).send();
  reply.raw.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  const send = (type: string, payload: any) =>
    reply.raw.write(`event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`);
  send("task.started", { taskId: task.id });
  let index = 0;
  const timer = setInterval(() => {
    if (index < task.steps.length) {
      task.steps[index].status = "completed";
      task.steps[index].summary = [
        "范围：当前周期 / 全省",
        "已获取五项核心指标",
        "已核对统一口径",
        "已识别库存和税利风险",
        "已匹配分析与处置模板",
        "已生成结构化分析初稿",
      ][index];
      send("step.completed", task.steps[index++]);
      return;
    }
    clearInterval(timer);
    send("analysis.draft", task.result);
    send("task.completed", { taskId: task.id });
    reply.raw.end();
  }, 260);
  req.raw.on("close", () => clearInterval(timer));
});
app.post("/api/analysis/tasks/:id/confirm", async (req, reply) => {
  const task = tasks.get((req.params as any).id);
  if (!task) return reply.code(404).send();
  const body = z
    .object({
      confirmation_note: z.string().min(1),
      confirmed_by: z.string().min(1),
      edited_result: z.any().optional(),
    })
    .parse(req.body);
  if (body.edited_result) task.result = body.edited_result;
  task.status = "confirmed";
  task.confirmedBy = body.confirmed_by;
  task.confirmedAt = now;
  return response(task);
});
app.post("/api/reports/drafts", async (req, reply) => {
  const body = z.object({ analysisTaskId: z.string() }).parse(req.body);
  const task = tasks.get(body.analysisTaskId);
  if (!task || task.status !== "confirmed")
    return reply.code(409).send({
      error: {
        code: "CONFIRMATION_REQUIRED",
        message: "请先完成人工确认后再保存通报",
        recoverable: true,
        suggested_action: "返回智能体工作台完成确认",
      },
    });
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
  return reply.code(201).send(response(report));
});
app.post("/api/tasks/drafts", async (req, reply) => {
  const body = z
    .object({
      analysisTaskId: z.string(),
      riskId: z.string().optional(),
      sourceType: z.string().optional(),
    })
    .parse(req.body);
  const task = tasks.get(body.analysisTaskId);
  if (!task || task.status !== "confirmed")
    return reply.code(409).send({
      error: {
        code: "CONFIRMATION_REQUIRED",
        message: "请先完成人工确认后再生成督办任务",
        recoverable: true,
      },
    });
  const risk =
    task.result.risks.find((x: any) => x.id === body.riskId) ||
    task.result.risks[0];
  const draft = {
    id: crypto.randomUUID(),
    title: `督办：${risk.title}`,
    status: "draft",
    source: body.sourceType || "analysis",
    responsibleDepartment: "营销运行演示部门",
    deadline: "2026-07-08",
    requirements: "核验问题范围，制定分类处置措施，并上传演示佐证材料。",
    risk,
  };
  businessTasks.unshift(draft);
  return reply.code(201).send(response(draft));
});
app.patch("/api/tasks/drafts/:id", async (req, reply) => {
  const index = businessTasks.findIndex(
    (task) => task.id === (req.params as any).id,
  );
  if (index < 0)
    return reply.code(404).send({
      error: {
        code: "TASK_NOT_FOUND",
        message: "督办任务草稿不存在",
        recoverable: true,
      },
    });
  const body = z
    .object({
      title: z.string().min(1),
      responsibleDepartment: z.string().min(1),
      deadline: z.string().min(1),
      requirements: z.string().min(1),
    })
    .parse(req.body);
  businessTasks[index] = {
    ...businessTasks[index],
    ...body,
    status: "saved",
    updatedAt: now,
  };
  return response(businessTasks[index]);
});
app.post("/api/simulation/tax-profit", async (req) => {
  const p = (req.body as any)?.parameters || {};
  const uplift =
    (p.structure_assumption === "optimized" ? 0.9 : 0) +
    (p.inventory_assumption === "controlled" ? 0.7 : 0) +
    (p.price_assumption === "stable" ? 0.4 : -0.2);
  return response({
    baseline: 94.6,
    projected: Number((94.6 + uplift).toFixed(1)),
    assumptions: p,
    contributions: [
      { name: "销售结构优化", value: 0.9 },
      { name: "库存受控", value: 0.7 },
      { name: "价格稳定", value: 0.4 },
    ],
    recommendation: "建议以库存受控与结构优化的组合措施优先改善税利完成路径。",
    boundary: "仅用于合成演示数据下的辅助决策，不代表真实预测。",
  });
});
app.get("/api/demo/health", async () =>
  response({
    api: "healthy",
    model: hasLiveModel() ? "Kimi K3 已配置" : "Kimi K3 未配置",
    modelRequired: true,
    scenarioId,
    dataVersion,
  }),
);
app.post("/api/demo/reset", async () => {
  tasks = new Map();
  reports = [];
  businessTasks = [];
  return response({ reset: true, message: "已恢复固定演示场景" });
});

const port = Number(process.env.PORT || 3001);
await app.listen({ port, host: "127.0.0.1" });
