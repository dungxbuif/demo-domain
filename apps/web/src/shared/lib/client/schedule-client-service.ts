export interface ScheduleCycle {
  id: number;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  description?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleEvent {
  id: number;
  title: string;
  type: string;
  cycleId: number;
  eventDate: string;
  participantIds: number[];
  description?: string;
  location?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  cycle?: ScheduleCycle;
  participants?: any[];
}

export interface ScheduleQueryParams {
  type?: string;
  status?: string;
  cycleId?: number;
  startDate?: string;
  endDate?: string;
}

export interface CreateCycleData {
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface CreateEventData {
  title: string;
  type: string;
  cycleId: number;
  eventDate: string;
  participantIds: number[];
  description?: string;
  location?: string;
}

export class ScheduleClientService {
  private readonly baseUrl = '/api/schedules';

  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Cycle endpoints
  async getAllCycles(type?: string): Promise<ScheduleCycle[]> {
    try {
      const url = type
        ? `${this.baseUrl}/cycles?type=${type}`
        : `${this.baseUrl}/cycles`;
      return await this.request<ScheduleCycle[]>(url);
    } catch (error) {
      console.error('Failed to fetch cycles:', error);
      throw error;
    }
  }

  async getCycleById(id: number): Promise<ScheduleCycle | null> {
    try {
      return await this.request<ScheduleCycle>(`${this.baseUrl}/cycles/${id}`);
    } catch (error) {
      console.error('Failed to fetch cycle:', error);
      throw error;
    }
  }

  async createCycle(data: CreateCycleData): Promise<ScheduleCycle> {
    try {
      return await this.request<ScheduleCycle>(`${this.baseUrl}/cycles`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to create cycle:', error);
      throw error;
    }
  }

  // Event endpoints
  async getAllEvents(
    params: ScheduleQueryParams = {},
  ): Promise<ScheduleEvent[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params.type) searchParams.set('type', params.type);
      if (params.status) searchParams.set('status', params.status);
      if (params.cycleId)
        searchParams.set('cycleId', params.cycleId.toString());
      if (params.startDate) searchParams.set('startDate', params.startDate);
      if (params.endDate) searchParams.set('endDate', params.endDate);

      const query = searchParams.toString();
      const url = query
        ? `${this.baseUrl}/events?${query}`
        : `${this.baseUrl}/events`;

      return await this.request<ScheduleEvent[]>(url);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      throw error;
    }
  }

  async getEventsByCycle(cycleId: number): Promise<ScheduleEvent[]> {
    try {
      return await this.request<ScheduleEvent[]>(
        `${this.baseUrl}/cycles/${cycleId}/events`,
      );
    } catch (error) {
      console.error('Failed to fetch events by cycle:', error);
      throw error;
    }
  }

  async getEventById(id: number): Promise<ScheduleEvent | null> {
    try {
      return await this.request<ScheduleEvent>(`${this.baseUrl}/events/${id}`);
    } catch (error) {
      console.error('Failed to fetch event:', error);
      throw error;
    }
  }

  async createEvent(data: CreateEventData): Promise<ScheduleEvent> {
    try {
      return await this.request<ScheduleEvent>(`${this.baseUrl}/events`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to create event:', error);
      throw error;
    }
  }

  async updateEvent(
    id: number,
    data: Partial<CreateEventData>,
  ): Promise<ScheduleEvent> {
    try {
      return await this.request<ScheduleEvent>(`${this.baseUrl}/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to update event:', error);
      throw error;
    }
  }

  async deleteEvent(id: number): Promise<void> {
    try {
      await this.request(`${this.baseUrl}/events/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete event:', error);
      throw error;
    }
  }

  async swapEventParticipants(
    event1Id: number,
    event2Id: number,
  ): Promise<void> {
    try {
      await this.request(
        `${this.baseUrl}/events/${event1Id}/swap/${event2Id}`,
        {
          method: 'POST',
        },
      );
    } catch (error) {
      console.error('Failed to swap event participants:', error);
      throw error;
    }
  }

  // Helper methods for opentalk compatibility
  async getOpentalkEvents(
    params: ScheduleQueryParams = {},
  ): Promise<ScheduleEvent[]> {
    return this.getAllEvents({ ...params, type: 'OPENTALK' });
  }

  async getCleaningEvents(
    params: ScheduleQueryParams = {},
  ): Promise<ScheduleEvent[]> {
    return this.getAllEvents({ ...params, type: 'CLEANING' });
  }
}

export const scheduleClientService = new ScheduleClientService();
