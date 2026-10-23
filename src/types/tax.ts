export type TaxType =
  | 'RETENCAO_SERVICOS_6_5'
  | 'RETENCAO_SERVICOS_10_5'
  | 'RETENCAO_IVA_100'
  | 'RETENCAO_IVA_50'
  | 'RETENCAO_PREDIAL_15'
  | 'RETENCAO_IRT_B'
  | 'IMPOSTO_SELO_1'
  | 'IMPOSTO_INDUSTRIAL_2';

export interface TaxDefinition {
  type: TaxType;
  name: string;
  shortName: string;
  defaultRate: number; // percentage, e.g., 6.5
  legalArticle: string;
  codeAGT: string;
  accountingAccountDebit: string;
  accountingAccountCredit: string;
  description: string;
}

export interface DocumentAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  dataUrl?: string;
  ocrExtracted?: {
    nif?: string;
    supplier?: string;
    amount?: number;
    invoiceNum?: string;
    invoiceDate?: string;
    confidence: number;
  };
}

export interface RetentionEntry {
  id: string;
  supplierName: string;
  supplierNIF: string;
  supplierType: 'empresa' | 'singular' | 'nao_residente';
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  grossAmount: number;
  taxType: TaxType;
  appliedRate: number;
  taxBaseAmount: number;
  retentionAmount: number;
  netPayableAmount: number;
  status: 'pendente' | 'em_guia' | 'liquidado' | 'atrasado';
  guideId?: string;
  rupeNumber?: string;
  documents: DocumentAttachment[];
  accountingCode: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface PaymentGuide {
  id: string;
  guideNumber: string;
  rupeCode: string; // 20 digits, e.g., 9820 2026 0192 8472 9102
  taxPeriod: string; // e.g., 2026-10
  taxType: TaxType | 'CONSOLIDADA';
  taxTypeName: string;
  issueDate: string;
  dueDate: string;
  totalTaxBase: number;
  totalRetentionAmount: number;
  entryIds: string[];
  status: 'gerada' | 'paga' | 'vencida' | 'cancelada';
  multicaixaEntity: string;
  multicaixaReference: string;
  agtOffice: string;
  taxpayerName: string;
  taxpayerNIF: string;
  paidAt?: string;
  bankProofDoc?: string;
}

export interface TaxObligation {
  id: string;
  title: string;
  taxCategory: string;
  codeAGT: string;
  legalDeadline: string;
  targetDueDate: string;
  penaltyEstimateBase: number; // estimated fine if overdue (usually 25% to 100% of tax due)
  description: string;
  legalReference: string;
  status: 'em_dia' | 'proximo' | 'atrasado' | 'concluido';
  linkedGuideId?: string;
}

export type RoleLevel = 'admin' | 'contabilista' | 'auditor' | 'operador';

export interface UserRolePermissions {
  canCalculateRetentions: boolean;
  canEmitGuides: boolean;
  canApproveGuides: boolean;
  canImportExcel: boolean;
  canExportAccounting: boolean;
  canManageUsers: boolean;
  canManageTaxRates: boolean;
  canDeleteRecords: boolean;
  canViewAuditLog: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: RoleLevel;
  roleTitle: string;
  avatarUrl: string;
  nifOrOrderNum: string;
  department: string;
  permissions: UserRolePermissions;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  ipAddress: string;
  entityType: 'retention' | 'guide' | 'import' | 'export' | 'user' | 'config';
}

export interface OfflineSyncItem {
  id: string;
  timestamp: string;
  action: 'create_entry' | 'update_entry' | 'delete_entry' | 'emit_guide' | 'pay_guide';
  payload: any;
  status: 'pending' | 'synced' | 'failed';
}

export interface CompanyTaxProfile {
  companyName: string;
  nif: string;
  address: string;
  city: string;
  taxRegime: 'Geral' | 'Simplificado' | 'Exclusão';
  agtOffice: string;
  caeCode: string;
  certifiedAccountantName: string;
  certifiedAccountantOrderNum: string;
}
