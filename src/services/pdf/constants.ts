
export const PDF_COLORS = {
  primary: '#003366',    // Azul escuro
  secondary: '#FF7F0E',  // Laranja
  warning: '#FFD700',    // Amarelo
  border: '#B0B0B0',     // Cinza concreto
  lightBg: '#E0E0E0',    // Cinza claro
  text: '#000000',       // Preto
  success: '#22C55E',    // Verde
  observationBg: '#FEF9C3' // Amarelo claro para observações
};

export const ACTIVITY_PDF_DEFAULTS = {
  margin: 15,
  sectionSpacing: 5,
  fontSize: {
    title: 14,
    sectionHeader: 10,
    body: 9,
    small: 8
  },
  tableStyle: {
    cellPadding: 2.5,
    labelWidth: 32
  },
  imageLayout: {
    maxWidth: 55,
    maxHeight: 40,
    imagesPerRow: 3,
    spacing: 3
  }
};
