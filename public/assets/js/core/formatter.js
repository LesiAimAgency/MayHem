/**
 * assets/js/core/formatter.js
 * Data presentation formatters: numbers, percentages, decimals, currencies.
 * Rule: Presentation only. Raw data remains 100% unaltered.
 */

export function formatValue(val, meta = {}) {
  if (val === null || val === undefined || val === '' || isNaN(val)) {
    return '<span class="val-null">-</span>';
  }

  const num = Number(val);
  const type = meta.type || 'number';

  if (type === 'percent') {
    const formatted = (num * 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + '%';

    if (num < 0) return `<span class="val-negative">${formatted}</span>`;
    if (num === 0) return `<span class="val-zero">${formatted}</span>`;
    return formatted;
  }

  if (type === 'decimal') {
    let digits = 1;
    if (meta.format === '0.00') {
      digits = 2;
    } else if (meta.format === '0.0') {
      digits = 1;
    } else if (meta.format && meta.format.includes('.')) {
      digits = meta.format.split('.')[1].replace(/[^0#]/g, '').length || 1;
    }
    const formatted = num.toLocaleString('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });

    if (num < 0) return `<span class="val-negative">${formatted}</span>`;
    if (num === 0) return `<span class="val-zero">${formatted}</span>`;
    return formatted;
  }

  // Default: Integer / Money format
  const formatted = Math.round(num).toLocaleString('en-US');
  if (num < 0) return `<span class="val-negative">${formatted}</span>`;
  if (num === 0) return `<span class="val-zero">0</span>`;
  return formatted;
}

export function formatNumber(val) {
  if (val === null || val === undefined || isNaN(val)) return '-';
  return Number(val).toLocaleString('en-US');
}

export function formatPercent(val) {
  if (val === null || val === undefined || isNaN(val)) return '-';
  return (Number(val) * 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + '%';
}
