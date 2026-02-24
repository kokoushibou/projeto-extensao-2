export type AppointmentStatus = 'MARCADO' | 'CONCLUIDO' | 'FALTOU' | 'CANCELADO';

export type Client = {
  id: number;
  name: string;
  phone?: string | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type Service = {
  id: number;
  name: string;
  durationMin: number;
  defaultPrice?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type Appointment = {
  id: number;
  date: string;
  startTime: string;
  durationMin: number;
  clientId: number;
  serviceId: number;
  price?: number | null;
  status: AppointmentStatus;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type AppointmentListItem = Appointment & {
  clientName: string;
  serviceName: string;
};

export type ClientHistoryItem = AppointmentListItem;
