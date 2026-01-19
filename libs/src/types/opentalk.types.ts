import {
  CycleStatus,
  EventStatus,
  OpentalkSlideStatus,
  OpentalkSlideType,
  ScheduleType,
} from '../enums';
import { SearchParams } from './pagination.types';

export interface ISubmitSlideDto {
  eventId: number;
  slidesUrl: string;
  type?: OpentalkSlideType;
  fileType?: string;
  fileName?: string;
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

export interface ICreateOpentalkScheduleDto {
  date: string;
  staffId: number;
}

export interface IOpentalkQueryDto extends SearchParams {
  type?: string;
  status?: EventStatus;
  cycleId?: number;
  startDate?: string;
  endDate?: string;
  participantId?: number;
}

export interface IOpentalkSlide {
  id: number;
  eventId: number;
  topic?: string;
  slideUrl?: string;
  slideKey?: string;
  type: OpentalkSlideType;
  status: OpentalkSlideStatus;
  rejectionReason?: string;
  approvedBy?: number;
  approvedAt?: Date;
  rejectedBy?: number;
  rejectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  mimeType?: string;
}

/**
 * @deprecated Use IOpentalkSlide instead. Metadata-based storage is being phased out.
 */
export interface IOpentalkEventMetadata {
  slideKey?: string;
  url?: string;
  type?: OpentalkSlideType;
  fileType?: string; // MIME type
  fileName?: string;
  status: OpentalkSlideStatus;
}
