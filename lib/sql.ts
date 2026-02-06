import type { DefeitoRow } from "./types";
import { INSERT_COLUMNS, DATE_COLUMNS } from "./types";

const CHARS_TO_STRIP = /['";&]/g;
const DATE_COLUMNS_SET = new Set(DATE_COLUMNS);

function sanitize(value: string): string {
  return value.replace(CHARS_TO_STRIP, "");
}

function escapeSql(value: string): string {
  return value.replace(/'/g, "''");
}

function formatId(value: string | number | null | undefined): string {
  if (value === "" || value === undefined || value === null) return "NULL";
  return String(value);
}

/** Extrai a parte da data sem horário. */
function datePartOnly(raw: string): string {
  const i = raw.indexOf(" ");
  return (i >= 0 ? raw.slice(0, i) : raw).trim();
}

/** Converte ano de 2 dígitos para 4. */
function expandYear(yy: string): number {
  const n = Number(yy);
  return yy.length === 2 ? (n <= 50 ? 2000 + n : 1900 + n) : n;
}

/**
 * Normaliza data para dd/mm/yyyy (sem horário).
 * Aceita: "30/06/2022 16:56", "6/30/22", "2022-06-30", número serial Excel.
 */
function toDDMMYYYY(value: string | number): string {
  const raw = typeof value === "number" ? String(value) : (value?.trim() ?? "");
  if (!raw) return "";

  const num = typeof value === "number" ? value : Number(raw);
  if (!Number.isNaN(num) && num > 0) {
    const d = new Date((num - 25569) * 86400000);
    if (!Number.isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      return `${day}/${month}/${d.getFullYear()}`;
    }
  }

  const part = datePartOnly(raw);

  const iso = part.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) return `${iso[3].padStart(2, "0")}/${iso[2].padStart(2, "0")}/${iso[1]}`;

  const ddmmyyyy = part.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyy) return `${ddmmyyyy[1].padStart(2, "0")}/${ddmmyyyy[2].padStart(2, "0")}/${ddmmyyyy[3]}`;

  const slash = part.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slash) {
    const [a, b, y] = [Number(slash[1]), Number(slash[2]), expandYear(slash[3])];
    const day = a > 12 ? a : b;
    const month = a > 12 ? b : a;
    return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${y}`;
  }

  return part;
}

function formatDate(value: string | number): string {
  const dateStr = sanitize(toDDMMYYYY(value));
  return `to_date('${escapeSql(dateStr)}', 'dd/mm/yyyy')`;
}

function formatString(value: string): string {
  const cleaned = escapeSql(sanitize(value?.trim() ?? ""));
  return `'${cleaned}'`;
}

function formatValue(row: DefeitoRow, key: keyof DefeitoRow): string {
  const v = row[key];
  if (key === "ID") return formatId(v as string | number);
  if (DATE_COLUMNS_SET.has(key)) return formatDate((v as string) ?? "");
  return formatString((v as string) ?? "");
}

const INSERT_HEADER =
  "INSERT INTO DEVMOPS.MOPS_DEFEITO(" +
  INSERT_COLUMNS.join(", ") +
  " ) values ";

export function generateInsert(row: DefeitoRow): string {
  const values = INSERT_COLUMNS.map((col) => formatValue(row, col)).join(", ");
  return `${INSERT_HEADER}(${values});`;
}

export function generateDelete(row: DefeitoRow): string {
  return `DELETE FROM DEVMOPS.MOPS_DEFEITO WHERE ID = ${formatId(row.ID)};`;
}

export function generateSqlScripts(rows: DefeitoRow[]): {
  insertScript: string;
  deleteScript: string;
} {
  return {
    insertScript: rows.map(generateInsert).join("\n"),
    deleteScript: rows.map(generateDelete).join("\n"),
  };
}
