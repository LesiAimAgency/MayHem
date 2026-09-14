/**
 * assets/js/core/data-mapper.js
 * Ingests and maps raw JSON structures into structured fast-lookup financial indices.
 */

import { toNum } from './helpers.js';

export function mapFinancialData(jsonData) {
  const metadata = jsonData.metadata || {};

  // 1. Extract years list
  const years = (metadata.years || [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]).map(y => String(y));

  // 2. Extract 30 raw fields metadata
  const rawFields = [];
  const fieldMetaMap = {};

  (metadata.fields || []).forEach(f => {
    let fType = 'number';
    let fUnit = 'Tr.đ';
    if (f.type === 'ratio' || f.type === 'ratio_pos') {
      fType = 'percent';
      fUnit = '%';
    } else if (f.type === 'multiple_1' || f.type === 'multiple_2') {
      fType = 'decimal';
      fUnit = 'Lần';
    } else if (f.type === 'money_full') {
      fType = 'number';
      fUnit = 'Tr.đ';
    }

    const meta = {
      name: f.name,
      field_no: f.field_no,
      format: f.format || '#,##0',
      unit: fUnit,
      type: fType,
      is_calc: false
    };

    rawFields.push(meta);
    fieldMetaMap[f.name] = meta;
  });

  // 3. Extract banks list
  let banks = [];
  if (metadata.bank_symbols && metadata.bank_symbols.length > 0) {
    banks = metadata.bank_symbols.slice().sort();
  } else if (jsonData.banks && Object.keys(jsonData.banks).length > 0) {
    banks = Object.keys(jsonData.banks).sort();
  } else if (jsonData.table && Array.isArray(jsonData.table)) {
    const bankSet = new Set();
    jsonData.table.forEach(r => {
      const b = r['Mã Ngân Hàng'] || r.bank;
      if (b) bankSet.add(b);
    });
    banks = Array.from(bankSet).sort();
  }

  // 4. Build index: bankFinancials[bank][year][fieldName] = number | null
  const bankFinancials = {};
  banks.forEach(b => {
    bankFinancials[b] = {};
    years.forEach(y => {
      bankFinancials[b][y] = {};
    });
  });

  // Ingest from jsonData.table (which contains all 870 raw records)
  if (jsonData.table && Array.isArray(jsonData.table)) {
    jsonData.table.forEach(row => {
      const b = row['Mã Ngân Hàng'] || row.bank;
      const f = row['Chỉ tiêu'] || row.field;
      const vals = row.values || {};

      if (b && f && bankFinancials[b]) {
        years.forEach(y => {
          if (vals[y] !== undefined) {
            bankFinancials[b][y][f] = toNum(vals[y]);
          } else if (row[y] !== undefined) {
            bankFinancials[b][y][f] = toNum(row[y]);
          }
        });
      }
    });
  }

  // Ingest from jsonData.banks if available
  if (jsonData.banks && typeof jsonData.banks === 'object') {
    banks.forEach(b => {
      const bObj = jsonData.banks[b];
      if (bObj && bObj.financials_by_year) {
        years.forEach(y => {
          const yearData = bObj.financials_by_year[y] || {};
          Object.keys(yearData).forEach(field => {
            if (bankFinancials[b][y][field] === undefined) {
              bankFinancials[b][y][field] = toNum(yearData[field]);
            }
          });
        });
      }
    });
  }

  return {
    metadata,
    years,
    banks,
    rawFields,
    fieldMetaMap,
    bankFinancials
  };
}
