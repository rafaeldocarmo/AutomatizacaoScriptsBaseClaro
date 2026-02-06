import { NextRequest, NextResponse } from "next/server";
import { parseExcelFromBuffer } from "@/lib/excel";
import { generateSqlScripts } from "@/lib/sql";
import type { DefeitoRow } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("file") as File[];

    if (!files.length) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado. Envie um ou mais arquivos Excel (.xlsx)." },
        { status: 400 }
      );
    }

    const allRows: DefeitoRow[] = [];

    for (const file of files) {
      const name = file.name?.toLowerCase() ?? "";
      if (!name.endsWith(".xlsx")) {
        return NextResponse.json(
          { error: `Formato inválido: "${file.name}". Use apenas arquivos .xlsx` },
          { status: 400 }
        );
      }
      const buffer = await file.arrayBuffer();
      const rows = parseExcelFromBuffer(buffer);
      allRows.push(...rows);
    }

    if (allRows.length === 0) {
      return NextResponse.json(
        { error: "Nenhum registro encontrado na primeira aba dos arquivos." },
        { status: 400 }
      );
    }

    const { insertScript, deleteScript } = generateSqlScripts(allRows);

    return NextResponse.json({
      insertScript,
      deleteScript,
      totalRows: allRows.length,
      totalFiles: files.length,
    });
  } catch (err) {
    console.error("generate-sql error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao processar o arquivo." },
      { status: 500 }
    );
  }
}
