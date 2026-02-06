 "use client";

import { useState } from "react";
import styles from "../app/page.module.css";

type Props = {
  files: File[];
  disabled?: boolean;
  onFilesSelected: (files: File[]) => void;
};

export default function UploadArea({ files, disabled, onFilesSelected }: Props) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    const list = e.dataTransfer.files;
    const next = list ? Array.from(list) : [];
    onFilesSelected(next);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const list = e.target.files;
    const next = list ? Array.from(list) : [];
    onFilesSelected(next);
  };

  const className = [
    styles.uploadArea,
    isDragging && !disabled ? styles.uploadAreaActive : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".xlsx"
        multiple
        className={styles.uploadInput}
        disabled={disabled}
        onChange={handleChange}
      />
      <div className={styles.uploadContent}>
        <div className={styles.uploadTitle}>Arraste os arquivos Excel aqui</div>
        <div className={styles.uploadHint}>
          ou clique para selecionar <strong>um ou mais</strong> arquivos <strong>.xlsx</strong>
        </div>
        {/* <div className={styles.uploadBadge}>
          <span>Upload múltiplo</span>
          <span>Excel (.xlsx)</span>
        </div> */}
        {files.length > 0 && (
          <div className={styles.uploadFileName}>
            {files.length === 1 ? (
              <>
                Arquivo selecionado: <strong>{files[0].name}</strong>
              </>
            ) : (
              <>
                {files.length} arquivos selecionados. Primeiro: <strong>{files[0].name}</strong>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

