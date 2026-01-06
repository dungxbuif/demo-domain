import { BasePaginatedService } from '@/shared/lib/base-paginated-service';
import {
  CreateSwapRequestData,
  ScheduleQueryParams,
  ScheduleType,
} from '@qnoffice/shared';

export class ScheduleService extends BasePaginatedService<any> {
  protected baseUrl = '/api/schedules';

  async getAssignments(params: ScheduleQueryParams = {}) {
    const searchParams = new URLSearchParams();

    if (params.type) searchParams.set('type', params.type);
    if (params.status) searchParams.set('status', params.status);
    if (params.cycleId) searchParams.set('cycleId', params.cycleId);
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);
    if (params.staffId) searchParams.set('staffId', params.staffId);

    const url = `${this.baseUrl}/assignments${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching assignments:', error);
      return null;
    }
  }

  async getMyAssignments(params: ScheduleQueryParams = {}) {
    const searchParams = new URLSearchParams();

    if (params.type) searchParams.set('type', params.type);
    if (params.status) searchParams.set('status', params.status);
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);

    const url = `${this.baseUrl}/my-assignments${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching my assignments:', error);
      return null;
    }
  }

  async getCycles(type?: ScheduleType) {
    const url = `${this.baseUrl}/cycles${type ? `?type=${type}` : ''}`;

    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching cycles:', error);
      return null;
    }
  }

  async createSwapRequest(data: CreateSwapRequestData) {
    try {
      const response = await fetch(`${this.baseUrl}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error creating swap request:', error);
      throw error;
    }
  }

  async getSwapRequests(status?: string) {
    const url = `${this.baseUrl}/requests${status ? `?status=${status}` : ''}`;

    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching swap requests:', error);
      return null;
    }
  }

  async reviewSwapRequest(
    requestId: number,
    decision: 'APPROVED' | 'REJECTED',
    reviewNotes?: string,
  ) {
    try {
      const response = await fetch(
        `${this.baseUrl}/requests/${requestId}/review`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision, reviewNotes }),
        },
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error reviewing swap request:', error);
      throw error;
    }
  }

  async manualSwap(assignment1Id: number, assignment2Id: number) {
    try {
      const response = await fetch(`${this.baseUrl}/manual-swap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignment1Id, assignment2Id }),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error performing manual swap:', error);
      throw error;
    }
  }
}

export const scheduleService = new ScheduleService();
