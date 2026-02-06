"use client";

import { useState, useRef } from "react";

type Result = {
  insertScript: string;
  deleteScript: string;
  totalRows: number;
  totalFiles?: number;
};

const styles = {
  main: { maxWidth: 960, margin: "0 auto" as const, padding: 24 },
  subtitle: { color: "#94a3b8", marginBottom: 24 },
  form: { marginBottom: 24 },
  inputWrap: { marginBottom: 16 },
  input: {
    padding: 8,
    border: "1px solid #334155",
    borderRadius: 6,
    background: "#1e293b",
    color: "#e2e8f0",
  },
  button: (disabled: boolean) => ({
    padding: "10px 20px",
    background: disabled ? "#334155" : "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 600,
  }),
  error: {
    padding: 12,
    marginBottom: 24,
    background: "#7f1d1d",
    color: "#fecaca",
    borderRadius: 6,
  },
  scriptLabel: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  label: { fontWeight: 600 },
  copyBtn: {
    padding: "6px 12px",
    background: "#334155",
    color: "#e2e8f0",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
  },
  textarea: {
    width: "100%",
    padding: 12,
    fontFamily: "ui-monospace, monospace",
    fontSize: 13,
    background: "#1e293b",
    color: "#e2e8f0",
    border: "1px solid #334155",
    borderRadius: 6,
    resize: "vertical" as const,
  },
};

function ScriptBlock({
  id,
  label,
  value,
  rows,
  refEl,
  onCopy,
}: {
  id: string;
  label: string;
  value: string;
  rows: number;
  refEl: React.RefObject<HTMLTextAreaElement | null>;
  onCopy: (ref: React.RefObject<HTMLTextAreaElement | null>) => void;
}) {
  return (
    <div>
      <div style={styles.scriptLabel}>
        <label htmlFor={id} style={styles.label}>
          {label}
        </label>
        <button type="button" onClick={() => onCopy(refEl)} style={styles.copyBtn}>
          Copiar
        </button>
      </div>
      <textarea
        id={id}
        ref={refEl as React.RefObject<HTMLTextAreaElement>}
        readOnly
        value={value}
        rows={rows}
        style={styles.textarea}
      />
    </div>
  );
}

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const insertRef = useRef<HTMLTextAreaElement>(null);
  const deleteRef = useRef<HTMLTextAreaElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files ? Array.from(e.target.files) : []);
    setError(null);
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.length) {
      setError("Selecione um ou mais arquivos .xlsx");
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
        setError(data.error ?? "Erro ao processar");
        return;
      }
      setResult({
        insertScript: data.insertScript,
        deleteScript: data.deleteScript,
        totalRows: data.totalRows ?? 0,
        totalFiles: data.totalFiles,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro de rede");
    } finally {
      setLoading(false);
    }
  };

  const copy = (ref: React.RefObject<HTMLTextAreaElement | null>) => {
    const el = ref.current;
    if (el?.value) navigator.clipboard.writeText(el.value);
  };

  const disabled = loading || !files.length;

  return (
    <main style={styles.main}>
      <h1 style={{ marginBottom: 8, fontSize: "1.5rem" }}>
        Gerador de Scripts SQL – MOPS_DEFEITO
      </h1>
      <p style={styles.subtitle}>
        Envie um ou mais arquivos Excel (.xlsx). Os registros serão concatenados e gerados um único script de INSERT e um de DELETE.
      </p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputWrap}>
          <input
            type="file"
            accept=".xlsx"
            multiple
            onChange={handleFileChange}
            style={styles.input}
          />
        </div>
        <button type="submit" disabled={disabled} style={styles.button(disabled)}>
          {loading ? "Processando…" : "Gerar scripts"}
        </button>
      </form>

      {error && (
        <p role="alert" style={styles.error}>
          {error}
        </p>
      )}

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <p style={styles.subtitle}>
            {result.totalRows} registro(s) de {result.totalFiles ?? 1} arquivo(s) processado(s).
          </p>
          <ScriptBlock
            id="insert-sql"
            label="Script INSERT"
            value={result.insertScript}
            rows={14}
            refEl={insertRef}
            onCopy={copy}
          />
          <ScriptBlock
            id="delete-sql"
            label="Script DELETE"
            value={result.deleteScript}
            rows={10}
            refEl={deleteRef}
            onCopy={copy}
          />
        </div>
      )}
    </main>
  );
}
