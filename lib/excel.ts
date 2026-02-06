import * as XLSX from "xlsx";
import type { DefeitoRow } from "./types";
import { INSERT_COLUMNS } from "./types";

/** Nomes alternativos de colunas no Excel (pt técnico, inglês, descrição). */
const COLUMN_ALIASES: Record<keyof DefeitoRow, string[]> = {
  ID: ["ID"],
  NOME: ["NOME", "Name", "Nome"],
  DATA_CRIACAO: ["DATA_CRIACAO", "Creation time", "Data Criação"],
  DATA_FECHAMENTO: ["DATA_FECHAMENTO", "Done date", "Data Fechamento"],
  ID_DEFEITO_LEGADO: ["ID_DEFEITO_LEGADO", "ID do defeito no Legado"],
  DATA_IMPLANTACAO: ["DATA_IMPLANTACAO", "Bugfix Milestone", "Data Implantação"],
  TIME: ["TIME", "Team"],
  CENTRO_COMPETENCIA: ["CENTRO_COMPETENCIA", "Competence Center", "Centro Competência"],
  AUTOR: ["AUTOR", "Author"],
  RESPONSAVEL: ["RESPONSAVEL", "Owner", "Responsável"],
  STATUS: ["STATUS", "Phase"],
  US_MELHORIA: ["US_MELHORIA", "US de Melhoria"],
  TAGS: ["TAGS", "Tags"],
  TYPE: ["TYPE", "Type"],
  MILESTONE: ["MILESTONE", "Milestone"],
  FEATURE: ["FEATURE", "Feature"],
  DDP_RELEASE: ["DDP_RELEASE", "Release", "RELEASE"],
};

function getCell(row: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const v = row[key];
    if (v !== undefined && v !== null) return String(v).trim();
  }
  return "";
}

function getCellId(row: Record<string, unknown>, keys: string[]): string | number {
  for (const key of keys) {
    const v = row[key];
    if (v === undefined || v === null) continue;
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    const s = String(v).trim();
    if (s === "") continue;
    const n = Number(s);
    return Number.isNaN(n) ? s : n;
  }
  return "";
}

export function parseExcelFromBuffer(buffer: ArrayBuffer): DefeitoRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });

  return raw.map((row) => {
    const out = {} as DefeitoRow;
    for (const key of INSERT_COLUMNS) {
      (out as Record<string, unknown>)[key] =
        key === "ID"
          ? getCellId(row, COLUMN_ALIASES[key])
          : getCell(row, COLUMN_ALIASES[key]);
    }
    return out;
  });
}
