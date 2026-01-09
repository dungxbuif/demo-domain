import {
  CreateCycleDto,
  EventStatus,
  ScheduleCycle,
  ScheduleEvent,
  ScheduleType,
} from '@qnoffice/shared';
import baseApi from './base-api';

class ScheduleClientService {
  private readonly baseUrl = '/api/schedules';

  async createCycle(data: CreateCycleDto) {
    return baseApi.post<ScheduleCycle>(`${this.baseUrl}/cycles`, data);
  }

  async getAssignments(query: { type?: ScheduleType; status?: EventStatus }) {
    const response = await baseApi.get<ScheduleEvent[]>(`${this.baseUrl}/events`, {
      params: query,
    });

    const events = response.data;

    return events.map((event: ScheduleEvent) => ({
      id: event.id,
      type: event.type,
      cycleId: event.cycleId.toString(),
      assignedDate: event.eventDate,
      status: event.status,
      staff: event.eventParticipants?.[0]?.staff || {
        id: 0,
        email: '',
        user: { name: 'Unassigned' },
        branch: { name: 'N/A' },
      },
      isSwapped: false, // Backend doesn't support this yet, defaulting to false
    }));
  }

  async manualSwap(event1Id: number, event2Id: number) {
    return baseApi.post(`${this.baseUrl}/events/${event1Id}/swap/${event2Id}`);
  }
}

export const scheduleClientService = new ScheduleClientService();

