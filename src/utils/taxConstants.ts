import { TaxDefinition, TaxType, UserProfile, CompanyTaxProfile, TaxObligation } from '../types/tax';

export const TAX_DEFINITIONS: Record<TaxType, TaxDefinition> = {
  RETENCAO_SERVICOS_6_5: {
    type: 'RETENCAO_SERVICOS_6_5',
    name: 'Retenção na Fonte - Serviços (6,5%)',
    shortName: 'Serviços 6,5%',
    defaultRate: 6.5,
    legalArticle: 'Artigo 71.º da Lei n.º 26/20 (Código do Imposto Industrial)',
    codeAGT: 'II-RET-71',
    accountingAccountDebit: '31.2.1 - Fornecedores Gerais',
    accountingAccountCredit: '24.2.1 - Estado: Imposto Industrial Retido na Fonte',
    description: 'Aplicável sobre o valor bruto de faturas de prestação de serviços por entidades residentes.',
  },
  RETENCAO_SERVICOS_10_5: {
    type: 'RETENCAO_SERVICOS_10_5',
    name: 'Retenção Não Residentes / Acidentais (10,5%)',
    shortName: 'Serviços 10,5%',
    defaultRate: 10.5,
    legalArticle: 'Artigo 72.º da Lei n.º 26/20 (CII)',
    codeAGT: 'II-RET-72-NR',
    accountingAccountDebit: '31.2.1 - Fornecedores Gerais',
    accountingAccountCredit: '24.2.2 - Estado: Imposto Industrial Não Residentes',
    description: 'Serviços técnicos, consultoria e assistência prestados por entidades não residentes.',
  },
  RETENCAO_IVA_100: {
    type: 'RETENCAO_IVA_100',
    name: 'Cativação Total do IVA (100% de 14%)',
    shortName: 'IVA Cativado 100%',
    defaultRate: 14.0,
    legalArticle: 'Artigo 21.º do CIVA (Decreto Presidencial n.º 180/19)',
    codeAGT: 'IVA-CAT-100',
    accountingAccountDebit: '31.2.1 - Fornecedores Gerais',
    accountingAccountCredit: '24.3.5 - Estado: IVA Cativado na Fonte a Entregar',
    description: 'Cativação integral do IVA aplicável por Grandes Contribuintes e entidades públicas.',
  },
  RETENCAO_IVA_50: {
    type: 'RETENCAO_IVA_50',
    name: 'Cativação Parcial do IVA (50% de 14% = 7%)',
    shortName: 'IVA Cativado 50%',
    defaultRate: 7.0,
    legalArticle: 'Artigo 21.º, n.º 2 do CIVA',
    codeAGT: 'IVA-CAT-50',
    accountingAccountDebit: '31.2.1 - Fornecedores Gerais',
    accountingAccountCredit: '24.3.5 - Estado: IVA Cativado na Fonte a Entregar',
    description: 'Cativação de metade do imposto faturado nos termos do regime de cativação parcial.',
  },
  RETENCAO_PREDIAL_15: {
    type: 'RETENCAO_PREDIAL_15',
    name: 'Retenção de Imposto Predial (15%)',
    shortName: 'Predial / Rendas 15%',
    defaultRate: 15.0,
    legalArticle: 'Código do Imposto Predial (Lei n.º 20/20)',
    codeAGT: 'IP-RENDA-15',
    accountingAccountDebit: '31.2.9 - Credores Diversos (Locadores)',
    accountingAccountCredit: '24.5.1 - Estado: Imposto Predial Retido na Fonte',
    description: 'Retenção sobre o montante de rendas de imóveis pagos a pessoas singulares e coletivas.',
  },
  RETENCAO_IRT_B: {
    type: 'RETENCAO_IRT_B',
    name: 'Retenção IRT - Grupo B / Prestadores (6,5%)',
    shortName: 'IRT Grupo B 6,5%',
    defaultRate: 6.5,
    legalArticle: 'Lei n.º 28/20 (Código do IRT)',
    codeAGT: 'IRT-GRPB-01',
    accountingAccountDebit: '31.2.8 - Prestadores de Serviços Liberais',
    accountingAccountCredit: '24.1.2 - Estado: IRT Retido Grupo B',
    description: 'Retenção na fonte a trabalhadores por conta própria e prestadores independentes.',
  },
  IMPOSTO_SELO_1: {
    type: 'IMPOSTO_SELO_1',
    name: 'Imposto do Selo sobre Quitações / Recibos (1%)',
    shortName: 'Selo Recibo 1,0%',
    defaultRate: 1.0,
    legalArticle: 'Tabela Geral do Imposto do Selo (Lei n.º 18/14)',
    codeAGT: 'IS-VERBA-23',
    accountingAccountDebit: '63.2.1 - Impostos Diretos e Indiretos',
    accountingAccountCredit: '24.6.1 - Estado: Imposto do Selo a Entregar',
    description: 'Imposto do selo incidente sobre recibos de quitação e liquidação de dívidas.',
  },
  IMPOSTO_INDUSTRIAL_2: {
    type: 'IMPOSTO_INDUSTRIAL_2',
    name: 'Liquidação Provisória Imposto Industrial (2%)',
    shortName: 'II Provisório 2%',
    defaultRate: 2.0,
    legalArticle: 'Artigo 66.º da Lei n.º 26/20 (CII)',
    codeAGT: 'II-PROV-02',
    accountingAccountDebit: '24.2.9 - Estado: Imposto Industrial por Conta',
    accountingAccountCredit: '12.1.1 - Depósitos à Ordem',
    description: 'Adiantamento mensal ou semestral por conta do Imposto Industrial do exercício.',
  },
};

export const INITIAL_COMPANY: CompanyTaxProfile = {
  companyName: 'KUBIKU ENGENHARIA & TECNOLOGIAS, LDA',
  nif: '5417082910',
  address: 'Avenida 4 de Fevereiro, n.º 124, 6.º Andar, Baixa',
  city: 'Luanda, Angola',
  taxRegime: 'Geral',
  agtOffice: 'Repartição Fiscal dos Grandes Contribuintes - Luanda',
  caeCode: '62020 - Consultoria em Tecnologias de Informação e Fiscalidade',
  certifiedAccountantName: 'Dra. Maria Fernandes',
  certifiedAccountantOrderNum: 'OCPCA n.º 4182/2018',
};

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user_carlos',
    name: 'Eng. Carlos Mendes',
    email: 'carlos.mendes@kubiku.ao',
    role: 'admin',
    roleTitle: 'Administrador Fiscal & Diretor Geral',
    avatarUrl: '/src/assets/images/avatar_carlos_admin_1792769440464.jpg',
    nifOrOrderNum: '00289182LA041',
    department: 'Diretoria Financeira',
    permissions: {
      canCalculateRetentions: true,
      canEmitGuides: true,
      canApproveGuides: true,
      canImportExcel: true,
      canExportAccounting: true,
      canManageUsers: true,
      canManageTaxRates: true,
      canDeleteRecords: true,
      canViewAuditLog: true,
    },
  },
  {
    id: 'user_maria',
    name: 'Dra. Maria Fernandes',
    email: 'maria.fernandes@kubiku.ao',
    role: 'contabilista',
    roleTitle: 'Contabilista Sénior Certificada',
    avatarUrl: '/src/assets/images/avatar_maria_accountant_1792769440578.jpg',
    nifOrOrderNum: 'OCPCA 4182/AO',
    department: 'Departamento de Contabilidade e Fiscalidade',
    permissions: {
      canCalculateRetentions: true,
      canEmitGuides: true,
      canApproveGuides: true,
      canImportExcel: true,
      canExportAccounting: true,
      canManageUsers: false,
      canManageTaxRates: false,
      canDeleteRecords: false,
      canViewAuditLog: true,
    },
  },
  {
    id: 'user_joao',
    name: 'Dr. João Silva',
    email: 'joao.silva@auditoria-angola.ao',
    role: 'auditor',
    roleTitle: 'Auditor Fiscal Independente (ROC)',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JoaoSilva&backgroundColor=b6e3f4',
    nifOrOrderNum: 'OROC n.º 291',
    department: 'Auditoria Externa & Compliance',
    permissions: {
      canCalculateRetentions: false,
      canEmitGuides: false,
      canApproveGuides: false,
      canImportExcel: false,
      canExportAccounting: true,
      canManageUsers: false,
      canManageTaxRates: false,
      canDeleteRecords: false,
      canViewAuditLog: true,
    },
  },
  {
    id: 'user_ana',
    name: 'Ana Paula Lourenço',
    email: 'ana.lourenco@kubiku.ao',
    role: 'operador',
    roleTitle: 'Operadora de Faturação & Contas a Pagar',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnaPaula&backgroundColor=ffdfbf',
    nifOrOrderNum: '00718291LA019',
    department: 'Tesouraria',
    permissions: {
      canCalculateRetentions: true,
      canEmitGuides: false,
      canApproveGuides: false,
      canImportExcel: true,
      canExportAccounting: false,
      canManageUsers: false,
      canManageTaxRates: false,
      canDeleteRecords: false,
      canViewAuditLog: false,
    },
  },
];

export const INITIAL_TAX_OBLIGATIONS: TaxObligation[] = [
  {
    id: 'ob_01',
    title: 'Entrega de Retenções na Fonte (Imposto Industrial Mod. 1)',
    taxCategory: 'Imposto Industrial',
    codeAGT: 'AGT-MOD-01',
    legalDeadline: 'Até ao último dia útil do mês seguinte à liquidação',
    targetDueDate: '2026-10-31',
    penaltyEstimateBase: 25, // 25% fine + 1.25%/month interest
    description: 'Entrega das retenções de 6,5% e 10,5% efetuadas a prestadores de serviços de Setembro/Outubro.',
    legalReference: 'Art. 71.º n.º 3 da Lei 26/20',
    status: 'proximo',
  },
  {
    id: 'ob_02',
    title: 'Declaração e Pagamento do IRT Grupo B (Modelo 2)',
    taxCategory: 'IRT (Trabalho)',
    codeAGT: 'AGT-MOD-02',
    legalDeadline: 'Até ao último dia do mês seguinte',
    targetDueDate: '2026-10-31',
    penaltyEstimateBase: 30,
    description: 'Declaração de rendimentos e retenções de 6,5% efetuadas sobre trabalhadores independentes.',
    legalReference: 'Art. 35.º da Lei 28/20 (CIRT)',
    status: 'proximo',
  },
  {
    id: 'ob_03',
    title: 'Declaração Periódica e Cativação do IVA (Mod. 7)',
    taxCategory: 'IVA',
    codeAGT: 'AGT-IVA-07',
    legalDeadline: 'Até ao último dia do mês subsequente',
    targetDueDate: '2026-10-31',
    penaltyEstimateBase: 25,
    description: 'Liquidação e entrega das cativações de IVA a 100% e 50% conforme regime dos Grandes Contribuintes.',
    legalReference: 'Art. 21.º e 43.º do CIVA',
    status: 'proximo',
  },
  {
    id: 'ob_04',
    title: 'Retenção na Fonte de Imposto Predial (Arrendamento)',
    taxCategory: 'Imposto Predial',
    codeAGT: 'AGT-IPU-RET',
    legalDeadline: 'Até ao fim do mês seguinte ao pagamento da renda',
    targetDueDate: '2026-11-30',
    penaltyEstimateBase: 20,
    description: 'Retenção de 15% sobre rendas pagas a senhorios por imóveis comerciais.',
    legalReference: 'Código do Imposto Predial (Lei 20/20)',
    status: 'em_dia',
  },
];

export function generateRUPE(): string {
  // Generates realistic AGT 20-digit RUPE: 9820 YYYY MMDD XXXX XXXX
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const rnd1 = Math.floor(1000 + Math.random() * 9000);
  const rnd2 = Math.floor(1000 + Math.random() * 9000);
  return `9820 ${year} ${month}${day} ${rnd1} ${rnd2}`;
}

export function generateMulticaixaReference(): string {
  // 9 digit reference
  const p1 = Math.floor(100 + Math.random() * 900);
  const p2 = Math.floor(100 + Math.random() * 900);
  const p3 = Math.floor(100 + Math.random() * 900);
  return `${p1} ${p2} ${p3}`;
}

export function formatAOA(amount: number): string {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('AOA', 'Kz');
}
