export type Status = "normal" | "attention" | "warning" | "critical";
export type AgentStatus =
  | "created"
  | "running"
  | "draft"
  | "confirmed"
  | "failed";

export interface EvidenceReference {
  id: string;
  type: "data" | "definition" | "calculation" | "warning" | "knowledge";
  title: string;
  source: string;
  updatedAt: string;
  summary: string;
}

export interface AnalysisResult {
  status: "ai_draft";
  overallJudgement: string;
  keyMetrics: Array<{
    indicatorCode: string;
    displayName: string;
    currentValue: number;
    unit: string;
    status: Status;
    summary: string;
    evidenceIds: string[];
  }>;
  variances: Array<{
    id: string;
    subject: string;
    description: string;
    evidenceIds: string[];
  }>;
  risks: Array<{
    id: string;
    title: string;
    level: "attention" | "warning" | "critical";
    description: string;
    evidenceIds: string[];
  }>;
  facts: Array<{ id: string; content: string; evidenceIds: string[] }>;
  hypotheses: Array<{
    id: string;
    content: string;
    verificationSuggestion: string;
    evidenceIds: string[];
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    relatedRiskIds: string[];
    knowledgeEvidenceIds: string[];
  }>;
  reportOutline: Array<{
    title: string;
    content: string;
    evidenceIds: string[];
  }>;
  evidence: EvidenceReference[];
}

export interface AnalysisTask {
  id: string;
  status: AgentStatus;
  question: string;
  context: {
    period: string;
    organizationId: string;
    indicatorCodes: string[];
    warningIds: string[];
    comparisonMode: string;
    outputPurpose: string;
  };
  steps: Array<{
    id: string;
    label: string;
    status: "completed" | "running" | "pending";
    summary?: string;
  }>;
  result?: AnalysisResult;
  confirmedBy?: string;
  confirmedAt?: string;
}
