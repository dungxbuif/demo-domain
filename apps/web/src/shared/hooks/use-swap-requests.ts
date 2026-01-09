import { swapRequestClientService } from '@/shared/services/client/swap-request-client-service';
import {
  ICreateSwapRequestDto,
  IReviewSwapRequestDto,
  ISwapRequestQueryDto,
  SwapRequest,
} from '@qnoffice/shared';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';

const SWAP_REQUESTS_KEY = 'swap-requests';

export const useSwapRequests = (
  params?: ISwapRequestQueryDto,
  options?: Omit<UseQueryOptions<SwapRequest[], Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<SwapRequest[], Error>({
    queryKey: [SWAP_REQUESTS_KEY, params],
    queryFn: async () => {
      const response = await swapRequestClientService.getSwapRequests(params);
      return response.data.data || [];
    },
    ...options,
  });
};

export const useSwapRequestById = (
  id: number,
  options?: Omit<UseQueryOptions<SwapRequest, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<SwapRequest, Error>({
    queryKey: [SWAP_REQUESTS_KEY, id],
    queryFn: async () => {
      const response = await swapRequestClientService.getSwapRequestById(id);
      return response.data.data;
    },
    enabled: !!id,
    ...options,
  });
};

export const useCreateSwapRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ICreateSwapRequestDto) => {
      const response = await swapRequestClientService.createSwapRequest(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SWAP_REQUESTS_KEY] });
      toast.success('Swap request created successfully');
    },
    onError: (error: Error) => {
      console.error('Error creating swap request:', error);
      toast.error('Failed to create swap request');
    },
  });
};

export const useReviewSwapRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: IReviewSwapRequestDto;
    }) => {
      const response = await swapRequestClientService.reviewSwapRequest(
        id,
        data,
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [SWAP_REQUESTS_KEY] });
      queryClient.invalidateQueries({
        queryKey: [SWAP_REQUESTS_KEY, variables.id],
      });
      toast.success(
        `Request ${variables.data.status.toLowerCase()} successfully`,
      );
    },
    onError: (error: Error) => {
      console.error('Error reviewing swap request:', error);
      toast.error('Failed to review swap request');
    },
  });
};

export const useDeleteSwapRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await swapRequestClientService.deleteSwapRequest(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SWAP_REQUESTS_KEY] });
      toast.success('Swap request deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Error deleting swap request:', error);
      toast.error('Failed to delete swap request');
    },
  });
};
