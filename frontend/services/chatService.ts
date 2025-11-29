import { apiClient } from './api';

export interface RagChatRequest {
  question: string;
  group_id?: string | null;
  top_k?: number;
}

export interface RagChatSource {
  id: string;
  title?: string | null;
  original_file_name?: string | null;
  chunk_id?: number | null;
  score: number;
}

export interface RagChatResponse {
  question: string;
  answer: string;
  sources: RagChatSource[];
}

export const chatService = {
  async chatWithRag(payload: RagChatRequest): Promise<RagChatResponse> {
    return apiClient.request<RagChatResponse>('/api/v1/chat/rag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
};
