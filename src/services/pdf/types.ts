
import { NonConformity } from '@/interfaces/RncInterface';
import jsPDF from 'jspdf';

export interface PdfColors {
  primary: string;
  secondary: string;
  warning: string;
  border: string;
  lightBg: string;
  text: string;
}

export interface PdfContext {
  doc: jsPDF;
  pageWidth: number;
  pageHeight: number;
  margin: number;
  colors: PdfColors;
  yPos: number;
}

export interface PdfSection {
  render(ctx: PdfContext, rnc: NonConformity): Promise<number>;
}
