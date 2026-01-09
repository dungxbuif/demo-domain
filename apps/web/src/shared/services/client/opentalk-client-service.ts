import baseApi from '@/shared/services/client/base-api';
import { ApiResponse } from '@qnoffice/shared';

export interface OpentalkEvent {
  id: number;
  title: string;
  description?: string;
  eventDate: string;
  status: string;
  type: string;
  cycleId: number;
  notes?: string;
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
}

export interface OpentalkSlide {
  id: number;
  slideUrl: string;
  eventId: number;
  presentedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUpdateEventDto {
  title?: string;
  description?: string;
  eventDate?: string;
  status?: string;
  notes?: string;
}

class OpentalkClientService {
  private readonly baseUrl = '/opentalk';

  async updateEvent(eventId: number, data: IUpdateEventDto) {
    return baseApi.put<ApiResponse<OpentalkEvent>>(
      `${this.baseUrl}/events/${eventId}`,
      data,
    );
  }

  async updateSlide(
    eventId: number,
    data: { slideUrl?: string; presentedAt?: string },
  ) {
    return baseApi.put<ApiResponse<OpentalkSlide>>(
      `${this.baseUrl}/events/${eventId}/slide`,
      data,
    );
  }

  async getUserSchedules(staffId: number): Promise<OpentalkEvent[]> {
    const response = await baseApi.get<ApiResponse<OpentalkEvent[]>>(
      `${this.baseUrl}/events?participantId=${staffId}`,
    );
    return response.data.data || [];
  }
}

export const opentalkClientService = new OpentalkClientService();
