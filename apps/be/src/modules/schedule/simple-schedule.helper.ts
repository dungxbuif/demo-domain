// COMMENTED OUT - Complex scheduling algorithm
// Will be implemented later when needed

/*
import { ScheduleType } from '../schedule-assignment.entity';

export interface ScheduleSlot {
  date: Date;
  participants: number[];
  type: ScheduleType;
  externalId?: string;
}

export interface CycleGenerationInput {
  type: ScheduleType;
  activeStaffIds: number[];
  startDate: Date;
  endDate: Date;
  participantsPerSlot: number;
  minGapDays: number;
  holidayDates: Date[];
  previousCycleLastAssignments?: Map<number, Date>; // staffId -> last assignment date
}

export interface CycleGenerationResult {
  cycleId: string;
  slots: ScheduleSlot[];
  metadata: {
    totalSlots: number;
    staffParticipation: Map<number, number>; // staffId -> number of assignments
    averageGapDays: number;
  };
}

export class SchedulingService {
  // Complex scheduling algorithm implementation
  // Will be added later when automatic scheduling is needed
  
  static generateCycle(input: CycleGenerationInput): CycleGenerationResult {
    // TODO: Implement automatic scheduling algorithm
    throw new Error('Automatic scheduling not implemented yet - use manual scheduling');
  }

  static shiftSchedule(
    existingSlots: ScheduleSlot[],
    affectedDate: Date,
    holidayDates: Date[] = [],
    removedStaffIds: number[] = []
  ): ScheduleSlot[] {
    // TODO: Implement schedule shifting
    throw new Error('Schedule shifting not implemented yet');
  }
}
*/

// Simple helper functions for manual scheduling
export class SimpleScheduleHelper {
  static validateEventDate(
    eventDate: Date,
    startDate: Date,
    endDate: Date,
  ): boolean {
    return eventDate >= startDate && eventDate <= endDate;
  }

  static isWeekday(date: Date): boolean {
    const day = date.getDay();
    return day !== 0 && day !== 6; // Not Sunday (0) or Saturday (6)
  }

  static formatEventTitle(type: string, date: Date): string {
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return `${type} - ${dateStr}`;
  }
}
