import { FilePreviewDialog } from './file-preview-dialog';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { opentalkClientService } from '@/shared/services/client/opentalk-client-service';
import { uploadClientService } from '@/shared/services/client/upload-client-service';
import {
  IOpentalkSlide,
  OpentalkSlideStatus,
  OpentalkSlideType,
  ScheduleEvent
} from '@qnoffice/shared';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { ExternalLink, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface SlideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: ScheduleEvent;
  mode: 'view' | 'edit';
  canEdit?: boolean;
  canApprove?: boolean; // New prop for approval permission
  onSuccess?: () => void;
}

export function SlideDialog({
  open,
  onOpenChange,
  event,
  mode,
  canEdit = false,
  canApprove = false,
  onSuccess,
}: SlideDialogProps) {
  const [slide, setSlide] = useState<IOpentalkSlide | null>(null);
  const [isLoadingSlide, setIsLoadingSlide] = useState(false);

  // Determine if there is existing content and its type
  const hasExistingSlide = !!(slide?.slideUrl || slide?.slideKey);
  // Fallback: if type is missing but slideKey exists, assume FILE.
  const existingType =
    slide?.type ||
    (slide?.slideKey && !slide?.slideUrl?.startsWith('http')
      ? OpentalkSlideType.FILE
      : OpentalkSlideType.LINK);

  const isViewMode = mode === 'view' || (mode === 'edit' && !canEdit);

  const [slidesUrl, setSlidesUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Fetch slide data when dialog opens
  useEffect(() => {
    if (open && event?.id) {
      setIsLoadingSlide(true);
      opentalkClientService
        .getSlide(event.id)
        .then((response) => {
          setSlide(response.data.data || null);
        })
        .catch((error) => {
          console.error('Failed to fetch slide:', error);
          setSlide(null);
        })
        .finally(() => {
          setIsLoadingSlide(false);
        });
    }
  }, [open, event?.id]);

  useEffect(() => {
    if (open) {
      if (mode === 'edit') {
        setSlidesUrl('');
        setSelectedFile(null);
        setUploadMethod('url');
      }
      // If we have a FILE type slide, fetch the download URL
      if (hasExistingSlide && existingType === OpentalkSlideType.FILE) {
        fetchPresignedUrl();
      }
    }
  }, [open, mode, event, hasExistingSlide, existingType]);

  const fetchPresignedUrl = async () => {
    // Prefer slideKey for backward compatibility, or url if type is FILE
    const key = slide?.slideKey || slide?.slideUrl;
    console.log('[fetchPresignedUrl] Starting fetch with key:', key);
    console.log('[fetchPresignedUrl] Slide:', slide);
    if (!key) {
      console.warn('[fetchPresignedUrl] No key found, aborting');
      return;
    }

    try {
      console.log('[fetchPresignedUrl] Calling uploadClientService.getOpentalkViewPresignedUrl');
      const response = await uploadClientService.getOpentalkViewPresignedUrl(key);
      console.log('[fetchPresignedUrl] Response:', response);
      console.log('[fetchPresignedUrl] Response.data:', response.data);
      
      // The backend wraps responses in {statusCode, data}, so we need response.data.data
      const downloadUrl = (response.data as any).data?.downloadUrl || response.data.downloadUrl;
      console.log('[fetchPresignedUrl] Download URL:', downloadUrl);
      
      if (downloadUrl) {
        setPresignedUrl(downloadUrl);
      }
    } catch (error) {
      console.error('[fetchPresignedUrl] Failed to fetch presigned URL:', error);
      toast.error('Không thể tải xem trước file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[handleSubmit] Starting submission');

    let finalUrl = slidesUrl.trim();
    let submissionType = OpentalkSlideType.LINK;
    let fileType = undefined;
    let fileName = undefined;

    if (uploadMethod === 'file') {
      console.log('[handleSubmit] Upload method: FILE');
      if (!selectedFile) {
        toast.error('Vui lòng chọn file để tải lên');
        return;
      }
      console.log('[handleSubmit] Selected file:', selectedFile.name, selectedFile.type);

      setIsUploading(true);
      try {
        console.log('[handleSubmit] Requesting presigned upload URL');
        const response = await uploadClientService.getOpentalkPresignedUrls([
          {
            fileName: selectedFile.name,
            contentType: selectedFile.type,
          },
        ]);
        console.log('[handleSubmit] Presigned URL response:', response.data);

        const presignedData = response.data.data[0];
        console.log('[handleSubmit] Presigned data:', presignedData);
        console.log('[handleSubmit] Upload URL:', presignedData.uploadUrl);
        console.log('[handleSubmit] File key:', presignedData.key);

        console.log('[handleSubmit] Uploading file to S3...');
        await uploadClientService.uploadFileToS3(presignedData.uploadUrl, selectedFile);
        console.log('[handleSubmit] File uploaded successfully');

        finalUrl = presignedData.key; 
        submissionType = OpentalkSlideType.FILE;
        fileType = selectedFile.type;
        fileName = selectedFile.name;
        console.log('[handleSubmit] Final URL (key):', finalUrl);

      } catch (error) {
        console.error('[handleSubmit] Upload failed:', error);
        toast.error('Tải file lên thất bại');
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    } else {
      console.log('[handleSubmit] Upload method: LINK');
      if (!finalUrl) {
        toast.error('Vui lòng nhập URL slide');
        return;
      }
      console.log('[handleSubmit] Link URL:', finalUrl);
      submissionType = OpentalkSlideType.LINK;
    }

    setIsLoading(true);
    try {
      console.log('[handleSubmit] Submitting slide to backend:', {
        eventId: event.id,
        slidesUrl: finalUrl,
        type: submissionType,
        fileType,
        fileName,
      });
      
      await opentalkClientService.submitSlide({
        eventId: event.id,
        slidesUrl: finalUrl,
        type: submissionType,
        fileType,
        fileName,
      });
      console.log('[handleSubmit] Slide submitted successfully');

      toast.success('Đã nộp slide thành công');
      
      if (submissionType === OpentalkSlideType.FILE && finalUrl) {
         console.log('[handleSubmit] Fetching view URL for uploaded file');
         try {
             const response = await uploadClientService.getOpentalkViewPresignedUrl(finalUrl);
             console.log('[handleSubmit] View URL response:', response.data);
             
             // The backend wraps responses in {statusCode, data}, so we need response.data.data
             const downloadUrl = (response.data as any).data?.downloadUrl || response.data.downloadUrl;
             console.log('[handleSubmit] Download URL:', downloadUrl);
             
             if (downloadUrl) {
                 console.log('[handleSubmit] Setting presigned URL:', downloadUrl);
                 setPresignedUrl(downloadUrl);
             }
         } catch (e) {
             console.error('[handleSubmit] Failed to refresh preview url:', e);
         }
      }

      console.log('[handleSubmit] Calling onSuccess callback');
      onSuccess?.();
    } catch (error) {
      console.error('[handleSubmit] Submission failed:', error);
      toast.error('Nộp slide thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Allow common presentation formats
      const validTypes = [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
        'application/vnd.google-apps.presentation', // google slides (unlikely to be uploaded as file but possible export)
      ];
      
      if (!validTypes.includes(file.type) && !file.type.includes('pdf')) {
         // Just a warning or strict? lets be strict for now to avoid garbage
         // checking file.type might vary. 
      }
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleClose = () => {
    if (!isLoading && !isUploading) {
      onOpenChange(false);
    }
  };

  const getFileIcon = (mimeType?: string) => {
    if (mimeType?.includes('pdf')) return '📄';
    if (mimeType?.includes('presentation') || mimeType?.includes('powerpoint')) return '📊';
    return '📁';
  };


  const handleApprove = async () => {
    if (!event?.id) return;
    
    setIsApproving(true);
    try {
      await opentalkClientService.approveSlide(event.id);
      toast.success('Đã phê duyệt slide thành công');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to approve slide:', error);
      toast.error('Phê duyệt slide thất bại');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!event?.id || !rejectionReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    
    setIsRejecting(true);
    try {
      await opentalkClientService.rejectSlide(event.id, rejectionReason);
      toast.success('Đã từ chối slide');
      setShowRejectDialog(false);
      setRejectionReason('');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to reject slide:', error);
      toast.error('Từ chối slide thất bại');
    } finally {
      setIsRejecting(false);
    }
  };
  const handlePreview = async () => {
    console.log('[handlePreview] Preview button clicked');
    console.log('[handlePreview] Current presignedUrl:', presignedUrl);
    
    if (presignedUrl) {
        console.log('[handlePreview] Using existing presigned URL, opening preview');
        setShowPreview(true);
        return;
    }

    const key = slide?.slideKey || slide?.slideUrl;
    console.log('[handlePreview] Fetching new presigned URL for key:', key);
    console.log('[handlePreview] Slide:', slide);
    
    if (!key) {
        console.error('[handlePreview] No file key found');
        toast.error('Không tìm thấy file key');
        return;
    }

    try {
        setIsLoading(true); 
        console.log('[handlePreview] Calling uploadClientService.getOpentalkViewPresignedUrl');
        const response = await uploadClientService.getOpentalkViewPresignedUrl(key);
        console.log('[handlePreview] Response:', response);
        console.log('[handlePreview] Response.data:', response.data);
        
        // The backend wraps responses in {statusCode, data}, so we need response.data.data
        const downloadUrl = (response.data as any).data?.downloadUrl || response.data.downloadUrl;
        console.log('[handlePreview] Download URL:', downloadUrl);
        
        if (downloadUrl) {
            setPresignedUrl(downloadUrl);
            setShowPreview(true);
            console.log('[handlePreview] Preview dialog opened');
        } else {
            console.error('[handlePreview] No downloadUrl in response');
            console.error('[handlePreview] Full response.data:', response.data);
            toast.error('Failed to get preview URL');
        }
    } catch (error) {
        console.error('[handlePreview] Error:', error);
        toast.error('Error loading preview');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isViewMode ? 'Xem Slide' : 'Nộp Slide'}</DialogTitle>
            <DialogDescription>
              {isViewMode ? 'Xem tài liệu cho' : 'Tải lên hoặc liên kết tài liệu cho'}{' '}
              <span className="font-medium text-foreground">{event.title}</span>
            </DialogDescription>
          </DialogHeader>

          {isViewMode ? (
            <div className="py-4">
              {hasExistingSlide ? (
                <div className="flex flex-col gap-4">
                  <div className="rounded-lg border bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xl">
                           {existingType === OpentalkSlideType.FILE ? getFileIcon(slide?.type) : '🔗'}
                        </div>
                        <div>
                          <p className="font-medium leading-none">
                            {slide?.slideKey || (existingType === OpentalkSlideType.FILE ? 'File đính kèm' : 'Liên kết ngoài')}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {existingType === OpentalkSlideType.FILE 
                               ? 'Tài liệu đã tải lên' 
                               : 'Google Slides / Liên kết Web'}
                          </p>
                        </div>
                      </div>
                      {slide?.status && (
                         <div className="px-2 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground">
                           {slide.status}
                         </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between gap-2">
                    <div className="flex gap-2">
                      {canApprove && slide?.status === OpentalkSlideStatus.PENDING && (
                        <>
                          <Button 
                            variant="default"
                            onClick={handleApprove}
                            disabled={isApproving || isRejecting}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isApproving ? 'Đang duyệt...' : 'Phê duyệt'}
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={() => setShowRejectDialog(true)}
                            disabled={isApproving || isRejecting}
                          >
                            Từ chối
                          </Button>
                        </>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Đóng
                      </Button>
                      
                      {existingType === OpentalkSlideType.FILE ? (
                        <Button 
                          onClick={handlePreview}
                          className="gap-2"
                          type="button"
                        >
                          <Upload className="h-4 w-4 rotate-180" /> 
                          Xem trước File
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => slide?.slideUrl && window.open(slide.slideUrl, '_blank')}
                          className="gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Mở liên kết
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                 <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                   <div className="mb-2 rounded-full bg-muted p-3">
                     <Upload className="h-6 w-6 opacity-50" />
                   </div>
                   <p>Chưa có slide nào được nộp cho sự kiện này.</p>
                 </div>
              )}
               {!hasExistingSlide && (
                   <DialogFooter>
                       <Button variant="ghost" onClick={() => onOpenChange(false)}>Đóng</Button>
                   </DialogFooter>
               )}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {hasExistingSlide && (
                  <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Slide hiện tại</Label>
                      {slide?.status && (
                        <span className="text-xs text-muted-foreground capitalize">
                          {slide.status.toLowerCase()}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-md bg-background">
                       <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-lg">
                             {existingType === OpentalkSlideType.FILE ? getFileIcon(slide?.type) : '🔗'}
                          </div>
                          <div>
                            <p className="text-sm font-medium leading-none">
                              {slide?.slideKey || (existingType === OpentalkSlideType.FILE ? 'File đính kèm' : 'Liên kết ngoài')}
                            </p>
                          </div>
                       </div>
                       
                       {existingType === OpentalkSlideType.FILE ? (
                          <Button 
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handlePreview}
                            className="gap-2 h-8"
                          >
                            <Upload className="h-3 w-3 rotate-180" /> 
                            Xem trước
                          </Button>
                       ) : (
                          <Button 
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => slide?.slideUrl && window.open(slide.slideUrl, '_blank')}
                            className="gap-2 h-8"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Mở
                          </Button>
                       )}
                    </div>
                  </div>
                )}

                <Tabs
                  defaultValue={uploadMethod}
                  onValueChange={(v) => setUploadMethod(v as 'url' | 'file')}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url">Liên kết ngoài</TabsTrigger>
                    <TabsTrigger value="file">Tải file lên</TabsTrigger>
                  </TabsList>

                  <TabsContent value="url" className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="slide-url">URL Slide</Label>
                      <Input
                        id="slide-url"
                        placeholder="https://docs.google.com/presentation/d/..."
                        type="url"
                        required={uploadMethod === 'url'}
                        value={slidesUrl}
                        onChange={(e) => setSlidesUrl(e.target.value)}
                      />
                      <p className="text-[0.8rem] text-muted-foreground">
                        Dán liên kết tới Google Slides, Canva, hoặc bất kỳ bài thuyết trình trên web nào.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="file" className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="file-upload">File</Label>
                      
                      {!selectedFile ? (
                          <div 
                            className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => document.getElementById('file-upload')?.click()}
                          >
                              <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                              <p className="text-sm font-medium">Nhấp để chọn file</p>
                              <p className="text-xs text-muted-foreground mt-1">PDF, PowerPoint (PPTX)</p>
                              <Input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                accept=".pdf,.ppt,.pptx"
                                onChange={handleFileSelect}
                              />
                          </div>
                      ) : (
                          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                              <div className="flex items-center gap-3 overflow-hidden">
                                  <div className="h-8 w-8 flex items-center justify-center bg-primary/10 rounded text-lg">
                                      {getFileIcon(selectedFile.type)}
                                  </div>
                                  <div className="min-w-0">
                                      <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                                      <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                  </div>
                              </div>
                              <Button
                                  type="button" 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={removeFile}
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                  <X className="h-4 w-4" />
                              </Button>
                          </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isLoading || isUploading}>
                  {isUploading ? 'Đang tải lên...' : isLoading ? 'Đang lưu...' : 'Nộp'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <FilePreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        url={presignedUrl}
        fileName={slide?.slideKey || 'Slide'}
        fileType={slide?.type}
      />

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối slide</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối slide này
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejection-reason">Lý do từ chối</Label>
            <textarea
              id="rejection-reason"
              className="w-full mt-2 min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Nhập lý do từ chối..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason('');
              }}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isRejecting || !rejectionReason.trim()}
            >
              {isRejecting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const ViewSlideDialog = SlideDialog;
export const UpdateSlideDialog = SlideDialog;
