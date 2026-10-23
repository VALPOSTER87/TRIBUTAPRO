import * as XLSX from 'xlsx';
import { CompanyTaxProfile, PaymentGuide, RetentionEntry, TaxType } from '../types/tax';
import { formatAOA, TAX_DEFINITIONS } from './taxConstants';

// Trigger file download in browser
export function downloadFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 1. Excel (.xlsx) Export
export function exportRetentionsToExcel(entries: RetentionEntry[], company: CompanyTaxProfile) {
  const worksheetData = entries.map((entry, index) => {
    const taxDef = TAX_DEFINITIONS[entry.taxType];
    return {
      'N.º Ordem': index + 1,
      'Fornecedor / Beneficiário': entry.supplierName,
      'NIF Fornecedor': entry.supplierNIF,
      'Tipo de Entidade': entry.supplierType === 'empresa' ? 'Pessoa Coletiva' : entry.supplierType === 'singular' ? 'Pessoa Singular' : 'Não Residente',
      'N.º da Fatura/Recibo': entry.invoiceNumber,
      'Data de Emissão': entry.invoiceDate,
      'Data de Vencimento': entry.dueDate,
      'Imposto / Retenção': taxDef ? taxDef.name : entry.taxType,
      'Taxa Aplicada (%)': `${entry.appliedRate}%`,
      'Valor Ilíquido (Base Kz)': entry.taxBaseAmount,
      'Imposto Retido (Kz)': entry.retentionAmount,
      'Valor Líquido a Pagar (Kz)': entry.netPayableAmount,
      'Estado': entry.status.toUpperCase(),
      'N.º RUPE / Guia': entry.rupeNumber || entry.guideId || 'Pendente',
      'Conta Contabilística': entry.accountingCode,
      'Observações': entry.notes || '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Retencoes_Fiscais');

  // Metadata sheet
  const metaData = [
    { 'Propriedade': 'Empresa Contribuinte', 'Valor': company.companyName },
    { 'Propriedade': 'NIF da Empresa', 'Valor': company.nif },
    { 'Propriedade': 'Repartição Fiscal AGT', 'Valor': company.agtOffice },
    { 'Propriedade': 'Data de Extração', 'Valor': new Date().toLocaleString('pt-AO') },
    { 'Propriedade': 'Total de Registos', 'Valor': entries.length },
    { 'Propriedade': 'Total Retido (Kz)', 'Valor': entries.reduce((s, e) => s + e.retentionAmount, 0) },
  ];
  const metaSheet = XLSX.utils.json_to_sheet(metaData);
  XLSX.utils.book_append_sheet(workbook, metaSheet, 'Metadados_Empresa');

  XLSX.writeFile(workbook, `TributaPro_Retencoes_${company.nif}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// 2. CSV Export
export function exportRetentionsToCSV(entries: RetentionEntry[], delimiter = ';') {
  const headers = [
    'Ordem',
    'Fornecedor',
    'NIF',
    'Fatura_Numero',
    'Data_Fatura',
    'Vencimento',
    'Tipo_Imposto',
    'Taxa_Percentual',
    'Valor_Base_Kz',
    'Valor_Retido_Kz',
    'Valor_Liquido_Kz',
    'Estado',
    'RUPE_Guia',
    'Conta_Razao',
  ];

  const rows = entries.map((e, idx) => [
    idx + 1,
    `"${e.supplierName.replace(/"/g, '""')}"`,
    e.supplierNIF,
    e.invoiceNumber,
    e.invoiceDate,
    e.dueDate,
    TAX_DEFINITIONS[e.taxType]?.shortName || e.taxType,
    e.appliedRate,
    e.taxBaseAmount.toFixed(2),
    e.retentionAmount.toFixed(2),
    e.netPayableAmount.toFixed(2),
    e.status,
    e.rupeNumber || '',
    e.accountingCode,
  ]);

  const csvContent = [headers.join(delimiter), ...rows.map(r => r.join(delimiter))].join('\r\n');
  downloadFile(csvContent, `Retencoes_TributaPro_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

// 3. Official AGT Modelo 1 Format (Retenções na Fonte de Imposto Industrial e Predial)
export function exportAGTModelo1(entries: RetentionEntry[], company: CompanyTaxProfile, period: string) {
  // Conforme exigências da Administração Geral Tributária de Angola
  const filtered = entries.filter(e => e.taxType.startsWith('RETENCAO_SERVICOS') || e.taxType === 'RETENCAO_PREDIAL_15');
  
  let content = `REGISTO DE DECLARACAO - AGT MODELO 1 (RETENCOES NA FONTE)\r\n`;
  content += `NIF_DECLARANTE;${company.nif}\r\n`;
  content += `NOME_DECLARANTE;${company.companyName}\r\n`;
  content += `PERIODO_MES_ANO;${period}\r\n`;
  content += `REPARTICAO_FISCAL;${company.agtOffice}\r\n`;
  content += `REGIME_TRIBUTARIO;${company.taxRegime}\r\n`;
  content += `CONTABILISTA_OCPCA;${company.certifiedAccountantName} - ${company.certifiedAccountantOrderNum}\r\n`;
  content += `DATA_GERACAO;${new Date().toISOString()}\r\n`;
  content += `\r\n`;
  content += `NUMERO_LINHA;NIF_BENEFICIARIO;NOME_BENEFICIARIO;PAIS_RESIDENCIA;TIPO_OPERACAO;CODIGO_AGT;NUM_FATURA;DATA_PAGAMENTO;VALOR_BRUTO_AOA;TAXA_RETENCAO;VALOR_RETIDO_AOA;NUM_RUPE\r\n`;

  filtered.forEach((e, i) => {
    const isNR = e.supplierType === 'nao_residente';
    const codAGT = TAX_DEFINITIONS[e.taxType]?.codeAGT || 'II-RET-71';
    content += `${i + 1};${e.supplierNIF};"${e.supplierName.replace(/"/g, '""')}";${isNR ? 'ESTRANGEIRO' : 'AO'};${e.taxType};${codAGT};${e.invoiceNumber};${e.invoiceDate};${e.taxBaseAmount.toFixed(2)};${e.appliedRate};${e.retentionAmount.toFixed(2)};${e.rupeNumber || ''}\r\n`;
  });

  const totalBase = filtered.reduce((s, e) => s + e.taxBaseAmount, 0);
  const totalRetido = filtered.reduce((s, e) => s + e.retentionAmount, 0);
  content += `\r\n`;
  content += `TOTAIS;TOTAL_LINHAS=${filtered.length};VALOR_TOTAL_BASE=${totalBase.toFixed(2)};VALOR_TOTAL_RETIDO=${totalRetido.toFixed(2)}\r\n`;

  downloadFile(content, `AGT_MODELO_1_${company.nif}_${period.replace('/', '-')}.txt`, 'text/plain;charset=utf-8;');
}

// 4. Official AGT Modelo 2 (Declaração de IRT)
export function exportAGTModelo2(entries: RetentionEntry[], company: CompanyTaxProfile, period: string) {
  const filtered = entries.filter(e => e.taxType === 'RETENCAO_IRT_B');
  
  let content = `REGISTO DECLARATIVO AGT - MODELO 2 (IRT RENDIMENTOS DO TRABALHO)\r\n`;
  content += `NIF_ENTIDADE_PAGADORA;${company.nif}\r\n`;
  content += `NOME_ENTIDADE;${company.companyName}\r\n`;
  content += `PERIODO_REFERENCIA;${period}\r\n`;
  content += `TIPO_DECLARACAO;GRUPO_B_TRABALHADORES_INDEPENDENTES\r\n`;
  content += `\r\n`;
  content += `LINHA;NIF_TRABALHADOR;NOME_COMPLETO;NUMERO_RECIBO;DATA_RECIBO;REMUNERACAO_BRUTA;TAXA_IRT;IMPOSTO_RETIDO;CONTA_CREDITO\r\n`;

  filtered.forEach((e, i) => {
    content += `${i + 1};${e.supplierNIF};"${e.supplierName}";${e.invoiceNumber};${e.invoiceDate};${e.taxBaseAmount.toFixed(2)};${e.appliedRate}%;${e.retentionAmount.toFixed(2)};${e.accountingCode}\r\n`;
  });

  downloadFile(content, `AGT_MODELO_2_IRT_${company.nif}_${period.replace('/', '-')}.txt`, 'text/plain;charset=utf-8;');
}

// 5. SAF-T (AO) Fiscal XML Export (Extract of Tax Table & Journal for AGT)
export function exportSAFT_AO(entries: RetentionEntry[], guides: PaymentGuide[], company: CompanyTaxProfile, period: string) {
  const totalTax = entries.reduce((s, e) => s + e.retentionAmount, 0);
  const totalGross = entries.reduce((s, e) => s + e.taxBaseAmount, 0);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AuditFile xmlns="urn:OECD:StandardAuditFile-Tax:AO_1.01_01" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Header>
    <AuditFileVersion>1.01_01</AuditFileVersion>
    <CompanyID>${company.nif}</CompanyID>
    <TaxRegistrationNumber>${company.nif}</TaxRegistrationNumber>
    <TaxAccountingBasis>F</TaxAccountingBasis>
    <CompanyName>${company.companyName}</CompanyName>
    <CompanyAddress>
      <AddressDetail>${company.address}</AddressDetail>
      <City>${company.city}</City>
      <Country>AO</Country>
    </CompanyAddress>
    <FiscalYear>${period.slice(0, 4)}</FiscalYear>
    <StartDate>${period.slice(0, 4)}-01-01</StartDate>
    <EndDate>${period.slice(0, 4)}-12-31</EndDate>
    <CurrencyCode>AOA</CurrencyCode>
    <DateCreated>${new Date().toISOString().slice(0, 10)}</DateCreated>
    <TaxEntity>Global</TaxEntity>
    <ProductCompanyTaxID>${company.nif}</ProductCompanyTaxID>
    <SoftwareCertificateNumber>999/AGT/2026</SoftwareCertificateNumber>
    <ProductID>TributaPro AGT Fiscal Flow</ProductID>
    <ProductVersion>2026.4</ProductVersion>
  </Header>
  <MasterFiles>
    <GeneralLedgerAccounts>
      <Account>
        <AccountID>24.2.1</AccountID>
        <AccountDescription>Estado - Imposto Industrial Retido na Fonte</AccountDescription>
        <OpeningDebitBalance>0.00</OpeningDebitBalance>
        <OpeningCreditBalance>0.00</OpeningCreditBalance>
        <ClosingDebitBalance>0.00</ClosingDebitBalance>
        <ClosingCreditBalance>${totalTax.toFixed(2)}</ClosingCreditBalance>
        <GroupingCategory>GR</GroupingCategory>
      </Account>
    </GeneralLedgerAccounts>
    <Suppliers>
${entries
  .map(
    e => `      <Supplier>
        <SupplierID>${e.supplierNIF}</SupplierID>
        <AccountID>31.2.1</AccountID>
        <SupplierTaxID>${e.supplierNIF}</SupplierTaxID>
        <CompanyName>${e.supplierName}</CompanyName>
      </Supplier>`
  )
  .join('\n')}
    </MasterFiles>
  <GeneralLedgerEntries>
    <NumberOfEntries>${entries.length}</NumberOfEntries>
    <TotalDebit>${totalGross.toFixed(2)}</TotalDebit>
    <TotalCredit>${totalGross.toFixed(2)}</TotalCredit>
${entries
  .map(
    (e, idx) => `    <Journal>
      <JournalID>03-COMPRAS</JournalID>
      <Description>Retenção Fonte ${e.invoiceNumber}</Description>
      <Transaction>
        <TransactionID>TRX-${e.id}</TransactionID>
        <Period>${period.slice(5, 7) || '10'}</Period>
        <TransactionDate>${e.invoiceDate}</TransactionDate>
        <SourceID>${e.createdBy}</SourceID>
        <Description>Fatura ${e.invoiceNumber} - Retenção ${e.appliedRate}%</Description>
        <Line>
          <RecordID>${idx * 2 + 1}</RecordID>
          <AccountID>31.2.1</AccountID>
          <DebitAmount>${e.retentionAmount.toFixed(2)}</DebitAmount>
          <Description>Débito C/C Fornecedor por retenção</Description>
        </Line>
        <Line>
          <RecordID>${idx * 2 + 2}</RecordID>
          <AccountID>${e.accountingCode.split(' ')[0]}</AccountID>
          <CreditAmount>${e.retentionAmount.toFixed(2)}</CreditAmount>
          <Description>Crédito Estado Retenção na Fonte</Description>
        </Line>
      </Transaction>
    </Journal>`
  )
  .join('\n')}
  </GeneralLedgerEntries>
</AuditFile>`;

  downloadFile(xml, `SAFT_AO_${company.nif}_${period.replace('/', '-')}.xml`, 'application/xml;charset=utf-8;');
}

// 6. Accounting System Bridges: Primavera, PHC, SAP, Sage
export function exportAccountingIntegration(
  system: 'primavera' | 'phc' | 'sap' | 'sage',
  entries: RetentionEntry[],
  company: CompanyTaxProfile
) {
  const timestamp = new Date().toISOString().slice(0, 10);
  
  if (system === 'primavera') {
    // Primavera BSS format (Diário de Compras / Ficheiro ASCII de Integração)
    let content = `// FICHEIRO DE INTEGRACAO PRIMAVERA BSS - MODULO FISCAL/CONTABILIDADE\r\n`;
    content += `// EMPRESA: ${company.companyName} | NIF: ${company.nif}\r\n`;
    content += `HEADER;PRIMAVERA_V10;CONTABILIDADE;DIARIOS\r\n`;
    
    entries.forEach((e, idx) => {
      const contaCredito = e.accountingCode.split(' ')[0] || '24.2.1';
      content += `LANC;03;${e.invoiceDate};${idx + 1};${e.invoiceNumber};${e.supplierNIF};"Retencao ${e.appliedRate}%"\r\n`;
      content += `LINHA;1;D;31210001;${e.retentionAmount.toFixed(2)};"${e.supplierName}";"${e.invoiceNumber}"\r\n`;
      content += `LINHA;2;C;${contaCredito.replace(/\./g, '')};${e.retentionAmount.toFixed(2)};"AGT Retencao";"${e.rupeNumber || ''}"\r\n`;
    });
    
    downloadFile(content, `PRIMAVERA_LANC_RETENCOES_${timestamp}.txt`, 'text/plain;charset=utf-8;');
  } else if (system === 'phc') {
    // PHC Software (Ficheiro de Integração de Documentos Fiscais)
    let content = `CODIGO_DOCUMENTO,DATA_MOV,CONTA_DEB,CONTA_CRED,VALOR,DESCRICAO,NIF,REFERENCIA\r\n`;
    entries.forEach(e => {
      const contaCred = e.accountingCode.split(' ')[0] || '24.2.1';
      content += `"RET","${e.invoiceDate}","31.2.1","${contaCred}",${e.retentionAmount.toFixed(2)},"Retencao na Fonte ${e.appliedRate}%","${e.supplierNIF}","${e.invoiceNumber}"\r\n`;
    });
    downloadFile(content, `PHC_INTEGRACAO_RETENCOES_${timestamp}.csv`, 'text/csv;charset=utf-8;');
  } else if (system === 'sap') {
    // SAP ERP (Batch input FB01 / RFC table structure)
    let content = `TCODE\tBLDAT\tBLART\tBUKRS\tBUDAT\tWAERS\tXBLNR\tNEWBS\tNEWKO\tWRBTR\tSGTXT\r\n`;
    entries.forEach(e => {
      const gkonto = e.accountingCode.split(' ')[0].replace(/\./g, '') || '242100';
      // Debit supplier
      content += `FB01\t${e.invoiceDate.replace(/-/g, '')}\tKR\t1000\t${e.invoiceDate.replace(/-/g, '')}\tAOA\t${e.invoiceNumber}\t21\t${e.supplierNIF}\t${e.retentionAmount.toFixed(2)}\tRetencao ${e.appliedRate}%\r\n`;
      // Credit tax payable
      content += `FB01\t${e.invoiceDate.replace(/-/g, '')}\tKR\t1000\t${e.invoiceDate.replace(/-/g, '')}\tAOA\t${e.invoiceNumber}\t50\t${gkonto}\t${e.retentionAmount.toFixed(2)}\tAGT Retencao na Fonte\r\n`;
    });
    downloadFile(content, `SAP_BATCH_FB01_TAX_${timestamp}.txt`, 'text/plain;charset=utf-8;');
  } else if (system === 'sage') {
    // Sage 50 / 1000 Journal Import CSV
    let content = `Type,Account,Ref,Date,Details,Net,TaxCode\r\n`;
    entries.forEach(e => {
      content += `JC,3121,${e.invoiceNumber},${e.invoiceDate},"Retencao ${e.supplierName}",-${e.retentionAmount.toFixed(2)},T0\r\n`;
      content += `JC,2421,${e.invoiceNumber},${e.invoiceDate},"Estado Retencao AGT",${e.retentionAmount.toFixed(2)},T0\r\n`;
    });
    downloadFile(content, `SAGE_JOURNAL_RETENCOES_${timestamp}.csv`, 'text/csv;charset=utf-8;');
  }
}
