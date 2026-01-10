import { opentalkClientService } from '@/shared/services/client/opentalk-client-service';
import { useQuery } from '@tanstack/react-query';

export const useOpentalkSlide = (eventId: number | null | undefined) => {
  return useQuery({
    queryKey: ['opentalk-slide', eventId],
    queryFn: async () => {
      if (!eventId) return null;
      try {
        const response = await opentalkClientService.getSlide(eventId);
        // Handle potentially wrapped response
        const payload = response.data as any;
        return payload.data ?? payload;
      } catch (error) {
        // Return null if 404 or other error to gracefuly handle "no slide"
        return null;
      }
    },
    enabled: !!eventId,
    staleTime: 1000 * 60, // 1 minute
    retry: false,
  });
};
