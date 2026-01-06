export interface OpentalkCycle {
  id: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: any;
  updatedBy?: any;
}

export interface OpentalkEvent {
  id: number;
  title: string;
  description?: string;
  eventDate: string;
  status: string;
  type: string;
  cycleId: number;
  cycle?: OpentalkCycle;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: any;
  updatedBy?: any;
  eventParticipants?: Array<{
    staffId: number;
    staff: {
      id: number;
      email: string;
      user?: {
        email: string;
        name: string;
      };
    };
  }>;
  // Virtual property for easier access
  participants?: Array<{
    id: number;
    email: string;
    user?: {
      email: string;
      name: string;
    };
  }>;
}

export interface CreateOpentalkCycleDto {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  type?: string;
}

export interface CreateOpentalkEventDto {
  title: string;
  description?: string;
  eventDate: string;
  status?: string;
  type?: string;
  cycleId: number;
  notes?: string;
  participantIds?: number[]; // For assignment operations
}

export interface OpentalkSpreadsheetData {
  events: OpentalkEvent[];
  cycles: OpentalkCycle[];
}

export class OpentalkServerService {
  private readonly baseUrl = 'http://localhost:3000/api/opentalk';

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    // Handle API response wrapper
    if (result.statusCode === 200 && result.data !== undefined) {
      return result.data;
    }
    return result;
  }

  // Cycle operations
  async createCycle(data: CreateOpentalkCycleDto): Promise<OpentalkCycle> {
    return this.request('/cycles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCycles(): Promise<OpentalkCycle[]> {
    return this.request('/cycles');
  }

  async getCycleById(id: number): Promise<OpentalkCycle> {
    return this.request(`/cycles/${id}`);
  }

  async updateCycle(
    id: number,
    data: Partial<CreateOpentalkCycleDto>,
  ): Promise<OpentalkCycle> {
    return this.request(`/cycles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCycle(id: number): Promise<void> {
    return this.request(`/cycles/${id}`, {
      method: 'DELETE',
    });
  }

  // Event operations
  async createEvent(data: CreateOpentalkEventDto): Promise<OpentalkEvent> {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getEvents(): Promise<OpentalkEvent[]> {
    return this.request('/events');
  }

  async getEventsByCycle(cycleId: number): Promise<OpentalkEvent[]> {
    return this.request(`/cycles/${cycleId}/events`);
  }

  async getEventById(id: number): Promise<OpentalkEvent> {
    return this.request(`/events/${id}`);
  }

  async updateEvent(
    id: number,
    data: Partial<CreateOpentalkEventDto>,
  ): Promise<OpentalkEvent> {
    return this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEvent(id: number): Promise<void> {
    return this.request(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Additional operations
  async getSpreadsheetData(): Promise<OpentalkSpreadsheetData> {
    return this.request('/spreadsheet');
  }

  async swapEvents(eventId1: number, eventId2: number): Promise<void> {
    return this.request('/swap', {
      method: 'POST',
      body: JSON.stringify({ eventId1, eventId2 }),
    });
  }

  async bulkAssignEvents(data: {
    eventIds: number[];
    participantIds: number[];
  }): Promise<void> {
    return this.request('/bulk-assign', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getConflicts(): Promise<any[]> {
    return this.request('/conflicts');
  }

  // Legacy compatibility methods (for backward compatibility if needed)
  async getOpentalkEvents(): Promise<OpentalkEvent[]> {
    return this.getEvents();
  }

  async getAllCycles(type?: 'OPENTALK'): Promise<OpentalkCycle[]> {
    return this.getCycles();
  }
}

// Create a singleton instance
export const opentalkServerService = new OpentalkServerService();
