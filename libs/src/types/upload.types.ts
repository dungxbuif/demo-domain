export interface IPresignedUploadUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

export interface IPresignedDownloadUrlResponse {
  downloadUrl: string;
  expiresIn: number;
}

export interface IGeneratePresignedUrlDto {
  fileName: string;
  contentType: string;
}

export interface IGenerateMultiplePresignedUrlsDto {
  files: Array<{
    fileName: string;
    contentType: string;
  }>;
}
