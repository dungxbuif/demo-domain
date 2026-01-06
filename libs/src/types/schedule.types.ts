// Schedule Types
export enum ScheduleType {
  OPENTALK = 'OPENTALK',
  CLEANING = 'CLEANING',
}

export enum ScheduleStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum CycleStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export enum SwapRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum RequestType {
  SWAP = 'SWAP',
  EXCUSE = 'EXCUSE',
}

// Schedule Interfaces
export interface ScheduleAssignment {
  id: number;
  type: ScheduleType;
  cycleId: string;
  assignedDate: Date;
  staffId: number;
  status: ScheduleStatus;
  externalId?: string;
  notes?: string;
  isSwapped: boolean;
  originalStaffId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleCycle {
  id: number;
  type: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: CycleStatus;
  settings: {
    participantsPerSlot: number;
    minGapDays: number;
    excludeHolidays: boolean;
    customRules?: Record<string, any>;
  };
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SwapRequest {
  id: number;
  type: RequestType;
  requesterId: number;
  assignmentId: number;
  targetStaffId?: number;
  targetAssignmentId?: number;
  reason: string;
  status: SwapRequestStatus;
  reviewedById?: number;
  reviewNotes?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// API DTOs
export interface CreateCycleData {
  type: ScheduleType;
  name: string;
  startDate: string;
  endDate: string;
  participantsPerSlot: number;
  minGapDays?: number;
  description?: string;
  includedStaffIds?: number[];
}

export interface CreateSwapRequestData {
  type: RequestType;
  assignmentId: number;
  targetStaffId?: number;
  targetAssignmentId?: number;
  reason: string;
}

export interface ManualSwapData {
  assignment1Id: number;
  assignment2Id: number;
  additionalAffectedAssignments?: number[];
}

export interface ScheduleQueryParams {
  type?: ScheduleType;
  status?: ScheduleStatus;
  cycleId?: string;
  startDate?: string;
  endDate?: string;
  staffId?: string;
}
