/** Registro lido da primeira aba do Excel (uma linha = um registro) */
export interface DefeitoRow {
  ID: string | number;
  NOME: string;
  DATA_CRIACAO: string;
  DATA_FECHAMENTO: string;
  ID_DEFEITO_LEGADO: string;
  DATA_IMPLANTACAO: string;
  TIME: string;
  CENTRO_COMPETENCIA: string;
  AUTOR: string;
  RESPONSAVEL: string;
  STATUS: string;
  US_MELHORIA: string;
  TAGS: string;
  TYPE: string;
  MILESTONE: string;
  FEATURE: string;
  DDP_RELEASE: string;
}

/** Ordem das colunas no INSERT (e no Excel). */
export const INSERT_COLUMNS: (keyof DefeitoRow)[] = [
  "ID",
  "NOME",
  "DATA_CRIACAO",
  "DATA_FECHAMENTO",
  "ID_DEFEITO_LEGADO",
  "DATA_IMPLANTACAO",
  "TIME",
  "CENTRO_COMPETENCIA",
  "AUTOR",
  "RESPONSAVEL",
  "STATUS",
  "US_MELHORIA",
  "TAGS",
  "TYPE",
  "MILESTONE",
  "FEATURE",
  "DDP_RELEASE",
];

/** Colunas que são datas (to_date). */
export const DATE_COLUMNS: (keyof DefeitoRow)[] = [
  "DATA_CRIACAO",
  "DATA_FECHAMENTO",
  "DATA_IMPLANTACAO",
];
