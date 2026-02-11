// Script para corrigir estrutura das composições
const fs = require('fs');

let content = fs.readFileSync('mockOrcamentos.ts', 'utf8');

// Substituir bdiPercentual: X por estrutura completa
content = content.replace(/(\s+)bdiPercentual:\s*(\d+),\n(\s+)subtotal:\s*(\d+\.?\d*),/g, (match, indent, bdiPercent, indent2, subtotalValue) => {
  const bdiValue = (parseFloat(subtotalValue) * parseFloat(bdiPercent) / (100 + parseFloat(bdiPercent))).toFixed(2);
  const custoDirecto = (parseFloat(subtotalValue) - parseFloat(bdiValue)).toFixed(2);
  
  return `${indent}bdi: {
${indent}  percentual: ${bdiPercent},
${indent}  valor: ${bdiValue},
${indent}},
${indent}custoDirecto: ${custoDirecto},
${indent}subtotal: ${subtotalValue},
${indent}percentualDoTotal: 0,`;
});

fs.writeFileSync('mockOrcamentos.ts', content);
console.log('Arquivo corrigido!');
