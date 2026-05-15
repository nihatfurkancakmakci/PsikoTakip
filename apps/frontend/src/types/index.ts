export type UserRole = 'GUEST' | 'CLIENT' | 'PSYCHOLOGIST' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Psychologist {
  id: string;
  userId: string;
  specialization: string;
  specializations?: string[];
  biography?: string;
  photoUrl?: string;
  sessionDurationMin: number;
  isAcceptingClients: boolean;
  approvalStatus: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName'>;
}

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
export type SessionType = 'IN_PERSON' | 'ONLINE';

export interface Appointment {
  id: string;
  clientId: string;
  psychologistId: string;
  startTime: string;
  endTime: string;
  sessionType: SessionType;
  status: AppointmentStatus;
  videoMeetingUrl?: string;
  notes?: string;
  psychologist?: Psychologist;
  client?: { userId?: string; user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'> & { phone?: string } };
}

export interface PsychologicalTest {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface TestResult {
  id: string;
  testId: string;
  totalScore: number;
  scoreCategory: string;
  completedAt?: string;
  isSharedWithClient: boolean;
  test: PsychologicalTest;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
