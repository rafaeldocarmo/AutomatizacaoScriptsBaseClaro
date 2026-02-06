"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import UploadArea from "@/components/UploadArea";
import ResultFiles from "@/components/ResultFiles";

type Result = {
  insertScript: string;
  deleteScript: string;
  totalRows: number;
};

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [urls, setUrls] = useState<{ insert: string; delete: string } | null>(null);

  const handleFilesSelected = (next: File[]) => {
    setError(null);
    setResult(null);
    if (!next.length) {
      setFiles([]);
      return;
    }
    const invalid = next.find((f) => !f.name?.toLowerCase().endsWith(".xlsx"));
    if (invalid) {
      setError(`Arquivo inválido: "${invalid.name}". Use apenas arquivos .xlsx.`);
      setFiles([]);
      return;
    }
    setFiles(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.length) {
      setError("Selecione um ou mais arquivos .xlsx antes de gerar os scripts.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("file", f));
      const res = await fetch("/api/generate-sql", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao processar o arquivo.");
        return;
      }
      setResult({
        insertScript: data.insertScript,
        deleteScript: data.deleteScript,
        totalRows: data.totalRows ?? 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro de rede.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!result) {
      if (urls) {
        URL.revokeObjectURL(urls.insert);
        URL.revokeObjectURL(urls.delete);
        setUrls(null);
      }
      return;
    }

    const insertBlob = new Blob([result.insertScript], {
      type: "text/plain;charset=utf-8",
    });
    const deleteBlob = new Blob([result.deleteScript], {
      type: "text/plain;charset=utf-8",
    });

    const next = {
      insert: URL.createObjectURL(insertBlob),
      delete: URL.createObjectURL(deleteBlob),
    };

    setUrls((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev.insert);
        URL.revokeObjectURL(prev.delete);
      }
      return next;
    });

    return () => {
      URL.revokeObjectURL(next.insert);
      URL.revokeObjectURL(next.delete);
    };
  }, [result]);

  const disabled = loading || !files.length;

  const handleReset = () => {
    setFiles([]);
    setResult(null);
    setError(null);
  };

  return (
    <main className={styles.root}>
      <section className={styles.panel}>
        <h1 className={styles.title}>Gerador de Scripts SQL – MOPS_DEFEITO</h1>
        <p className={styles.subtitle}>
          Envie um ou mais arquivos Excel (.xlsx) com os registros de defeitos. A aplicação irá
          gerar os scripts de <strong>INSERT</strong> e <strong>DELETE</strong> prontos para uso,
          concatenando todos os registros.
        </p>

        {!result && (
          <div className={styles.uploadSection}>
            <UploadArea files={files} disabled={loading} onFilesSelected={handleFilesSelected} />
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.primaryButton}
                disabled={disabled}
                onClick={handleSubmit}
              >
                {loading ? "Processando…" : "Gerar scripts"}
              </button>
            </div>
            {error && (
              <p role="alert" className={styles.error}>
                {error}
              </p>
            )}
          </div>
        )}

        {result && urls && (
          <div className={styles.result}>
            <p className={styles.resultInfo}>
              {result.totalRows} registro(s) processado(s). Os arquivos abaixo foram gerados em
              memória.
            </p>
            <ResultFiles insertUrl={urls.insert} deleteUrl={urls.delete} />
            <div className={styles.actions} style={{ marginTop: 24 }}>
              <button type="button" className={styles.secondaryButton} onClick={handleReset}>
                Novo upload
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
