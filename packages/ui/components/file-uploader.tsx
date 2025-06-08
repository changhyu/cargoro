import * as React from 'react';

import { File, FileText, Image, PenLine, UploadCloud, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

import { cn } from '../utils';

import { Button } from './button';
import { Progress } from './progress';

export interface FileUploaderProps {
  onDrop: (acceptedFiles: File[]) => void;
  onRemove?: (file: File | AcceptedFile) => void;
  value?: AcceptedFile[];
  maxFiles?: number;
  maxSize?: number;
  accept?: Record<string, string[]>;
  disabled?: boolean;
  showPreview?: boolean;
  showRemoveButton?: boolean;
  previewType?: 'grid' | 'list';
  previewMaxHeight?: number;
  className?: string;
  dropzoneClassName?: string;
  previewClassName?: string;
  loading?: boolean;
  loadingText?: string;
  uploadProgress?: number;
  renderCustomPreview?: (file: AcceptedFile, onRemove?: () => void) => React.ReactNode;
  placeholder?: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
}

export interface AcceptedFile extends File {
  preview?: string;
  id?: string;
  uploadProgress?: number;
  error?: string;
  path?: string;
}

/**
 * FileUploader 컴포넌트
 * 파일 업로드 기능을 제공하는 드롭존 컴포넌트
 */
export const FileUploader = React.forwardRef<HTMLDivElement, FileUploaderProps>(
  (
    {
      onDrop,
      onRemove,
      value = [],
      maxFiles = 5,
      maxSize = 1024 * 1024 * 10, // 10MB
      accept = {
        'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
        'application/pdf': ['.pdf'],
      },
      disabled = false,
      showPreview = true,
      showRemoveButton = true,
      previewType = 'grid',
      previewMaxHeight = 400,
      className,
      dropzoneClassName,
      previewClassName,
      loading = false,
      loadingText = '업로드 중...',
      uploadProgress,
      renderCustomPreview,
      placeholder,
      variant = 'default',
    },
    ref
  ) => {
    const hasReachedMaxFiles = value.length >= maxFiles;

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
      onDrop: acceptedFiles => {
        const files = acceptedFiles.map(file =>
          Object.assign(file, {
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
            id: Math.random().toString(36).substring(2),
          })
        ) as AcceptedFile[];
        onDrop(files);
      },
      maxFiles: maxFiles - value.length,
      maxSize,
      accept,
      disabled: disabled || hasReachedMaxFiles || loading,
      noClick: hasReachedMaxFiles || loading,
      noDrag: loading,
      noKeyboard: loading,
    });

    // 메모리 누수 방지를 위해 URL.createObjectURL로 생성된 객체 URL 해제
    React.useEffect(() => {
      return () => {
        value.forEach(file => {
          if (file.preview) {
            URL.revokeObjectURL(file.preview);
          }
        });
      };
    }, [value]);

    const handleRemove = (file: AcceptedFile) => {
      if (onRemove) {
        onRemove(file);
      }
    };

    // 파일 아이콘 표시
    const renderFileIcon = (fileType: string) => {
      if (fileType.startsWith('image/')) {
        return <Image className="h-5 w-5 text-blue-500" />;
      } else if (fileType === 'application/pdf') {
        return <FileText className="h-5 w-5 text-red-500" />;
      } else if (fileType.startsWith('text/')) {
        return <PenLine className="h-5 w-5 text-green-500" />;
      } else {
        return <File className="h-5 w-5 text-gray-500" />;
      }
    };

    // 파일 사이즈 포맷팅
    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        {/* 드롭존 */}
        <div
          {...getRootProps()}
          className={cn(
            'relative cursor-pointer rounded-lg border-2 border-dashed transition-colors',
            'flex flex-col items-center justify-center px-4 py-8 text-center',
            isDragActive
              ? 'border-primary/80 bg-primary/5 text-primary'
              : hasReachedMaxFiles || disabled
                ? 'cursor-not-allowed border-muted bg-muted/50 text-muted-foreground'
                : 'border-muted-foreground/25 hover:bg-muted/50',
            variant === 'default' && 'bg-background',
            variant === 'outline' && 'bg-transparent',
            variant === 'ghost' &&
              'border-transparent bg-transparent hover:border-muted-foreground/25',
            disabled && 'cursor-not-allowed',
            dropzoneClassName
          )}
          data-testid="dropzone"
        >
          <input {...getInputProps()} />

          {loading ? (
            <div className="space-y-3 text-center">
              <UploadCloud className="mx-auto h-10 w-10 animate-pulse text-muted-foreground" />
              <div className="text-sm text-muted-foreground">{loadingText}</div>
              {uploadProgress !== undefined && (
                <div className="mx-auto w-full max-w-xs">
                  <Progress value={uploadProgress} className="h-2" />
                  <div className="mt-1 text-right text-xs text-muted-foreground">
                    {uploadProgress}%
                  </div>
                </div>
              )}
            </div>
          ) : placeholder ? (
            placeholder
          ) : (
            <div className="space-y-2">
              <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
              <div>
                <p className="text-base font-medium">여기에 파일을 드래그하거나 클릭하여 업로드</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {accept && Object.entries(accept).length > 0
                    ? `지원 형식: ${Object.entries(accept)
                        .map(([_, exts]) => exts.join(', '))
                        .join(', ')}`
                    : '모든 파일 형식 지원'}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  최대 {maxFiles}개 파일, 각 {formatFileSize(maxSize)} 이하
                </p>
              </div>
              {hasReachedMaxFiles && (
                <p className="mt-1 text-sm font-medium text-amber-500">
                  최대 파일 개수에 도달했습니다. 새 파일을 업로드하려면 기존 파일을 제거하세요.
                </p>
              )}
            </div>
          )}

          {fileRejections.length > 0 && (
            <div className="mt-3 w-full max-w-sm rounded-md bg-red-50 p-2 text-sm text-red-500">
              <p className="font-medium">다음 파일을 업로드할 수 없습니다:</p>
              <ul className="mt-1 list-inside list-disc">
                {fileRejections.map(({ file, errors }) => (
                  <li key={file.name}>
                    {file.name} ({formatFileSize(file.size)}) - {errors[0]?.message || '오류 발생'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 파일 미리보기 */}
        {showPreview && value.length > 0 && (
          <div
            className={cn(
              'mt-4',
              previewType === 'grid'
                ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                : 'space-y-2',
              previewClassName
            )}
          >
            {value.map(file => (
              <div
                key={file.id || file.name}
                className={cn(
                  'group relative rounded-md border bg-card transition-colors',
                  previewType === 'grid' ? 'p-2' : 'flex items-center gap-3 p-2'
                )}
              >
                {/* 커스텀 미리보기 */}
                {renderCustomPreview ? (
                  renderCustomPreview(file, () => handleRemove(file))
                ) : (
                  <>
                    {/* 이미지 미리보기 */}
                    {file.type.startsWith('image/') && file.preview ? (
                      <div
                        className={cn(
                          'relative overflow-hidden rounded bg-muted/50',
                          previewType === 'grid' ? 'aspect-square w-full' : 'h-14 w-14 shrink-0'
                        )}
                      >
                        <img
                          src={file.preview}
                          alt={file.name || '업로드된 파일'}
                          className="h-full w-full object-cover"
                          style={{ maxHeight: previewMaxHeight }}
                          onLoad={() => {
                            URL.revokeObjectURL(file.preview!);
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          'flex items-center justify-center rounded bg-muted/50',
                          previewType === 'grid' ? 'aspect-square w-full' : 'h-14 w-14 shrink-0'
                        )}
                      >
                        {renderFileIcon(file.type)}
                      </div>
                    )}

                    {/* 파일 정보 */}
                    <div className={previewType === 'grid' ? 'mt-2' : 'min-w-0 flex-1'}>
                      <p className="truncate text-sm font-medium" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      {file.uploadProgress !== undefined && file.uploadProgress < 100 && (
                        <div className="mt-1 w-full">
                          <Progress value={file.uploadProgress} className="h-1" />
                        </div>
                      )}
                      {file.error && <p className="mt-1 text-xs text-red-500">{file.error}</p>}
                    </div>

                    {/* 삭제 버튼 */}
                    {showRemoveButton && !disabled && !loading && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn(
                          'absolute rounded-full p-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground focus:ring-0',
                          previewType === 'grid' ? 'right-1 top-1' : 'right-1'
                        )}
                        onClick={e => {
                          e.stopPropagation();
                          handleRemove(file);
                        }}
                        aria-label="파일 삭제"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

FileUploader.displayName = 'FileUploader';
