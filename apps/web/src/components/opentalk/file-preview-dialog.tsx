import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';

interface FilePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string | null;
  fileName: string;
  fileType?: string;
}

export function FilePreviewDialog({
  open,
  onOpenChange,
  url,
  fileName,
  fileType,
}: FilePreviewDialogProps) {
  console.log('[FilePreviewDialog] Rendered with:', {
    open,
    url,
    fileName,
    fileType,
  });

  if (!url) {
    console.warn('[FilePreviewDialog] No URL provided, returning null');
    return null;
  }

  const docs = [
    {
      uri: url,
      fileName: fileName,
      fileType: fileType,
    },
  ];

  console.log('[FilePreviewDialog] DocViewer docs:', docs);

  return (
    <>
      <style jsx global>{`
        iframe {
          height: 90vh !important;
        }
      `}</style>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="h-[90vh] !max-w-6xl !w-6xl flex flex-col p-0 gap-0"
          aria-describedby={undefined}
        >
          <DialogHeader className="p-4 border-b flex flex-row items-center justify-between shrink-0">
            <DialogTitle className="text-base font-medium truncate flex-1 pr-4">
              {fileName}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto bg-gray-100 p-4 relative">
            <DocViewer
              documents={docs}
              pluginRenderers={DocViewerRenderers}
              style={{ height: '100%', width: '100%' }}
              config={{
                header: {
                  disableHeader: true,
                  disableFileName: true,
                  retainURLParams: true,
                },
                pdfVerticalScrollByDefault: true,
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
