import {
    ICreateOpentalkCycleDto,
    ICreateOpentalkEventDto,
    IOpentalkQueryDto,
    ISwapOpentalkDto,
    IUpdateOpentalkCycleDto,
    IUpdateOpentalkEventDto,
    OpentalkEvent,
    ScheduleCycle,
} from '@qnoffice/shared';
import { BaseServerService } from './base-server-service';

export interface OpentalkSpreadsheetData {
  events: OpentalkEvent[];
  cycles: ScheduleCycle[];
}

export class OpentalkServerService extends BaseServerService {
  private readonly baseUrl = '/opentalk';

  // Cycle operations
  async createCycle(data: ICreateOpentalkCycleDto) {
    return this.post<ScheduleCycle>(`${this.baseUrl}/cycles`, data);
  }

  async getCycles() {
    const response = await this.get<ScheduleCycle[]>(`${this.baseUrl}/cycles`);
    return response.data || [];
  }

  async getCycleById(id: number) {
    return this.get<ScheduleCycle>(`${this.baseUrl}/cycles/${id}`);
  }

  async updateCycle(id: number, data: IUpdateOpentalkCycleDto) {
    return this.put<ScheduleCycle>(`${this.baseUrl}/cycles/${id}`, data);
  }

  async deleteCycle(id: number) {
    return this.delete<void>(`${this.baseUrl}/cycles/${id}`);
  }

  // Event operations
  async createEvent(data: ICreateOpentalkEventDto) {
    return this.post<OpentalkEvent>(`${this.baseUrl}/events`, data);
  }

  async getEvents(query?: IOpentalkQueryDto) {
    const searchParams = new URLSearchParams();
    if (query?.cycleId) searchParams.set('cycleId', query.cycleId.toString());
    if (query?.status) searchParams.set('status', query.status);
    if (query?.participantId)
      searchParams.set('participantId', query.participantId.toString());

    const url = `${this.baseUrl}/events${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await this.get<OpentalkEvent[]>(url);
    return response.data || [];
  }

  async getEventsByCycle(cycleId: number) {
    const response = await this.get<OpentalkEvent[]>(
      `${this.baseUrl}/cycles/${cycleId}/events`,
    );
    return response.data || [];
  }

  async getEventById(id: number) {
    return this.get<OpentalkEvent>(`${this.baseUrl}/events/${id}`);
  }

  async updateEvent(id: number, data: IUpdateOpentalkEventDto) {
    return this.put<OpentalkEvent>(`${this.baseUrl}/events/${id}`, data);
  }

  async deleteEvent(id: number) {
    return this.delete<void>(`${this.baseUrl}/events/${id}`);
  }

  // Additional operations
  async getSpreadsheetData(): Promise<OpentalkSpreadsheetData> {
    const response = await this.get<OpentalkSpreadsheetData>(
      `${this.baseUrl}/spreadsheet`,
    );
    return response.data;
  }

  async swapEvents(event1Id: number, event2Id: number): Promise<void> {
    const data: ISwapOpentalkDto = { event1Id, event2Id };
    await this.post<void>(`${this.baseUrl}/swap`, data);
  }

  async bulkAssignEvents(data: {
    cycleId: number;
    assignments: Array<{ eventId: number; participantIds: number[] }>;
  }): Promise<void> {
    await this.post<void>(`${this.baseUrl}/bulk-assign`, data);
  }

  async getConflicts(): Promise<any[]> {
    const response = await this.get<any[]>(`${this.baseUrl}/conflicts`);
    return response.data || [];
  }

  // Legacy compatibility methods
  async getOpentalkEvents(): Promise<OpentalkEvent[]> {
    return this.getEvents();
  }
}

// Create a singleton instance
export const opentalkServerService = new OpentalkServerService();
