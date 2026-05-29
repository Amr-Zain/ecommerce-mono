import { Eye, File, FileText, Image as ImageIcon, Loader2, Video, X } from "lucide-react";
import { Button } from "@ecommerce/ui/components/button";
import { Badge } from "@ecommerce/ui/components/badge";
import { formatFileSize } from "@/util/helpers";
import { UploadFile } from "@/types/components/uploader";
import { t } from "i18next";

type FilePreviewProps = {
  file: UploadFile;
  showPreview: boolean;
  handlePreview: (value: UploadFile) => void;
  handleRemove: (file: UploadFile) => void;
  shapeType?: "list" | "picture-card";
};

const getFileIcon = (file: UploadFile) => {
  const mimeType = file.response?.data?.mime_type || file.type;

  if (mimeType?.startsWith('image/'))
    return <ImageIcon className="w-8 h-8 text-blue-500" />
  if (mimeType?.startsWith('video/'))
    return <Video className="w-8 h-8 text-purple-500" />
  if (mimeType?.includes('pdf'))
    return <FileText className="w-8 h-8 text-red-500" />
  return <File className="w-8 h-8 text-gray-500" />;
};

const renderFilePreview = (file: UploadFile) => {
  if (file.isUploading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }
  const mimeType = file.type || file.response?.data?.mime_type;

  if (
    (file.url || file.preview) &&
    mimeType?.startsWith('image/')
  ) {
    return (
      <img
        src={file.url || (file.preview as string)}
        alt={file.name}
        className="w-full h-full object-cover rounded-lg"
      />
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {getFileIcon(file)}
      <span className="text-xs text-muted-foreground mt-1 text-center truncate max-w-full">
        {file.name}
      </span>
    </div>
  );
};

function FilePreview({
  file,
  showPreview,
  handlePreview,
  handleRemove,
  shapeType = 'list',
}: FilePreviewProps) {
  if (shapeType === 'picture-card') {
    return (
      <div
        key={file.uid}
        className="relative group bg-card border rounded-lg p-2 hover:shadow-md transition-all max-w-40"
      >
        <div className="aspect-square bg-muted border-2 border-border rounded-lg overflow-hidden hover:border-primary transition-colors">
          {renderFilePreview(file)}
        </div>

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            {showPreview && !file.isUploading && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => handlePreview(file)}
                className="h-8 w-8 p-0 bg-background/90 hover:bg-background"
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}

            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => handleRemove(file)}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="mt-2 space-y-1">
          <p className="text-sm font-medium text-foreground truncate">
            {file.name}
          </p>
          <div className="flex items-center justify-between">
            {file.size && (
              <span className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </span>
            )}
            {file.isUploading && (
              <Badge variant="secondary" className="text-xs">
                {t('Text.uploading')}
              </Badge>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      key={file.uid}
      className="flex items-center p-3 bg-card border rounded-lg hover:shadow-sm transition-shadow"
    >
      <div className="flex-shrink-0 mr-3">{getFileIcon(file)}</div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {file.name}
        </p>
        {file.size && (
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {file.isUploading && (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <Badge variant="secondary" className="text-xs">
              {t('Text.uploading')}
            </Badge>
          </div>
        )}

        {showPreview && !file.isUploading && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => handlePreview(file)}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <Eye className="w-4 h-4" />
          </Button>
        )}

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => handleRemove(file)}
          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export default FilePreview;
