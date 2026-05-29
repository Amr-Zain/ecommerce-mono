import { Plus } from "lucide-react";
import { useDropzone } from "react-dropzone";
import CardPreview from "./CardPreview";
import { getAcceptTypes } from "@/util/helpers";
import { UploadFile } from "@/types/components/uploader";
import { t } from "i18next";
import { cn } from "@/lib/utils";

export default function UploadedPreview({
  fileList,
  showPreview,
  handlePreview,
  handleRemove,
  shapeType,
  onDrop,
  type_file,
  maxCount,
  accept,
  singleFile,
  draggable,
  disabled = false,
  hasError
}: {
  fileList: UploadFile[];
  showPreview: boolean;
  shapeType: "picture-card" | "list";
  handlePreview: (value: UploadFile) => void;
  handleRemove: (file: UploadFile) => void;
  onDrop: (acceptedFiles: File[]) => void;
  type_file?: "image" | "document" | "media";
  maxCount?: number;
  accept?: string;
  singleFile?: boolean;
  draggable?: boolean;
  disabled?: boolean;
  hasError?: boolean;
}) {
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: getAcceptTypes(accept, type_file)
      .split(",")
      .reduce((acc, type) => {
        acc[type.trim()] = [];
        return acc;
      }, {} as Record<string, string[]>),
    maxFiles: singleFile ? 1 : maxCount,
    disabled,
    noClick: true,
    noDrag: !draggable,
    multiple: !singleFile,
  });

  return (
    <div
      className={
        shapeType === 'picture-card'
          ? singleFile || maxCount === 1
            ? 'max-w-44 mx-auto'
            : 'flex gap-2 flex-wrap'
          : 'space-y-2'
      }
    >
      {fileList.map((file) => (
        <CardPreview
          key={file.uid}
          file={file}
          handlePreview={handlePreview}
          showPreview={showPreview}
          handleRemove={handleRemove}
          shapeType={shapeType}
        />
      ))}
      {fileList.length < (maxCount || 1) && (
        <div
          {...getRootProps()}
          className={cn(`max-w-40 p-4 border-1 border-dashed border-sidebar-border py-6 rounded-lg cursor-pointer transition-all ${
            isDragActive && draggable
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${hasError ? 'border-destructive hover:border-destructive' : ''}
            `)}
        >
          <input {...getInputProps()} />
          <button
            type="button"
            className="bg-transparent border-none flex flex-col items-center justify-center h-full w-full relative"
            onClick={() => !disabled && open()}
          >
            <div className="flex flex-col justify-center items-center gap-2 text-gray-500">
              <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-sm text-center">
                {draggable ? t('Text.uploadText') : t('Text.clickToUpload')}
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
