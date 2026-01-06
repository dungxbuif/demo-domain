/**
 * Schedule API Client
 * API functions for the generic schedule system
 */

import {
  CreateScheduleAssignmentDto,
  CreateScheduleDefinitionDto,
  CreateScheduleEventDto,
  CreateSwapRequestDto,
  ReviewSwapRequestDto,
  ScheduleAssignment,
  ScheduleDefinition,
  ScheduleEvent,
  ScheduleEventListResponse,
  ScheduleSwapRequest,
  UpdateScheduleDefinitionDto,
  UpdateScheduleEventDto,
} from '@/shared/types/schedule.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Schedule Definitions
export const scheduleDefinitionApi = {
  getAll: async (params?: {
    isActive?: boolean;
    code?: string;
  }): Promise<ScheduleDefinition[]> => {
    const query = new URLSearchParams();
    if (params?.isActive !== undefined)
      query.append('isActive', String(params.isActive));
    if (params?.code) query.append('code', params.code);

    const response = await fetch(`${API_BASE}/schedule-definitions?${query}`);
    if (!response.ok) throw new Error('Failed to fetch schedule definitions');
    return response.json();
  },

  getById: async (id: number): Promise<ScheduleDefinition> => {
    const response = await fetch(`${API_BASE}/schedule-definitions/${id}`);
    if (!response.ok) throw new Error('Failed to fetch schedule definition');
    return response.json();
  },

  getByCode: async (code: string): Promise<ScheduleDefinition> => {
    const response = await fetch(
      `${API_BASE}/schedule-definitions/code/${code}`,
    );
    if (!response.ok) throw new Error('Failed to fetch schedule definition');
    return response.json();
  },

  create: async (
    data: CreateScheduleDefinitionDto,
  ): Promise<ScheduleDefinition> => {
    const response = await fetch(`${API_BASE}/schedule-definitions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create schedule definition');
    return response.json();
  },

  update: async (
    id: number,
    data: UpdateScheduleDefinitionDto,
  ): Promise<ScheduleDefinition> => {
    const response = await fetch(`${API_BASE}/schedule-definitions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update schedule definition');
    return response.json();
  },

  toggleActive: async (id: number): Promise<ScheduleDefinition> => {
    const response = await fetch(
      `${API_BASE}/schedule-definitions/${id}/toggle-active`,
      {
        method: 'PATCH',
      },
    );
    if (!response.ok) throw new Error('Failed to toggle schedule definition');
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/schedule-definitions/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete schedule definition');
  },
};

// Schedule Events
export const scheduleEventApi = {
  getAll: async (params?: {
    definitionId?: number;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    cycleNumber?: number;
    staffId?: number;
    page?: number;
    limit?: number;
  }): Promise<ScheduleEventListResponse> => {
    const query = new URLSearchParams();
    if (params?.definitionId)
      query.append('definitionId', String(params.definitionId));
    if (params?.dateFrom) query.append('dateFrom', params.dateFrom);
    if (params?.dateTo) query.append('dateTo', params.dateTo);
    if (params?.status) query.append('status', params.status);
    if (params?.cycleNumber)
      query.append('cycleNumber', String(params.cycleNumber));
    if (params?.staffId) query.append('staffId', String(params.staffId));
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const response = await fetch(`${API_BASE}/schedule-events?${query}`);
    if (!response.ok) throw new Error('Failed to fetch schedule events');
    return response.json();
  },

  getById: async (id: number): Promise<ScheduleEvent> => {
    const response = await fetch(`${API_BASE}/schedule-events/${id}`);
    if (!response.ok) throw new Error('Failed to fetch schedule event');
    return response.json();
  },

  getByDefinitionCode: async (
    code: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<ScheduleEventListResponse> => {
    const query = new URLSearchParams();
    if (dateFrom) query.append('dateFrom', dateFrom);
    if (dateTo) query.append('dateTo', dateTo);

    const response = await fetch(
      `${API_BASE}/schedule-events/definition/${code}?${query}`,
    );
    if (!response.ok) throw new Error('Failed to fetch schedule events');
    return response.json();
  },

  getUpcomingForStaff: async (
    staffId: number,
    limit: number = 10,
  ): Promise<ScheduleEventListResponse> => {
    const response = await fetch(
      `${API_BASE}/schedule-events/staff/${staffId}/upcoming?limit=${limit}`,
    );
    if (!response.ok) throw new Error('Failed to fetch upcoming events');
    return response.json();
  },

  create: async (data: CreateScheduleEventDto): Promise<ScheduleEvent> => {
    const response = await fetch(`${API_BASE}/schedule-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create schedule event');
    return response.json();
  },

  update: async (
    id: number,
    data: UpdateScheduleEventDto,
  ): Promise<ScheduleEvent> => {
    const response = await fetch(`${API_BASE}/schedule-events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update schedule event');
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/schedule-events/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete schedule event');
  },
};

// Schedule Assignments
export const scheduleAssignmentApi = {
  getByEvent: async (eventId: number): Promise<ScheduleAssignment[]> => {
    const response = await fetch(
      `${API_BASE}/schedule-assignments/event/${eventId}`,
    );
    if (!response.ok) throw new Error('Failed to fetch assignments');
    return response.json();
  },

  getByStaff: async (
    staffId: number,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<ScheduleAssignment[]> => {
    const query = new URLSearchParams();
    if (dateFrom) query.append('dateFrom', dateFrom);
    if (dateTo) query.append('dateTo', dateTo);

    const response = await fetch(
      `${API_BASE}/schedule-assignments/staff/${staffId}?${query}`,
    );
    if (!response.ok) throw new Error('Failed to fetch assignments');
    return response.json();
  },

  getById: async (id: number): Promise<ScheduleAssignment> => {
    const response = await fetch(`${API_BASE}/schedule-assignments/${id}`);
    if (!response.ok) throw new Error('Failed to fetch assignment');
    return response.json();
  },

  create: async (
    data: CreateScheduleAssignmentDto,
  ): Promise<ScheduleAssignment> => {
    const response = await fetch(`${API_BASE}/schedule-assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create assignment');
    return response.json();
  },

  createBulk: async (
    eventId: number,
    staffIds: number[],
  ): Promise<ScheduleAssignment[]> => {
    const response = await fetch(`${API_BASE}/schedule-assignments/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, staffIds }),
    });
    if (!response.ok) throw new Error('Failed to create bulk assignments');
    return response.json();
  },

  updateMetadata: async (
    id: number,
    metadata: Record<string, any>,
  ): Promise<ScheduleAssignment> => {
    const response = await fetch(
      `${API_BASE}/schedule-assignments/${id}/metadata`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata),
      },
    );
    if (!response.ok) throw new Error('Failed to update assignment metadata');
    return response.json();
  },

  markCompleted: async (id: number): Promise<ScheduleAssignment> => {
    const response = await fetch(
      `${API_BASE}/schedule-assignments/${id}/complete`,
      {
        method: 'PATCH',
      },
    );
    if (!response.ok) throw new Error('Failed to mark assignment as completed');
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/schedule-assignments/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete assignment');
  },
};

// Schedule Swap Requests
export const scheduleSwapApi = {
  getAll: async (params?: {
    status?: string;
    requesterStaffId?: number;
    definitionId?: number;
  }): Promise<ScheduleSwapRequest[]> => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.requesterStaffId)
      query.append('requesterStaffId', String(params.requesterStaffId));
    if (params?.definitionId)
      query.append('definitionId', String(params.definitionId));

    const response = await fetch(`${API_BASE}/schedule-swaps?${query}`);
    if (!response.ok) throw new Error('Failed to fetch swap requests');
    return response.json();
  },

  getById: async (id: number): Promise<ScheduleSwapRequest> => {
    const response = await fetch(`${API_BASE}/schedule-swaps/${id}`);
    if (!response.ok) throw new Error('Failed to fetch swap request');
    return response.json();
  },

  getPendingByDefinition: async (
    definitionId: number,
  ): Promise<ScheduleSwapRequest[]> => {
    const response = await fetch(
      `${API_BASE}/schedule-swaps/definition/${definitionId}/pending`,
    );
    if (!response.ok) throw new Error('Failed to fetch pending swap requests');
    return response.json();
  },

  getStaffHistory: async (staffId: number): Promise<ScheduleSwapRequest[]> => {
    const response = await fetch(
      `${API_BASE}/schedule-swaps/staff/${staffId}/history`,
    );
    if (!response.ok) throw new Error('Failed to fetch swap history');
    return response.json();
  },

  create: async (data: CreateSwapRequestDto): Promise<ScheduleSwapRequest> => {
    const response = await fetch(`${API_BASE}/schedule-swaps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create swap request');
    return response.json();
  },

  review: async (
    id: number,
    data: ReviewSwapRequestDto,
  ): Promise<ScheduleSwapRequest> => {
    const response = await fetch(`${API_BASE}/schedule-swaps/${id}/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to review swap request');
    return response.json();
  },

  cancel: async (id: number, staffId: number): Promise<ScheduleSwapRequest> => {
    const response = await fetch(`${API_BASE}/schedule-swaps/${id}/cancel`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffId }),
    });
    if (!response.ok) throw new Error('Failed to cancel swap request');
    return response.json();
  },
};
