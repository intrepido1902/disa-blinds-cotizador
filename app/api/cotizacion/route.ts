import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import fs from "node:fs";
import path from "node:path";
import CotizacionDocument from "@/lib/pdf/CotizacionDocument";
import { CotizacionData } from "@/lib/types";

export const runtime = "nodejs";

function cargarLogoDataUri(): string | null {
  try {
    const logoPath = path.join(process.cwd(), "public", "logo.jpeg");
    const buffer = fs.readFileSync(logoPath);
    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

function sanitizarNombreArchivo(numero: string): string {
  const limpio = (numero || "sin-numero")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return limpio || "sin-numero";
}

export async function POST(request: NextRequest) {
  let data: CotizacionData;

  try {
    data = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de la solicitud inválido." },
      { status: 400 }
    );
  }

  if (!data || !Array.isArray(data.espacios)) {
    return NextResponse.json(
      { error: "Datos de cotización incompletos." },
      { status: 400 }
    );
  }

  try {
    const logoDataUri = cargarLogoDataUri();
    const buffer = await renderToBuffer(
      CotizacionDocument({ data, logoDataUri })
    );

    const nombreArchivo = `cotizacion-${sanitizarNombreArchivo(data.numero)}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${nombreArchivo}"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch (error) {
    console.error("Error generando el PDF de cotización:", error);
    return NextResponse.json(
      { error: "No fue posible generar el PDF." },
      { status: 500 }
    );
  }
}
