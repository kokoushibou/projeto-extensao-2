export type RootStackParamList = {
  Agenda: { refreshAt?: number } | undefined;
  AppointmentForm: { appointmentId?: number } | undefined;
  Clients: undefined;
  ClientDetail: { clientId: number };
  Services: undefined;
};
