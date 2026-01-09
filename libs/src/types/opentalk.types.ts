import {
  CycleStatus,
  EventStatus,
  ScheduleType,
  SwapRequestStatus,
} from '../enums';
import { SearchParams } from './pagination.types';
import { ScheduleEvent, ScheduleEventParticipant } from './schedule.types';
import { Staff } from './staff.types';

export interface OpentalkSlideSubmission {
  id: number;
  eventId: number;
  slidesUrl: string;
  topic?: string;
  submittedBy: number;
  notes?: string;
  event?: ScheduleEvent;
  submitter?: Staff;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface SwapRequest {
  id: number;
  fromEventId: number;
  toEventId: number;
  requesterId: number;
  reason: string;
  status: SwapRequestStatus;
  reviewNote?: string;
  fromEvent?: ScheduleEvent;
  toEvent?: ScheduleEvent;
  requester?: Staff;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface OpentalkEvent extends ScheduleEvent {
  type: ScheduleType.OPENTALK;
  eventParticipants?: ScheduleEventParticipant[];
  participants?: Staff[];
}

export interface ICreateOpentalkCycleDto {
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  description?: string;
  status?: CycleStatus;
}

export interface IUpdateOpentalkCycleDto {
  name?: string;
  description?: string;
  status?: CycleStatus;
}

export interface ICreateOpentalkEventDto {
  title: string;
  type?: ScheduleType;
  cycleId: number;
  eventDate: string;
  status?: EventStatus;
  notes?: string;
  participantIds?: number[];
}

export interface IUpdateOpentalkEventDto {
  title?: string;
  eventDate?: string;
  status?: EventStatus;
  notes?: string;
  participantIds?: number[];
}

export interface ISwapOpentalkDto {
  event1Id: number;
  event2Id: number;
}

export interface ICreateSlideSubmissionDto {
  eventId: number;
  slidesUrl: string;
  topic?: string;
  submittedBy: number;
  notes?: string;
}

export interface IUpdateSlideSubmissionDto {
  slidesUrl?: string;
  topic?: string;
  notes?: string;
}

export interface ICreateSwapRequestDto {
  scheduleId: number;
  targetStaffId?: number;
  reason: string;
}

export interface ICreateOpentalkScheduleDto {
  date: string;
  staffId: number;
}

export interface ISubmitSlideDto {
  eventId: number;
  slidesUrl: string;
  topic?: string;
  notes?: string;
}

export interface IOpentalkQueryDto extends SearchParams {
  type?: string;
  status?: EventStatus;
  cycleId?: number;
  startDate?: string;
  endDate?: string;
  participantId?: number;
}

export interface IReviewSwapRequestDto {
  status: string;
  reviewNote?: string;
}
