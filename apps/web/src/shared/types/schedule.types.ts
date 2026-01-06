/**
 * Schedule System Types
 * TypeScript interfaces for the generic schedule system
 */

export enum ScheduleStrategy {
  ROUND_ROBIN = 'round_robin',
  RANDOM = 'random',
  MANUAL = 'manual',
  FIRST_AVAILABLE = 'first_available',
}

export enum ScheduleEventStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  SKIPPED = 'skipped',
}

export enum SwapRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export interface ScheduleDefinition {
  id: number;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  requiredPeoplePerSlot: number;
  strategy: ScheduleStrategy;
  config: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleEvent {
  id: number;
  definitionId: number;
  date: string; // YYYY-MM-DD
  cycleNumber: number;
  status: ScheduleEventStatus;
  isHolidaySkipped: boolean;
  metadata: Record<string, any>;
  definition?: ScheduleDefinition;
  assignments?: ScheduleAssignment[];
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleAssignment {
  id: number;
  eventId: number;
  staffId: number;
  assignmentOrder: number;
  metadata: Record<string, any>;
  isCompleted: boolean;
  notes?: string;
  event?: ScheduleEvent;
  staff?: {
    id: number;
    email: string;
    userId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleSwapRequest {
  id: number;
  fromAssignmentId: number;
  requesterStaffId: number;
  targetStaffId?: number;
  reason?: string;
  status: SwapRequestStatus;
  reviewedByStaffId?: number;
  reviewedAt?: string;
  reviewNotes?: string;
  newAssignmentId?: number;
  fromAssignment?: ScheduleAssignment;
  requester?: {
    id: number;
    email: string;
  };
  targetStaff?: {
    id: number;
    email: string;
  };
  reviewedBy?: {
    id: number;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// DTOs for API requests
export interface CreateScheduleDefinitionDto {
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
  requiredPeoplePerSlot: number;
  strategy: ScheduleStrategy;
  config?: Record<string, any>;
}

export interface UpdateScheduleDefinitionDto {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
  requiredPeoplePerSlot?: number;
  strategy?: ScheduleStrategy;
  config?: Record<string, any>;
}

export interface CreateScheduleEventDto {
  definitionId: number;
  date: string; // YYYY-MM-DD
  cycleNumber?: number;
  status?: ScheduleEventStatus;
  isHolidaySkipped?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateScheduleEventDto {
  date?: string;
  cycleNumber?: number;
  status?: ScheduleEventStatus;
  isHolidaySkipped?: boolean;
  metadata?: Record<string, any>;
}

export interface CreateScheduleAssignmentDto {
  eventId: number;
  staffId: number;
  assignmentOrder?: number;
  metadata?: Record<string, any>;
  isCompleted?: boolean;
  notes?: string;
}

export interface CreateSwapRequestDto {
  fromAssignmentId: number;
  requesterStaffId: number;
  targetStaffId?: number;
  reason?: string;
}

export interface ReviewSwapRequestDto {
  status: SwapRequestStatus.APPROVED | SwapRequestStatus.REJECTED;
  reviewedByStaffId: number;
  reviewNotes?: string;
  newAssignmentId?: number;
}

// Pagination response
export interface ScheduleEventListResponse {
  data: ScheduleEvent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
