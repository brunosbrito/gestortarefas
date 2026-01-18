// Interfaces para Veículos - Logística

export type VehicleType = 'carro' | 'empilhadeira' | 'caminhao';
export type VehicleStatus = 'disponivel' | 'em_uso' | 'em_manutencao' | 'inativo';

export interface Vehicle {
  id: number;
  tipo: VehicleType;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  cor?: string;

  // KM
  km_atual: number;
  km_proxima_manutencao: number;

  // Documentação
  renavam?: string;
  chassi?: string;
  crlv_validade: string;
  seguro_validade: string;
  seguro_numero?: string;

  // Status
  status: VehicleStatus;
  observacoes?: string;

  // QR Code (implementação futura - POC aprovado)
  qr_code_token?: string;
  qr_code_data_url?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface VehicleCreate
  extends Omit<
    Vehicle,
    'id' | 'qr_code_token' | 'qr_code_data_url' | 'created_at' | 'updated_at'
  > {}

export interface VehicleUpdate extends Partial<VehicleCreate> {}
