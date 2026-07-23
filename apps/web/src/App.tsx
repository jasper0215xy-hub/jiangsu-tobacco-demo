import { useEffect, useRef, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  App as AntApp,
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Layout,
  Menu,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Steps,
  Table,
  Tag,
  Timeline,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  BarChartOutlined,
  BellOutlined,
  CheckCircleFilled,
  DashboardOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  FundOutlined,
  LineChartOutlined,
  LogoutOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  SwapOutlined,
  TrophyOutlined,
  WarningFilled,
} from "@ant-design/icons";
import * as echarts from "echarts";
import { create } from "zustand";

const { Header, Sider, Content } = Layout;
const api = async (path: string, init?: RequestInit) => {
  const r = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const json = await r.json();
  if (!r.ok) throw new Error(json.error?.message || "服务暂不可用");
  return json.data;
};
const mainQuestion =
  "请分析当前周期全省经济运行情况，重点关注销售进度、税利完成、销售结构、库存价格状态；说明主要变化、风险点、可能原因和管理建议，并形成月度分析通报框架。";
const agentScenarios = [
  {
    id: "overall",
    title: "月度总体运行分析",
    tag: "主营演示",
    question: mainQuestion,
  },
  {
    id: "tax",
    title: "税利进度差异研判",
    tag: "新增数据",
    question:
      "请基于当前演示数据分析税利目标完成进度的差异，识别重点关注组织和结构贡献线索，形成核验建议与跟踪任务草稿。",
  },
  {
    id: "structure",
    title: "销售结构与价格联动分析",
    tag: "新增数据",
    question:
      "请分析销售结构指数和价格状态的联动情况，区分已证实的数据事实与待核验原因，并形成针对中高价位段的管理建议。",
  },
];
const editableAnalysisData = [
  {
    indicatorCode: "sales_plan_progress",
    name: "销售计划进度",
    value: 96.8,
    targetValue: 96,
    unit: "%",
    selected: true,
  },
  {
    indicatorCode: "tax_profit_progress",
    name: "税利目标完成进度",
    value: 94.6,
    targetValue: 96,
    unit: "%",
    selected: true,
  },
  {
    indicatorCode: "sales_structure_index",
    name: "销售结构指数",
    value: 101.7,
    targetValue: 102.5,
    unit: "指数",
    selected: true,
  },
  {
    indicatorCode: "inventory_status_index",
    name: "库存状态指数",
    value: 114.2,
    targetValue: 105,
    unit: "指数",
    selected: true,
  },
  {
    indicatorCode: "price_status_index",
    name: "价格状态指数",
    value: 99.4,
    targetValue: 100,
    unit: "指数",
    selected: true,
  },
];
const useDemoStore = create<{
  period: string;
  organization: string;
  pendingIndicator?: string;
  setFilter: (
    x: Partial<{
      period: string;
      organization: string;
      pendingIndicator?: string;
    }>,
  ) => void;
}>((set) => ({
  period: "2026年7月",
  organization: "全省",
  setFilter: (x) => set(x),
}));

function statusColor(status: string) {
  return status === "normal"
    ? "success"
    : status === "attention"
      ? "warning"
      : "error";
}
function StatusTag({ status }: { status: string }) {
  const label: Record<string, string> = {
    normal: "正常",
    attention: "需关注",
    warning: "预警",
    critical: "严重",
    滞后: "滞后",
    偏离: "偏离",
    延期风险: "延期风险",
    落后: "落后",
  };
  return <Tag color={statusColor(status)}>{label[status] || status}</Tag>;
}
function DemoTags() {
  return (
    <Space size={4}>
      <Tag className="demo-tag">演示环境</Tag>
      <Tag>合成演示数据</Tag>
    </Space>
  );
}

function Chart({
  data,
  color = "#165DFF",
  type = "line",
}: {
  data: number[];
  color?: string;
  type?: "line" | "bar";
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    chart.setOption({
      animation: false,
      grid: { left: 32, right: 12, top: 18, bottom: 22 },
      xAxis: {
        type: "category",
        data: ["03月", "04月", "05月", "06月", "07月"],
        axisLine: { lineStyle: { color: "#D9E2F2" } },
        axisLabel: { color: "#6B778C" },
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { color: "#F0F3F8" } },
        axisLabel: { color: "#6B778C" },
      },
      series: [
        {
          data,
          type,
          smooth: true,
          barMaxWidth: 24,
          itemStyle: { color },
          lineStyle: { color, width: 3 },
          areaStyle: type === "line" ? { color: `${color}20` } : undefined,
        },
      ],
    });
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, [data, color, type]);
  return <div className="chart" ref={ref} aria-label="演示趋势图" />;
}

function AppShell({ children }: { children: React.ReactNode }) {
  const nav = useNavigate();
  const loc = useLocation();
  const { period, organization, setFilter } = useDemoStore();
  const items = [
    { key: "/portal", icon: <DashboardOutlined />, label: "全景总控台" },
    { key: "/strategy", icon: <FundOutlined />, label: "战略规划" },
    { key: "/performance", icon: <TrophyOutlined />, label: "目标绩效" },
    { key: "/economy", icon: <LineChartOutlined />, label: "经济运行" },
    { key: "/innovation", icon: <ExperimentOutlined />, label: "科技创新" },
    { key: "/benchmarking", icon: <SwapOutlined />, label: "对追达创" },
  ];
  return (
    <Layout className="app-shell">
      <Sider width={210} className="sidebar">
        <div className="brand">
          <span className="brand-mark">苏</span>
          <div>
            江苏烟草<small>企业综合管理平台</small>
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[
            items.find((x) => loc.pathname.startsWith(x.key))?.key || "",
          ]}
          items={items}
          onClick={({ key }) => nav(key)}
        />
        <div className="side-footer">
          <SafetyCertificateOutlined /> 合成数据 · 演示专用
        </div>
      </Sider>
      <Layout>
        <Header className="topbar">
          <div>
            <Typography.Text strong>
              {loc.pathname === "/portal" ? "全景总控台" : "企业综合管理"}
            </Typography.Text>
            <span className="crumb"> / 业务运营</span>
          </div>
          <Space size="middle">
            <Select
              size="small"
              value={period}
              onChange={(v) => setFilter({ period: v })}
              options={[{ value: "2026年7月" }, { value: "2026年6月" }]}
            />
            <Select
              size="small"
              value={organization}
              onChange={(v) => setFilter({ organization: v })}
              options={[
                { value: "全省" },
                { value: "示范地市甲" },
                { value: "示范地市乙" },
              ]}
            />
            <BellOutlined className="top-icon" />
            <DemoTags />
            <Badge status="processing" text="演示分析人员" />
          </Space>
        </Header>
        <Content className="content">{children}</Content>
      </Layout>
    </Layout>
  );
}

function Login() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  return (
    <div className="login">
      <div className="login-panel">
        <div className="login-emblem">苏</div>
        <Typography.Title level={1}>江苏烟草企业综合管理平台</Typography.Title>
        <Typography.Paragraph className="muted">
          全省企业综合管理信息系统 · 现场功能演示
        </Typography.Paragraph>
        <Alert type="info" showIcon message="演示环境 / 全程使用合成演示数据" />
        <Form
          layout="vertical"
          initialValues={{ account: "demo_analyst", password: "••••••" }}
          onFinish={() => {
            setLoading(true);
            setTimeout(() => nav("/portal"), 400);
          }}
        >
          <Form.Item label="演示账号" name="account">
            <Input />
          </Form.Item>
          <Form.Item label="密码" name="password">
            <Input.Password />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
          >
            进入演示
          </Button>
        </Form>
      </div>
    </div>
  );
}

function Portal() {
  const nav = useNavigate();
  const query = useQuery({
    queryKey: ["portal"],
    queryFn: () => api("/api/portal/summary"),
  });
  if (query.isLoading) return <Spin />;
  const data = query.data;
  const icon: Record<string, React.ReactNode> = {
    strategy: <FundOutlined />,
    performance: <TrophyOutlined />,
    economy: <LineChartOutlined />,
    innovation: <ExperimentOutlined />,
    benchmarking: <SwapOutlined />,
  };
  return (
    <AppShell>
      <div className="page-head">
        <div>
          <Typography.Title level={2}>全景总控台</Typography.Title>
          <Typography.Text type="secondary">
            以指标为标准底座，以预警发现问题，以督办推动落地，以智能分析提升研判效率
          </Typography.Text>
        </div>
        <DemoTags />
      </div>
      <Row gutter={[16, 16]}>
        {data.modules.map((m: any) => (
          <Col span={24} lg={8} xl={4} key={m.key}>
            <Card
              hoverable
              className="module-card"
              onClick={() => nav(`/${m.key}`)}
            >
              <div className="module-icon">{icon[m.key]}</div>
              <Typography.Title level={4}>{m.name}</Typography.Title>
              <Typography.Text type="secondary">{m.status}</Typography.Text>
              <Divider />
              <Space>
                <Badge status="warning" text={`${m.todos} 项待办`} />
                <Button type="link" size="small">
                  进入模块 →
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={16} className="section-gap">
        <Col span={24} lg={15}>
          <Card title="全局运行态势" extra={<Tag>数据版本 2026-demo-v1</Tag>}>
            <Row gutter={12}>
              <Col span={8}>
                <Statistic title="战略目标推进" value={77.8} suffix="%" />
              </Col>
              <Col span={8}>
                <Statistic
                  title="指标正常率"
                  value={80.4}
                  suffix="%"
                  valueStyle={{ color: "#00B42A" }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="统一预警"
                  value={1}
                  suffix="条"
                  valueStyle={{ color: "#F53F3F" }}
                />
              </Col>
            </Row>
            <Chart data={[62, 67, 70, 74, 78]} />
          </Card>
        </Col>
        <Col span={24} lg={9}>
          <Card title="重点预警与近期动态">
            <Alert
              type="warning"
              showIcon
              message={data.warnings[0].title}
              description="库存异常已进入智能研判流程"
              action={
                <Button size="small" onClick={() => nav("/economy")}>
                  查看
                </Button>
              }
            />
            <Divider />
            <Timeline
              items={[
                { children: "经济运行月度通报待生成" },
                { children: "示范地市乙库存预警待处置" },
                { children: "战略目标跟踪提醒待确认" },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </AppShell>
  );
}

function GenericModule({ module }: { module: string }) {
  const nav = useNavigate();
  const [drawer, setDrawer] = useState(false);
  const [task, setTask] = useState(false);
  const query = useQuery({
    queryKey: ["module", module],
    queryFn: () => api(`/api/modules/${module}/dashboard`),
  });
  if (query.isLoading)
    return (
      <AppShell>
        <Spin />
      </AppShell>
    );
  const data = query.data;
  return (
    <AppShell>
      <div className="page-head">
        <div>
          <Typography.Title level={2}>{data.title}</Typography.Title>
          <Typography.Text type="secondary">{data.subtitle}</Typography.Text>
        </div>
        <DemoTags />
      </div>
      <Row gutter={[16, 16]}>
        {data.stats.map(([label, value]: [string, string], i: number) => (
          <Col xs={12} lg={6} key={label}>
            <Card className="stat-card">
              <Statistic
                title={label}
                value={value}
                valueStyle={{ color: i === 3 ? "#F53F3F" : "#1D2B53" }}
              />
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={16} className="section-gap">
        <Col span={24} lg={15}>
          <Card title={`${data.title}执行看板`} extra={<Tag>当前周期</Tag>}>
            <Chart
              data={[48, 56, 61, 68, 72]}
              color={module === "innovation" ? "#00B42A" : "#165DFF"}
            />
            <Table
              pagination={false}
              rowKey={(x) => x}
              dataSource={data.list.map((x: string, i: number) => ({
                key: i,
                item: x,
                progress: `${68 + i * 7}%`,
                status: i === 1 ? data.item.status : "正常",
              }))}
              columns={[
                { title: "业务对象", dataIndex: "item" },
                { title: "当前进度", dataIndex: "progress" },
                {
                  title: "状态",
                  dataIndex: "status",
                  render: (x) => <StatusTag status={x} />,
                },
                {
                  title: "操作",
                  render: () => (
                    <Button type="link" onClick={() => setDrawer(true)}>
                      查看详情
                    </Button>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
        <Col span={24} lg={9}>
          <Card title="需关注事项">
            <Alert
              type="warning"
              showIcon
              message={data.item.title}
              description={data.item.detail}
              action={
                <Button size="small" onClick={() => setDrawer(true)}>
                  查看
                </Button>
              }
            />
            <Divider />
            <Typography.Text type="secondary">业务闭环</Typography.Text>
            <div className="flow">
              指标监测 → 偏差预警 → 责任跟进 → 结果反馈
            </div>
          </Card>
        </Col>
      </Row>
      <Drawer
        title={`${data.title}详情`}
        open={drawer}
        onClose={() => setDrawer(false)}
        width={580}
        extra={<StatusTag status={data.item.status} />}
      >
        <Descriptions
          column={1}
          bordered
          items={[
            { key: "1", label: "事项", children: data.item.title },
            { key: "2", label: "业务说明", children: data.item.detail },
            { key: "3", label: "责任部门", children: "综合管理演示部门" },
            {
              key: "4",
              label: "数据范围",
              children: "演示环境 / 合成演示数据",
            },
          ]}
        />
        <Divider />
        <Button
          type="primary"
          onClick={() => {
            setDrawer(false);
            setTask(true);
          }}
        >
          {data.item.action}
        </Button>
      </Drawer>
      <Drawer
        title="业务动作草稿"
        open={task}
        onClose={() => setTask(false)}
        width={620}
      >
        <Alert
          type="success"
          showIcon
          message="已自动带入业务来源、责任部门与处置要求"
        />
        <Form
          layout="vertical"
          className="drawer-form"
          initialValues={{
            title: data.item.action,
            owner: "综合管理演示部门",
            deadline: "2026-07-08",
            requirements: `请围绕“${data.item.title}”核验现状并反馈处置结果。`,
          }}
        >
          <Form.Item label="事项名称" name="title">
            <Input />
          </Form.Item>
          <Form.Item label="责任部门" name="owner">
            <Input />
          </Form.Item>
          <Form.Item label="完成时限" name="deadline">
            <Input />
          </Form.Item>
          <Form.Item label="处置要求" name="requirements">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Button
            type="primary"
            onClick={() => {
              setTask(false);
              message.success("草稿已保存，可在待办中继续跟进");
            }}
          >
            保存草稿
          </Button>
        </Form>
      </Drawer>
    </AppShell>
  );
}

function Economy() {
  const nav = useNavigate();
  const { period, organization, setFilter } = useDemoStore();
  const [metric, setMetric] = useState<any>();
  const [warningOpen, setWarningOpen] = useState(false);
  const dataQuery = useQuery({
    queryKey: ["economy", period, organization],
    queryFn: () => api("/api/economy/dashboard"),
  });
  const detailQuery = useQuery({
    queryKey: ["indicator", metric?.code],
    queryFn: () => api(`/api/indicators/${metric.code}`),
    enabled: Boolean(metric),
  });
  if (dataQuery.isLoading)
    return (
      <AppShell>
        <Spin />
      </AppShell>
    );
  const data = dataQuery.data;
  const goAgent = () => {
    setFilter({ pendingIndicator: metric?.code || "inventory_status_index" });
    nav("/economy/agent");
  };
  return (
    <AppShell>
      <div className="page-head">
        <div>
          <Typography.Title level={2}>经济运行综合看板</Typography.Title>
          <Typography.Text type="secondary">
            监测 — 预警 — 研判 — 调控 — 评估 — 改进
          </Typography.Text>
        </div>
        <Space>
          <Button icon={<RobotOutlined />} type="primary" onClick={goAgent}>
            AI 运行分析
          </Button>
          <DemoTags />
        </Space>
      </div>
      <Card className="filter-card">
        <Space wrap>
          <span>分析周期</span>
          <Select
            value={period}
            onChange={(v) => setFilter({ period: v })}
            options={[{ value: "2026年7月" }, { value: "2026年6月" }]}
          />
          <span>组织范围</span>
          <Select
            value={organization}
            onChange={(v) => setFilter({ organization: v })}
            options={[
              { value: "全省" },
              { value: "示范地市甲" },
              { value: "示范地市乙" },
            ]}
          />
          <Button
            onClick={() =>
              setFilter({
                period: "2026年7月",
                organization: "全省",
                pendingIndicator: undefined,
              })
            }
          >
            重置
          </Button>
        </Space>
      </Card>
      <Row gutter={[16, 16]} className="section-gap">
        {data.metrics.map((m: any) => (
          <Col xs={24} sm={12} xl={5} key={m.code}>
            <Card
              className={`metric-card ${m.status}`}
              hoverable
              onClick={() => setMetric(m)}
            >
              <div className="metric-title">
                {m.name}
                <StatusTag status={m.status} />
              </div>
              <div className="metric-number">
                {m.value}
                <small>{m.unit}</small>
              </div>
              <div className="metric-footer">
                目标 {m.target}
                {m.unit} · 更新于 2026-07-01
              </div>
              {m.status === "warning" && (
                <Button
                  type="link"
                  icon={<RobotOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMetric(m);
                    goAgent();
                  }}
                >
                  智能研判
                </Button>
              )}
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={16} className="section-gap">
        <Col span={24} lg={12}>
          <Card title="运行趋势" extra={<Tag>全省 / 当前周期</Tag>}>
            <Chart data={data.metrics[3].trend} color="#165DFF" />
          </Card>
        </Col>
        <Col span={24} lg={12}>
          <Card title="库存状态组织穿透">
            <Chart
              data={data.orgRows.map((x: any) => x.value)}
              color="#F53F3F"
              type="bar"
            />
            <div className="chart-caption">
              示范地市乙为主要影响组织，应进入异常研判。
            </div>
          </Card>
        </Col>
      </Row>
      <Row gutter={16} className="section-gap">
        <Col span={24} lg={15}>
          <Card title="异常预警">
            <Table
              pagination={false}
              rowKey="id"
              dataSource={data.warnings}
              columns={[
                { title: "预警事项", dataIndex: "title" },
                {
                  title: "等级",
                  dataIndex: "level",
                  render: (x) => <StatusTag status={x} />,
                },
                { title: "责任部门", dataIndex: "ownerDepartment" },
                { title: "处置状态", dataIndex: "status" },
                {
                  title: "操作",
                  render: () => (
                    <Space>
                      <Button type="link" onClick={() => setWarningOpen(true)}>
                        查看预警
                      </Button>
                      <Button type="link" onClick={goAgent}>
                        智能研判
                      </Button>
                    </Space>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
        <Col span={24} lg={9}>
          <Card title="分析通报">
            <Statistic
              title="本期已保存草稿"
              value={data.reportCount}
              suffix="份"
            />
            <Divider />
            <Typography.Paragraph type="secondary">
              AI
              生成内容需完成业务人员确认后，才可保存为通报草稿或生成督办任务。
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>
      <Drawer
        title="经济运行指标详情"
        open={Boolean(metric)}
        onClose={() => setMetric(undefined)}
        width={620}
        extra={metric && <StatusTag status={metric.status} />}
      >
        {detailQuery.isLoading ? (
          <Spin />
        ) : (
          detailQuery.data && (
            <>
              <Descriptions
                column={1}
                bordered
                size="small"
                items={[
                  {
                    key: "n",
                    label: "指标",
                    children: detailQuery.data.metric.name,
                  },
                  {
                    key: "v",
                    label: "当前值 / 目标",
                    children: `${detailQuery.data.metric.value}${detailQuery.data.metric.unit} / ${detailQuery.data.metric.target}${detailQuery.data.metric.unit}`,
                  },
                  {
                    key: "d",
                    label: "指标口径",
                    children: detailQuery.data.metric.definition,
                  },
                  { key: "s", label: "数据来源", children: "合成演示数据集" },
                ]}
              />
              <Divider />
              <Typography.Text strong>趋势与组织构成</Typography.Text>
              <Chart
                data={detailQuery.data.metric.trend}
                color={metric.status === "warning" ? "#F53F3F" : "#165DFF"}
              />
              <Table
                size="small"
                pagination={false}
                rowKey="name"
                dataSource={detailQuery.data.organizationBreakdown}
                columns={[
                  { title: "组织", dataIndex: "name" },
                  { title: "指数", dataIndex: "value" },
                  {
                    title: "状态",
                    dataIndex: "status",
                    render: (x) => <StatusTag status={x} />,
                  },
                ]}
              />
              <Divider />
              <Space>
                <Button
                  type="primary"
                  icon={<RobotOutlined />}
                  onClick={goAgent}
                >
                  智能研判
                </Button>
                {detailQuery.data.warning && (
                  <Button
                    onClick={() => {
                      setMetric(undefined);
                      setWarningOpen(true);
                    }}
                  >
                    查看关联预警
                  </Button>
                )}
              </Space>
            </>
          )
        )}
      </Drawer>
      <Drawer
        title="预警详情"
        open={warningOpen}
        onClose={() => setWarningOpen(false)}
        width={560}
      >
        <Alert
          type="warning"
          showIcon
          message={data.warning.title}
          description={data.warning.description}
        />
        <Descriptions
          className="drawer-form"
          column={1}
          items={[
            { key: "r", label: "预警规则", children: "库存状态指数 > 110" },
            {
              key: "o",
              label: "责任主体",
              children: data.warning.ownerDepartment,
            },
            { key: "d", label: "响应时限", children: data.warning.deadline },
            { key: "s", label: "当前状态", children: "研判中" },
          ]}
        />
        <Button type="primary" icon={<RobotOutlined />} onClick={goAgent}>
          基于该预警智能研判
        </Button>
      </Drawer>
    </AppShell>
  );
}

function EvidenceDrawer({
  result,
  open,
  close,
}: {
  result: any;
  open: boolean;
  close: () => void;
}) {
  return (
    <Drawer title="证据与口径核验" open={open} onClose={close} width={680}>
      <Alert
        type="info"
        showIcon
        message="所有数据事实均绑定证据；可能原因以“分析假设”单独标识。"
      />
      <Divider />
      {result?.evidence?.map((e: any) => (
        <Card
          size="small"
          className="evidence-card"
          key={e.id}
          title={
            <Space>
              <Tag color="blue">{e.id}</Tag>
              {e.title}
            </Space>
          }
          extra={<Tag>{e.type}</Tag>}
        >
          <Typography.Paragraph>{e.summary}</Typography.Paragraph>
          <Typography.Text type="secondary">
            来源：{e.source} · 更新：{e.updatedAt}
          </Typography.Text>
        </Card>
      ))}
    </Drawer>
  );
}

function Agent() {
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const { period, organization, pendingIndicator, setFilter } = useDemoStore();
  const [task, setTask] = useState<any>();
  const [taskDraft, setTaskDraft] = useState<any>();
  const [taskDrawer, setTaskDrawer] = useState(false);
  const [running, setRunning] = useState(false);
  const [evidence, setEvidence] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [edit, setEdit] = useState("");
  const [scenarioId, setScenarioId] = useState("overall");
  const [dataRows, setDataRows] = useState(() =>
    editableAnalysisData.map((row) => ({ ...row })),
  );
  const scenario = agentScenarios.find((x) => x.id === scenarioId)!;
  const selectedData = dataRows.filter((row) => row.selected);
  const updateData = (
    indicatorCode: string,
    field: "selected" | "value" | "targetValue",
    value: boolean | number,
  ) =>
    setDataRows((rows) =>
      rows.map((row) =>
        row.indicatorCode === indicatorCode ? { ...row, [field]: value } : row,
      ),
    );
  const context = {
    period,
    organization_id: organization === "全省" ? "org-province" : "org-city-b",
    indicator_codes: selectedData.map((row) => row.indicatorCode),
    warning_ids: ["warning-inventory-v1"],
    comparison_mode: "target",
    output_purpose: "report",
  };
  const start = async () => {
    if (!selectedData.length) {
      message.warning("请至少勾选一项分析数据");
      return;
    }
    setRunning(true);
    try {
      const created = await api("/api/analysis/tasks", {
        method: "POST",
        body: JSON.stringify({
          question: scenario.question,
          context: {
            ...context,
            scenario_id: scenario.id,
            data_overrides: selectedData.map(
              ({ indicatorCode, value, targetValue }) => ({
                indicatorCode,
                value,
                targetValue,
              }),
            ),
          },
        }),
      });
      setTask(created);
      const events = new EventSource(
        `/api/analysis/tasks/${created.id}/events`,
      );
      events.addEventListener("step.completed", (event) => {
        const step = JSON.parse((event as MessageEvent).data);
        setTask((old: any) => ({
          ...old,
          steps: old.steps.map((x: any) => (x.id === step.id ? step : x)),
        }));
      });
      events.addEventListener("task.completed", () => {
        events.close();
        setRunning(false);
      });
    } catch (e: any) {
      message.error(e.message);
      setRunning(false);
    }
  };
  const confirm = async () => {
    try {
      const updated = await api(`/api/analysis/tasks/${task.id}/confirm`, {
        method: "POST",
        body: JSON.stringify({
          confirmation_note: "已核对演示指标、证据及分析假设",
          confirmed_by: "演示分析人员",
          edited_result: {
            ...task.result,
            overallJudgement: edit || task.result.overallJudgement,
          },
        }),
      });
      setTask(updated);
      setConfirmOpen(false);
      message.success("已由业务人员确认，可生成通报和督办任务");
    } catch (e: any) {
      message.error(e.message);
    }
  };
  const makeReport = async () => {
    try {
      const r = await api("/api/reports/drafts", {
        method: "POST",
        body: JSON.stringify({ analysisTaskId: task.id }),
      });
      queryClient.invalidateQueries({ queryKey: ["portal"] });
      message.success(`已保存：${r.title}`);
    } catch (e: any) {
      message.warning(e.message);
    }
  };
  const makeTask = async () => {
    try {
      const r = await api("/api/tasks/drafts", {
        method: "POST",
        body: JSON.stringify({
          analysisTaskId: task.id,
          riskId: task.result.risks[0]?.id,
        }),
      });
      queryClient.invalidateQueries({ queryKey: ["portal"] });
      setTaskDraft(r);
      setTaskDrawer(true);
    } catch (e: any) {
      message.warning(e.message);
    }
  };
  const saveTaskDraft = async (values: any) => {
    try {
      const saved = await api(`/api/tasks/drafts/${taskDraft.id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      });
      setTaskDraft(saved);
      setTaskDrawer(false);
      queryClient.invalidateQueries({ queryKey: ["portal"] });
      message.success("督办任务草稿已保存，可进入待办闭环跟进");
    } catch (e: any) {
      message.error(e.message);
    }
  };
  return (
    <AppShell>
      <div className="agent-page">
        <div className="agent-header">
          <Space>
            <Button onClick={() => nav("/economy")}>← 返回经济运行</Button>
            <Typography.Title level={3}>经济运行分析智能体</Typography.Title>
          </Space>
          <DemoTags />
        </div>
        <Alert
          type="info"
          showIcon
          message="智能体继承当前业务页面的周期、组织、指标和预警；先调用受控工具，再生成可核验的 AI 草稿。"
        />
        <Row gutter={16} className="section-gap">
          <Col span={24} lg={7}>
            <Card title="现场业务场景库">
              <Typography.Text strong>{scenario.title}</Typography.Text>
              <Tag color={scenarioId === "overall" ? "blue" : "purple"}>
                {scenario.tag}
              </Tag>
              <Typography.Paragraph className="question">
                {scenario.question}
              </Typography.Paragraph>
              <Space direction="vertical" className="scenario-list">
                {agentScenarios.map((item) => (
                  <Button
                    key={item.id}
                    size="small"
                    type={scenarioId === item.id ? "primary" : "default"}
                    onClick={() => {
                      setScenarioId(item.id);
                      setTask(undefined);
                    }}
                  >
                    {item.title} · {item.tag}
                  </Button>
                ))}
              </Space>
              <Divider />
              <div className="data-editor-head">
                <Typography.Text strong>本次分析数据（可修改）</Typography.Text>
                <Button
                  size="small"
                  type="link"
                  onClick={() =>
                    setDataRows(editableAnalysisData.map((row) => ({ ...row })))
                  }
                >
                  恢复默认
                </Button>
              </div>
              <Typography.Paragraph className="tiny data-editor-tip">
                勾选要纳入本次分析的指标；每行后两列依次为“当前值 /
                目标值”，均可修改。AI 仅使用本次提交的合成数据快照。
              </Typography.Paragraph>
              <div className="data-editor">
                {dataRows.map((row) => (
                  <div className="data-row" key={row.indicatorCode}>
                    <Checkbox
                      checked={row.selected}
                      onChange={(event) =>
                        updateData(
                          row.indicatorCode,
                          "selected",
                          event.target.checked,
                        )
                      }
                    />
                    <span className="data-row-name">{row.name}</span>
                    <InputNumber
                      size="small"
                      value={row.value}
                      controls={false}
                      disabled={!row.selected}
                      onChange={(value) =>
                        updateData(
                          row.indicatorCode,
                          "value",
                          Number(value ?? 0),
                        )
                      }
                    />
                    <InputNumber
                      size="small"
                      value={row.targetValue}
                      controls={false}
                      disabled={!row.selected}
                      onChange={(value) =>
                        updateData(
                          row.indicatorCode,
                          "targetValue",
                          Number(value ?? 0),
                        )
                      }
                    />
                    <span className="data-row-unit">{row.unit}</span>
                  </div>
                ))}
              </div>
              <Space wrap>
                <Tag>周期：{period}</Tag>
                <Tag>组织：{organization}</Tag>
                {pendingIndicator && <Tag color="warning">异常指标已带入</Tag>}
              </Space>
              <Divider />
              <Button
                type="primary"
                block
                icon={<RobotOutlined />}
                loading={running}
                onClick={start}
              >
                {task ? "重新分析" : "启动预置分析"}
              </Button>
              <Divider />
              <Typography.Text type="secondary">
                执行过程（业务化展示）
              </Typography.Text>
              <Steps
                direction="vertical"
                size="small"
                current={
                  task
                    ? task.steps.filter((x: any) => x.status === "completed")
                        .length
                    : 0
                }
                items={(
                  task?.steps ||
                  [
                    "正在确认分析范围",
                    "正在查询指标数据",
                    "正在核对指标口径",
                    "正在分析差异和风险",
                    "正在检索业务知识",
                    "正在生成分析草稿",
                  ].map((label: string, i: number) => ({
                    id: i,
                    label,
                    status: "pending",
                  }))
                ).map((x: any) => ({
                  title: x.label,
                  description: x.summary,
                  status:
                    x.status === "completed"
                      ? "finish"
                      : x.status === "running"
                        ? "process"
                        : "wait",
                }))}
              />
            </Card>
          </Col>
          <Col span={24} lg={17}>
            {!task ? (
              <Card className="empty-agent">
                <RobotOutlined />
                <Typography.Title level={4}>准备开始分析</Typography.Title>
                <Typography.Paragraph>
                  点击左侧预置问题，系统将依次查询指标、核对口径、分析风险并检索业务知识。
                </Typography.Paragraph>
              </Card>
            ) : (
              <Card
                className="analysis-result"
                title={
                  <Space>
                    <RobotOutlined />
                    <span>分析结果</span>
                    <Tag
                      color={task.status === "confirmed" ? "success" : "gold"}
                    >
                      {task.status === "confirmed"
                        ? "已由业务人员确认"
                        : "AI 草稿，未经人工确认"}
                    </Tag>
                  </Space>
                }
                extra={
                  <Button onClick={() => setEvidence(true)}>查看证据</Button>
                }
              >
                <Typography.Title level={4}>总体判断</Typography.Title>
                <Typography.Paragraph className="judgement">
                  {task.result.overallJudgement}
                </Typography.Paragraph>
                <Typography.Title level={5}>关键指标</Typography.Title>
                <Row gutter={[10, 10]}>
                  {task.result.keyMetrics.map((m: any) => (
                    <Col span={12} xl={8} key={m.indicatorCode}>
                      <Card size="small">
                        <div className="metric-title">
                          {m.displayName}
                          <StatusTag status={m.status} />
                        </div>
                        <b>
                          {m.currentValue}
                          {m.unit}
                        </b>
                        <div className="tiny">
                          {m.summary} <Tag color="blue">[E1]</Tag>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
                <Row gutter={16} className="section-gap">
                  <Col span={12}>
                    <Typography.Title level={5}>差异与风险</Typography.Title>
                    {task.result.risks.map((r: any) => (
                      <Alert
                        key={r.id}
                        className="risk"
                        type={r.level === "warning" ? "error" : "warning"}
                        showIcon
                        message={
                          <>
                            {r.title}{" "}
                            <Tag color="blue">
                              [E{r.id === "R1" ? "4" : "3"}]
                            </Tag>
                          </>
                        }
                        description={r.description}
                      />
                    ))}
                  </Col>
                  <Col span={12}>
                    <Typography.Title level={5}>
                      分析假设（待核验）
                    </Typography.Title>
                    {task.result.hypotheses.map((h: any) => (
                      <Alert
                        key={h.id}
                        type="info"
                        showIcon
                        message={h.content}
                        description={`核验建议：${h.verificationSuggestion}`}
                      />
                    ))}
                  </Col>
                </Row>
                <Typography.Title level={5}>管理建议</Typography.Title>
                {task.result.recommendations.map((r: any) => (
                  <Card
                    size="small"
                    className="recommendation"
                    key={r.id}
                    title={r.title}
                  >
                    <Typography.Paragraph>{r.description}</Typography.Paragraph>
                    <Tag>关联风险 {r.relatedRiskIds.join("、")}</Tag>
                  </Card>
                ))}
                <Typography.Title level={5}>月度分析通报框架</Typography.Title>
                <Table
                  pagination={false}
                  size="small"
                  rowKey="title"
                  dataSource={task.result.reportOutline}
                  columns={[
                    { title: "章节", dataIndex: "title", width: 160 },
                    { title: "初稿内容", dataIndex: "content" },
                  ]}
                />
                <Divider />
                <Space wrap>
                  <Button onClick={() => setEvidence(true)}>查看证据</Button>
                  <Button
                    onClick={() => {
                      setEdit(task.result.overallJudgement);
                      setConfirmOpen(true);
                    }}
                  >
                    编辑并确认
                  </Button>
                  <Button
                    type="primary"
                    disabled={task.status !== "confirmed"}
                    onClick={makeReport}
                  >
                    保存为通报草稿
                  </Button>
                  <Button
                    type="primary"
                    ghost
                    disabled={task.status !== "confirmed"}
                    onClick={makeTask}
                  >
                    生成督办任务
                  </Button>
                </Space>
              </Card>
            )}
          </Col>
        </Row>
        <EvidenceDrawer
          result={task?.result}
          open={evidence}
          close={() => setEvidence(false)}
        />
        <Drawer
          title="督办任务草稿"
          open={taskDrawer}
          onClose={() => setTaskDrawer(false)}
          width={620}
        >
          {taskDraft && (
            <>
              <Alert
                type="warning"
                showIcon
                message="任务已从经人工确认的分析风险自动生成"
                description={`来源风险：${taskDraft.risk?.title || "已确认分析风险"}`}
              />
              <Descriptions
                className="drawer-form"
                size="small"
                column={1}
                bordered
                items={[
                  {
                    key: "source",
                    label: "任务来源",
                    children: "经济运行分析智能体 / 已确认结果",
                  },
                  {
                    key: "indicator",
                    label: "关联风险",
                    children: taskDraft.risk?.description,
                  },
                  {
                    key: "evidence",
                    label: "数据依据",
                    children: "本次选择并确认的合成演示数据快照",
                  },
                ]}
              />
              <Form
                key={taskDraft.id}
                layout="vertical"
                className="drawer-form"
                initialValues={{
                  title: taskDraft.title,
                  responsibleDepartment: taskDraft.responsibleDepartment,
                  deadline: taskDraft.deadline,
                  requirements: taskDraft.requirements,
                }}
                onFinish={saveTaskDraft}
              >
                <Form.Item
                  label="任务名称"
                  name="title"
                  rules={[{ required: true, message: "请填写任务名称" }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="责任部门"
                  name="responsibleDepartment"
                  rules={[{ required: true, message: "请填写责任部门" }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="完成时限"
                  name="deadline"
                  rules={[{ required: true, message: "请填写完成时限" }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="处置要求"
                  name="requirements"
                  rules={[{ required: true, message: "请填写处置要求" }]}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
                <Form.Item label="佐证材料要求">
                  <Input
                    value="明细核验说明、分类处置清单、完成佐证材料"
                    readOnly
                  />
                </Form.Item>
                <Button type="primary" htmlType="submit">
                  保存督办任务草稿
                </Button>
              </Form>
            </>
          )}
        </Drawer>
        <Modal
          title="编辑并完成人工确认"
          open={confirmOpen}
          onCancel={() => setConfirmOpen(false)}
          onOk={confirm}
          okText="确认分析结果"
        >
          <Alert
            type="warning"
            showIcon
            message="确认后，AI 草稿将记录为业务人员确认版本，并可用于生成通报和督办任务。"
          />
          <Form layout="vertical" className="drawer-form">
            <Form.Item label="总体判断（可编辑）">
              <Input.TextArea
                value={edit}
                onChange={(e) => setEdit(e.target.value)}
                rows={5}
              />
            </Form.Item>
            <Form.Item label="确认说明">
              <Input value="已核对演示指标、证据及分析假设" readOnly />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AppShell>
  );
}

function Simulation() {
  const [parameters, setParameters] = useState({
    sales_progress_assumption: "baseline",
    structure_assumption: "optimized",
    inventory_assumption: "controlled",
    price_assumption: "stable",
    external_environment: "baseline",
  });
  const [result, setResult] = useState<any>();
  const run = async () => {
    try {
      setResult(
        await api("/api/simulation/tax-profit", {
          method: "POST",
          body: JSON.stringify({ parameters }),
        }),
      );
    } catch (e: any) {
      message.error(e.message);
    }
  };
  return (
    <AppShell>
      <div className="page-head">
        <div>
          <Typography.Title level={2}>税利目标决策模拟器</Typography.Title>
          <Typography.Text type="secondary">
            答辩备用能力：受控情景参数、影响路径和组合建议
          </Typography.Text>
        </div>
        <DemoTags />
      </div>
      <Alert
        type="info"
        showIcon
        message="仅用于合成演示数据下的辅助决策，不代表真实预测或替代人工决策。"
      />
      <Row gutter={16} className="section-gap">
        <Col span={24} lg={8}>
          <Card title="预置情景与策略变量">
            <Form layout="vertical">
              <Form.Item label="销售计划进度">
                <Select
                  value={parameters.sales_progress_assumption}
                  onChange={(v) =>
                    setParameters({
                      ...parameters,
                      sales_progress_assumption: v,
                    })
                  }
                  options={[
                    { value: "lower", label: "承压" },
                    { value: "baseline", label: "基准" },
                    { value: "higher", label: "提升" },
                  ]}
                />
              </Form.Item>
              <Form.Item label="销售结构">
                <Select
                  value={parameters.structure_assumption}
                  onChange={(v) =>
                    setParameters({ ...parameters, structure_assumption: v })
                  }
                  options={[
                    { value: "current", label: "当前结构" },
                    { value: "optimized", label: "优化结构" },
                  ]}
                />
              </Form.Item>
              <Form.Item label="库存状态">
                <Select
                  value={parameters.inventory_assumption}
                  onChange={(v) =>
                    setParameters({ ...parameters, inventory_assumption: v })
                  }
                  options={[
                    { value: "pressure", label: "库存压力" },
                    { value: "controlled", label: "库存受控" },
                  ]}
                />
              </Form.Item>
              <Form.Item label="市场价格">
                <Select
                  value={parameters.price_assumption}
                  onChange={(v) =>
                    setParameters({ ...parameters, price_assumption: v })
                  }
                  options={[
                    { value: "fluctuating", label: "价格波动" },
                    { value: "stable", label: "价格稳定" },
                  ]}
                />
              </Form.Item>
              <Button type="primary" block onClick={run}>
                开始模拟
              </Button>
            </Form>
          </Card>
        </Col>
        <Col span={24} lg={16}>
          {!result ? (
            <Card className="empty-agent">
              <ExperimentOutlined />
              <Typography.Title level={4}>
                选择预置情景后开始模拟
              </Typography.Title>
              <Typography.Paragraph>
                系统将展示目标影响、变量贡献和适用边界。
              </Typography.Paragraph>
            </Card>
          ) : (
            <Card title="情景结果">
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="当前基准"
                    value={result.baseline}
                    suffix="%"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="情景预估"
                    value={result.projected}
                    suffix="%"
                    valueStyle={{ color: "#165DFF" }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="改善幅度"
                    value={(result.projected - result.baseline).toFixed(1)}
                    prefix="+"
                    suffix="个百分点"
                    valueStyle={{ color: "#00B42A" }}
                  />
                </Col>
              </Row>
              <Divider />
              <Chart
                data={result.contributions.map((x: any) => x.value)}
                color="#722ED1"
                type="bar"
              />
              <Table
                size="small"
                pagination={false}
                rowKey="name"
                dataSource={result.contributions}
                columns={[
                  { title: "关键变量", dataIndex: "name" },
                  { title: "贡献（百分点）", dataIndex: "value" },
                ]}
              />
              <Alert
                className="section-gap"
                type="success"
                showIcon
                message="组合建议"
                description={result.recommendation}
              />
              <Typography.Paragraph type="secondary">
                适用边界：{result.boundary}
              </Typography.Paragraph>
            </Card>
          )}
        </Col>
      </Row>
    </AppShell>
  );
}

function DemoControl() {
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const health = useQuery({
    queryKey: ["health"],
    queryFn: () => api("/api/demo/health"),
  });
  const reset = async () => {
    await api("/api/demo/reset", { method: "POST" });
    queryClient.invalidateQueries();
    message.success("已恢复固定演示场景");
    nav("/portal");
  };
  return (
    <AppShell>
      <div className="page-head">
        <div>
          <Typography.Title level={2}>演示控制台</Typography.Title>
          <Typography.Text type="secondary">
            现场演示保障：Kimi K3 实时模型状态检查与一键恢复
          </Typography.Text>
        </div>
        <DemoTags />
      </div>
      {health.isLoading ? (
        <Spin />
      ) : (
        <>
          <Row gutter={16}>
            <Col span={24} lg={14}>
              <Card title="服务与场景状态">
                <Descriptions
                  bordered
                  column={2}
                  items={[
                    {
                      key: "api",
                      label: "业务服务",
                      children: <Badge status="success" text="正常" />,
                    },
                    {
                      key: "model",
                      label: "智能模型",
                      children: health.data.model,
                    },
                    {
                      key: "modelRequired",
                      label: "调用策略",
                      children: <Tag color="blue">仅 Kimi K3 实时调用</Tag>,
                    },
                    {
                      key: "scenario",
                      label: "场景版本",
                      children: health.data.scenarioId,
                    },
                    {
                      key: "data",
                      label: "数据版本",
                      children: health.data.dataVersion,
                    },
                  ]}
                />
                <Divider />
                <Alert
                  type={
                    health.data.modelRequired &&
                    health.data.model === "Kimi K3 已配置"
                      ? "success"
                      : "error"
                  }
                  showIcon
                  message={
                    health.data.modelRequired &&
                    health.data.model === "Kimi K3 已配置"
                      ? "实时模型已配置，AI 分析将直接调用 Kimi K3"
                      : "实时模型未配置，AI 分析不会执行"
                  }
                />
              </Card>
            </Col>
            <Col span={24} lg={10}>
              <Card title="现场操作">
                <Alert
                  type="warning"
                  showIcon
                  message="一键重置会清除本次演示产生的分析、通报和任务草稿，并恢复固定场景。"
                />
                <Space direction="vertical" className="control-actions">
                  <Button
                    type="primary"
                    danger
                    icon={<WarningFilled />}
                    onClick={reset}
                  >
                    一键重置演示场景
                  </Button>
                  <Button
                    icon={<RobotOutlined />}
                    onClick={() => nav("/economy/agent")}
                  >
                    打开主演示页面
                  </Button>
                  <Button
                    icon={<ExperimentOutlined />}
                    onClick={() => nav("/simulation/tax-profit")}
                  >
                    打开税利模拟器
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </AppShell>
  );
}

function RoutesView() {
  return (
    <AntApp>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/portal" element={<Portal />} />
        <Route path="/strategy" element={<GenericModule module="strategy" />} />
        <Route
          path="/performance"
          element={<GenericModule module="performance" />}
        />
        <Route
          path="/innovation"
          element={<GenericModule module="innovation" />}
        />
        <Route
          path="/benchmarking"
          element={<GenericModule module="benchmarking" />}
        />
        <Route path="/economy" element={<Economy />} />
        <Route path="/economy/indicator/:id" element={<Economy />} />
        <Route path="/economy/agent" element={<Agent />} />
        <Route path="/economy/report/:id" element={<Agent />} />
        <Route path="/simulation/tax-profit" element={<Simulation />} />
        <Route path="/demo-control" element={<DemoControl />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AntApp>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <RoutesView />
    </BrowserRouter>
  );
}
