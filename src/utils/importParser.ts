import * as XLSX from 'xlsx';
import { RetentionEntry, TaxType } from '../types/tax';
import { TAX_DEFINITIONS } from './taxConstants';

export interface ParseResult {
  validEntries: RetentionEntry[];
  errors: string[];
  totalRows: number;
}

export function parseExcelOrCSV(fileData: ArrayBuffer, authorName: string): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    try {
      const workbook = XLSX.read(fileData, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      const validEntries: RetentionEntry[] = [];
      const errors: string[] = [];

      rawRows.forEach((row, index) => {
        const rowNum = index + 2; // header is row 1

        // Flexible key matching for columns
        const supplierName = row['Fornecedor'] || row['Nome'] || row['Beneficiário'] || row['Fornecedor / Beneficiário'] || '';
        const supplierNIF = String(row['NIF'] || row['NIF Fornecedor'] || row['NIF_Beneficiario'] || '').trim();
        const invoiceNumber = String(row['N.º da Fatura'] || row['Fatura'] || row['Fatura_Numero'] || row['Documento'] || `FT-IMP-${index + 1}`).trim();
        const invoiceDate = String(row['Data'] || row['Data de Emissão'] || row['Data_Fatura'] || new Date().toISOString().slice(0, 10)).trim();
        const rawAmount = row['Valor Ilíquido'] || row['Valor Bruto'] || row['Valor'] || row['Valor_Base_Kz'] || 0;
        const grossAmount = typeof rawAmount === 'number' ? rawAmount : parseFloat(String(rawAmount).replace(/[^0-9.-]+/g, '')) || 0;

        if (!supplierName) {
          errors.push(`Linha ${rowNum}: Nome do fornecedor em falta.`);
          return;
        }

        if (grossAmount <= 0) {
          errors.push(`Linha ${rowNum}: Valor da fatura inválido ou nulo (${rawAmount}).`);
          return;
        }

        // Determine tax type
        const taxKey = String(row['Imposto'] || row['Tipo'] || row['Tipo_Imposto'] || 'RETENCAO_SERVICOS_6_5').toUpperCase();
        let taxType: TaxType = 'RETENCAO_SERVICOS_6_5';
        let appliedRate = 6.5;

        if (taxKey.includes('10.5') || taxKey.includes('10,5') || taxKey.includes('RESIDENTE')) {
          taxType = 'RETENCAO_SERVICOS_10_5';
          appliedRate = 10.5;
        } else if (taxKey.includes('15') || taxKey.includes('PREDIAL') || taxKey.includes('RENDA')) {
          taxType = 'RETENCAO_PREDIAL_15';
          appliedRate = 15.0;
        } else if (taxKey.includes('IRT') || taxKey.includes('GRUPO B')) {
          taxType = 'RETENCAO_IRT_B';
          appliedRate = 6.5;
        } else if (taxKey.includes('100') || (taxKey.includes('IVA') && !taxKey.includes('50'))) {
          taxType = 'RETENCAO_IVA_100';
          appliedRate = 14.0;
        } else if (taxKey.includes('50')) {
          taxType = 'RETENCAO_IVA_50';
          appliedRate = 7.0;
        } else if (taxKey.includes('SELO')) {
          taxType = 'IMPOSTO_SELO_1';
          appliedRate = 1.0;
        }

        const taxDef = TAX_DEFINITIONS[taxType];
        const retentionAmount = Number(((grossAmount * appliedRate) / 100).toFixed(2));
        const netPayableAmount = Number((grossAmount - retentionAmount).toFixed(2));

        const entry: RetentionEntry = {
          id: `imp_${Date.now()}_${index}`,
          supplierName: String(supplierName).trim(),
          supplierNIF: supplierNIF || '9999999999',
          supplierType: supplierNIF.length === 10 ? 'empresa' : 'singular',
          invoiceNumber,
          invoiceDate: invoiceDate.includes('T') ? invoiceDate.slice(0, 10) : invoiceDate,
          dueDate: new Date(Date.now() + 25 * 86400000).toISOString().slice(0, 10),
          grossAmount,
          taxType,
          appliedRate,
          taxBaseAmount: grossAmount,
          retentionAmount,
          netPayableAmount,
          status: 'pendente',
          accountingCode: taxDef?.accountingAccountCredit || '24.2.1 - Imposto Industrial Retido',
          notes: `Importado de planilha em ${new Date().toLocaleDateString('pt-AO')}`,
          createdAt: new Date().toISOString(),
          createdBy: authorName,
          documents: [],
        };

        validEntries.push(entry);
      });

      resolve({
        validEntries,
        errors,
        totalRows: rawRows.length,
      });
    } catch (err: any) {
      reject(new Error(`Falha ao ler planilha Excel/CSV: ${err.message}`));
    }
  });
}

// Generates an Excel template that user can download to fill in
export function generateExcelTemplate() {
  const sampleData = [
    {
      'Fornecedor': 'ENGENHARIA E CONSTRUÇÕES DO KILAMBA, LDA',
      'NIF Fornecedor': '5418902192',
      'N.º da Fatura': 'FT 2026/0120',
      'Data de Emissão': '2026-10-15',
      'Valor Ilíquido': 15000000,
      'Imposto': 'Serviços 6,5%',
      'Observações': 'Construção de cabine de transformação',
    },
    {
      'Fornecedor': 'EMPRESA NACIONAL DE ELETRICIDADE E DISTRIBUIÇÃO',
      'NIF Fornecedor': '5401928374',
      'N.º da Fatura': 'FT 2026/9941',
      'Data de Emissão': '2026-10-18',
      'Valor Ilíquido': 8500000,
      'Imposto': 'Serviços 6,5%',
      'Observações': 'Reparação de linha de alta tensão',
    },
    {
      'Fornecedor': 'DR. ANTÓNIO MANUEL QUIALA',
      'NIF Fornecedor': '00289104LA011',
      'N.º da Fatura': 'REC-B 2026/07',
      'Data de Emissão': '2026-10-20',
      'Valor Ilíquido': 3200000,
      'Imposto': 'IRT Grupo B 6,5%',
      'Observações': 'Assessoria jurídica em direito fiscal',
    },
    {
      'Fornecedor': 'GESTÃO IMOBILIÁRIA DA MUTAMBA, SA',
      'NIF Fornecedor': '5409182374',
      'N.º da Fatura': 'REC-REND 2026/10',
      'Data de Emissão': '2026-10-02',
      'Valor Ilíquido': 12000000,
      'Imposto': 'Predial / Rendas 15%',
      'Observações': 'Renda mensal do escritório central',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Modelo_Importacao');

  // Instructions sheet
  const helpData = [
    { 'Campo': 'Fornecedor', 'Obrigatório': 'Sim', 'Descrição': 'Nome completo da entidade ou prestador' },
    { 'Campo': 'NIF Fornecedor', 'Obrigatório': 'Sim', 'Descrição': 'Número de Identificação Fiscal válido na AGT (10 dígitos para empresas)' },
    { 'Campo': 'N.º da Fatura', 'Obrigatório': 'Sim', 'Descrição': 'Número fiscal do documento retentivo' },
    { 'Campo': 'Data de Emissão', 'Obrigatório': 'Sim', 'Descrição': 'Formato YYYY-MM-DD ou DD/MM/YYYY' },
    { 'Campo': 'Valor Ilíquido', 'Obrigatório': 'Sim', 'Descrição': 'Valor bruto em Kwanzas (Kz) sem separador de milhar' },
    { 'Campo': 'Imposto', 'Obrigatório': 'Sim', 'Descrição': 'Opções: Serviços 6,5% | Serviços 10,5% | IRT Grupo B 6,5% | Predial / Rendas 15% | IVA Cativado 100%' },
  ];
  const helpSheet = XLSX.utils.json_to_sheet(helpData);
  XLSX.utils.book_append_sheet(workbook, helpSheet, 'Instrucoes_Preenchimento');

  XLSX.writeFile(workbook, `TributaPro_Modelo_Planilha_AGT.xlsx`);
}
