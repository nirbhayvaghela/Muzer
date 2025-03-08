import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStream,
  upvoteStream,
  getCurrentStream,
  getCurrentQueue,
  deleteStream,
} from "@/service/index";

// Hook for creating a stream
export const useCreateStream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["createStream"],
    mutationFn: (body: { creatorId: string; url: string }) => createStream(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentQueue"] });
    },
  });
};

// Hook for upvoting a stream
export const useUpvoteStream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["upvoteStream"],
    mutationFn: (body: { streamId: string }) => upvoteStream(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentQueue"] });
    },
  });
};

// Hook for fetching the current stream
export const useGetCurrentStream = () => {
  return useQuery({
    queryKey: ["currentStream"],
    queryFn: () => getCurrentStream(),
  });
};

// Hook for fetching the current queue
export const useGetCurrentQueue = () => {
  return useQuery({
    queryKey: ["currentQueue"],
    queryFn: () => getCurrentQueue(),
  });
};


// Hook for deleting the specific stream
export const useGetDeleteStream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["deleteStream"],
    mutationFn: (streamId: string) => deleteStream(streamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentQueue"] }); 
      queryClient.invalidateQueries({ queryKey: ["currentStream"] }); 
    }
  });
};  