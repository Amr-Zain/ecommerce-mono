import type { FC } from "react";
import { ControllerRenderProps } from "react-hook-form";
import AppUploader, { DEFAULT_API_BASE_URL, DEFAULT_UPLOAD_ENDPOINT } from "./Uploader";
import { FileUploadInputProps } from "@/types/components/uploader";

export interface FileUploadFieldProps extends FileUploadInputProps {
  field: ControllerRenderProps<any, string>;
  className?: string;
}

const getUploadedValue = (file: any) =>
  file?.attach_hash ||
  file?.uuid ||
  file?.response?.data?.attach_hash ||
  file?.response?.data?.uuid ||
  file?.uid?.toString() ||
  file;

const FileUploadField: FC<FileUploadFieldProps> = ({
  field,
  maxFiles = 1,
  maxSize = 7,
  acceptedFileTypes = ['image/*'],
  multiple = false,
  disabled = false,
  className = '',
  showPreview = true,
  shapeType = 'picture-card',
  draggable = true,
  type_file = 'image',
  model = 'attachments',
  modelId,
  collection,
  apiEndpoint = DEFAULT_UPLOAD_ENDPOINT,
  baseUrl = DEFAULT_API_BASE_URL,
}) => {
  const accept = acceptedFileTypes.join(',')

  const getInitialFileList = () => {
    if (!field.value) return []

    if (Array.isArray(field.value)) {
      return field.value.map((val: any) => {
        if (typeof val === 'string') {
          return { uid: val, url: val, name: 'uploaded-file', isUploading: false }
        }
        if (typeof val === 'object') {
          if (val.uid && (val.url || val.preview)) return val;
          return {
            uid: val.uuid || val.id || crypto.randomUUID(),
            name: val.original_name || val.name || 'uploaded-file',
            isUploading: false,
            url: val.path || val.url,
            response: { data: val },
          }
        }
        return val;
      })
    }

    if(typeof field.value === 'string'){
      return [{ uid: field.value, url: field.value, name: 'uploaded-file', isUploading: false }]
    }
    if (typeof field.value === 'object' && (field.value.id || field.value.uuid)) {
      return [
        {
          uid: field.value.uuid || field.value.id,
          name: field.value.original_name || field.value.name || 'uploaded-file',
          isUploading: false,
          url: field.value.path || field.value.url,
          response: { data: field.value },
        },
      ]
    }

    return []
  }

  const handleChange = (value: any) => {
    if (multiple) {
      field.onChange([...(field.value || []), ...value.map(getUploadedValue)])
    } else {
      field.onChange(getUploadedValue(value))
    }
  }

  const handleRemove = (fileList: any[]) => {
    if (multiple) {
      field.onChange(fileList.map(getUploadedValue))
    } else {
      field.onChange('')
    }
  }

  return (
    <div className={className}>
      <AppUploader
        field={field}
        name={field.name}
        initialFileList={getInitialFileList()}
        onChange={handleChange}
        onRemove={handleRemove}
        maxCount={multiple ? maxFiles : 1}
        disabled={disabled}
        singleFile={!multiple}
        shapeType={shapeType}
        type_file={type_file}
        accept={accept}
        maxSize={maxSize}
        showPreview={showPreview}
        draggable={draggable}
        model={model}
        modelId={modelId}
        collection={collection}
        apiEndpoint={apiEndpoint}
        baseUrl={baseUrl}
      />
    </div>
  )
}

export default FileUploadField;
