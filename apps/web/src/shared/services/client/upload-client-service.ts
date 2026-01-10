import baseApi from '@/shared/services/client/base-api';
import {
    ApiResponse,
    IGenerateMultiplePresignedUrlsDto,
    IPresignedDownloadUrlResponse,
    IPresignedUploadUrlResponse
} from '@qnoffice/shared';

class UploadClientService {
  private readonly baseUrl = '/upload';

  async getOpentalkPresignedUrls(files: IGenerateMultiplePresignedUrlsDto['files']) {
    console.log('[UploadClientService] getOpentalkPresignedUrls called with:', files);
    const response = await baseApi.post<ApiResponse<IPresignedUploadUrlResponse[]>>(
      `${this.baseUrl}/presigned-urls/opentalk`,
      { files },
    );
    console.log('[UploadClientService] getOpentalkPresignedUrls response:', response.data);
    return response;
  }

  async getOpentalkViewPresignedUrl(slideKey: string) {
    console.log('[UploadClientService] getOpentalkViewPresignedUrl called with key:', slideKey);
    const response = await baseApi.post<IPresignedDownloadUrlResponse>(
      `${this.baseUrl}/presigned-url/opentalk/view`,
      { slideKey },
    );
    console.log('[UploadClientService] getOpentalkViewPresignedUrl response:', response.data);
    return response;
  }

  // Helper to upload file to S3 directly
  async uploadFileToS3(uploadUrl: string, file: File) {
    console.log('[UploadClientService] uploadFileToS3 called');
    console.log('[UploadClientService] Upload URL:', uploadUrl);
    console.log('[UploadClientService] File:', file.name, file.type, file.size);
    
    // Note: This does NOT use baseApi because it goes to S3 (external domain)
    // We use a clean axios instance or fetch to avoid attaching API custom headers/baseUrl
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
    
    console.log('[UploadClientService] S3 upload response status:', response.status);
    
    if (!response.ok) {
        console.error('[UploadClientService] S3 upload failed:', response.statusText);
        throw new Error('Failed to upload file to S3');
    }
    
    console.log('[UploadClientService] S3 upload successful');
  }
}

export const uploadClientService = new UploadClientService();
