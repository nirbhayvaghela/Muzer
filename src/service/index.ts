/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "@/utils/api/apiClient";

export const createStream = async (body: {
  creatorId: string;
  url: string;
}) => {
  const response = await apiClient.post("/streams", body);
  return response;
};

export const deleteStream = async (streamId: string) => {
  const response = await apiClient.delete("/streams", {
    params: {
      streamId,
    },
  });
  return response;
};

export const upvoteStream = async (body: { streamId: string }) => {
  const response = await apiClient.post("/streams/upvote", body);
  return response;
};

export const getCurrentStream = async (userId: string) => {
  let response;
  try {
    response = await apiClient.get(`/streams/current-stream/${userId}`);
  } catch (error: any) {
    response = error.response;
    // errorHandler(response.data.statusCode);
  }
  return response;
};

export const getCurrentQueue = async (userId: string) => {
  let response;
  try {
    response = await apiClient.get(`/queue/${userId}`);
  } catch (error: any) {
    response = error.response;
    // errorHandler(response.data.statusCode);
  }
  return response;
};
