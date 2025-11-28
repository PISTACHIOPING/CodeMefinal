import { apiClient } from './api';
import type { Document } from '../types';

export interface UploadDocumentParams {
  file: File;
  title?: string;
  group_id?: string;
}

export const documentService = {
  async list(): Promise<Document[]> {
    return apiClient.request<Document[]>('/api/v1/documents/');
  },

  async upload({ file, title, group_id }: UploadDocumentParams): Promise<Document> {
    const form = new FormData();
    form.append('file', file);
    if (title) form.append('title', title);
    if (group_id) form.append('group_id', group_id);

    return apiClient.request<Document>('/api/v1/documents/upload', {
      method: 'POST',
      body: form,
    });
  },

  async delete(documentId: string): Promise<void> {
    return apiClient.request<void>(`/api/v1/documents/${documentId}`, { method: 'DELETE' });
  },

  async triggerIndex(documentId: string): Promise<Document> {
    return apiClient.request<Document>(`/api/v1/documents/${documentId}/index`, {
      method: 'POST',
    });
  },
};
