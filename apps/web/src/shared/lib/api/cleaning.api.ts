const BASE_URL = 'http://localhost:3000/api/cleaning';

class CleaningApi {
  private async request(
    endpoint: string,
    options: RequestInit = {},
    params?: Record<string, any>,
  ) {
    let url = `${BASE_URL}${endpoint}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
    }

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

  // Cycle Management
  async getCycles(params?: Record<string, any>) {
    return this.request('/cycles', {}, params);
  }

  async getCycleById(id: number) {
    return this.request(`/cycles/${id}`);
  }

  async createCycle(data: any) {
    return this.request('/cycles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCycle(id: number, data: any) {
    return this.request(`/cycles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCycle(id: number) {
    return this.request(`/cycles/${id}`, {
      method: 'DELETE',
    });
  }

  // Event Management
  async getEvents(params?: Record<string, any>) {
    return this.request('/events', {}, params);
  }

  async getEventsByCycle(cycleId: number) {
    return this.request(`/cycles/${cycleId}/events`);
  }

  async getEventById(id: number) {
    return this.request(`/events/${id}`);
  }

  async createEvent(data: any) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEvent(id: number, data: any) {
    return this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEvent(id: number) {
    return this.request(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Cleaning Specific Operations
  async getSpreadsheetData(params?: Record<string, any>) {
    return this.request('/spreadsheet', {}, params);
  }

  async bulkAssignParticipants(data: any) {
    return this.request('/bulk-assign', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async checkConflicts(params?: Record<string, any>) {
    return this.request('/conflicts', {}, params);
  }
}

export const cleaningApi = new CleaningApi();
