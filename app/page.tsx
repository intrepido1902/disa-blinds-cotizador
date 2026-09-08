"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  CotizacionData,
  EspacioCotizacion,
  ItemCotizacion,
  TERMINOS_DEFAULT,
  WHATSAPP_DEFAULT,
  calcularTotales,
  formatearCOP,
} from "@/lib/types";

function nuevoId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function nuevoItem(): ItemCotizacion {
  return { id: nuevoId(), referencia: "", cantidad: 1, area: "", precioTotal: 0 };
}

function nuevoEspacio(nombre = ""): EspacioCotizacion {
  return { id: nuevoId(), nombre, items: [nuevoItem()] };
}

function hoyISO(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export default function Home() {
  const [numero, setNumero] = useState("");
  const [ciudad, setCiudad] = useState("Bogotá");
  const [fecha, setFecha] = useState("");
  const [cliente, setCliente] = useState("");
  const [asesor, setAsesor] = useState("");
  const [whatsapp, setWhatsapp] = useState(WHATSAPP_DEFAULT);
  const [descuentoPct, setDescuentoPct] = useState(0);
  const [observaciones, setObservaciones] = useState("");
  const [terminos, setTerminos] = useState(TERMINOS_DEFAULT);
  const [espacios, setEspacios] = useState<EspacioCotizacion[]>([
    nuevoEspacio("Sala"),
  ]);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // La fecha por defecto se fija en el cliente para evitar
  // discrepancias de zona horaria entre servidor y navegador.
  useEffect(() => {
    setFecha(hoyISO());
  }, []);

  const { subtotal, descuento, total } = calcularTotales({ espacios, descuentoPct });

  function agregarEspacio() {
    setEspacios((prev) => [...prev, nuevoEspacio("")]);
  }

  function eliminarEspacio(espacioId: string) {
    setEspacios((prev) => prev.filter((e) => e.id !== espacioId));
  }

  function actualizarEspacio(espacioId: string, nombre: string) {
    setEspacios((prev) =>
      prev.map((e) => (e.id === espacioId ? { ...e, nombre } : e))
    );
  }

  function agregarItem(espacioId: string) {
    setEspacios((prev) =>
      prev.map((e) =>
        e.id === espacioId ? { ...e, items: [...e.items, nuevoItem()] } : e
      )
    );
  }

  function eliminarItem(espacioId: string, itemId: string) {
    setEspacios((prev) =>
      prev.map((e) =>
        e.id === espacioId
          ? { ...e, items: e.items.filter((i) => i.id !== itemId) }
          : e
      )
    );
  }

  function actualizarItem(
    espacioId: string,
    itemId: string,
    cambios: Partial<ItemCotizacion>
  ) {
    setEspacios((prev) =>
      prev.map((e) =>
        e.id === espacioId
          ? {
              ...e,
              items: e.items.map((i) =>
                i.id === itemId ? { ...i, ...cambios } : i
              ),
            }
          : e
      )
    );
  }

  async function generarPDF() {
    setError(null);

    if (!numero.trim()) {
      setError("Ingresa el número de cotización antes de generar el PDF.");
      return;
    }

    const data: CotizacionData = {
      numero,
      ciudad,
      fecha,
      cliente,
      asesor,
      whatsapp,
      descuentoPct,
      observaciones,
      terminos,
      espacios,
    };

    setGenerando(true);
    try {
      const res = await fetch("/api/cotizacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => null);
        throw new Error(msg?.error || "No fue posible generar el PDF.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cotizacion-${numero || "sin-numero"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ocurrió un error inesperado.");
    } finally {
      setGenerando(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream pb-24">
      <header className="bg-navy text-white">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-5">
          <Image
            src="/logo.jpeg"
            alt="Disa Blinds"
            width={140}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
          <div>
            <h1 className="font-serif text-xl font-semibold tracking-wide text-white">
              Cotizador
            </h1>
            <p className="text-xs text-gold-light/80">
              Textiles y persianas de lujo &mdash; Colombia
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8 space-y-8">
        {/* Datos generales */}
        <section className="rounded-lg border border-navy/10 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-lg font-semibold text-navy mb-4">
            Datos generales
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Campo label="Número de cotización">
              <input
                type="text"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="Ej: 2026-001"
                className="input"
              />
            </Campo>
            <Campo label="Ciudad">
              <input
                type="text"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                className="input"
              />
            </Campo>
            <Campo label="Fecha">
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="input"
              />
            </Campo>
            <Campo label="Cliente">
              <input
                type="text"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Nombre del cliente"
                className="input"
              />
            </Campo>
            <Campo label="Asesor">
              <input
                type="text"
                value={asesor}
                onChange={(e) => setAsesor(e.target.value)}
                placeholder="Nombre del asesor"
                className="input"
              />
            </Campo>
            <Campo label="WhatsApp de contacto">
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="input"
              />
            </Campo>
            <Campo label="Descuento (%)">
              <input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={descuentoPct}
                onChange={(e) => setDescuentoPct(Number(e.target.value))}
                className="input"
              />
            </Campo>
          </div>
          <div className="mt-4">
            <Campo label="Observaciones (opcional)">
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={3}
                placeholder="Notas adicionales para el cliente..."
                className="input resize-y"
              />
            </Campo>
          </div>
        </section>

        {/* Espacios e items */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-navy">
              Espacios e ítems
            </h2>
            <button
              type="button"
              onClick={agregarEspacio}
              className="btn-gold"
            >
              + Agregar espacio
            </button>
          </div>

          {espacios.length === 0 && (
            <p className="rounded-lg border border-dashed border-navy/20 bg-white p-6 text-center text-sm text-navy/50">
              Aún no hay espacios. Agrega uno para comenzar a cotizar.
            </p>
          )}

          {espacios.map((espacio, idx) => (
            <div
              key={espacio.id}
              className="rounded-lg border border-navy/10 bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-3">
                <input
                  type="text"
                  value={espacio.nombre}
                  onChange={(e) => actualizarEspacio(espacio.id, e.target.value)}
                  placeholder={`Nombre del espacio (ej: Sala)`}
                  className="input flex-1 font-serif text-base font-semibold text-navy"
                />
                <button
                  type="button"
                  onClick={() => eliminarEspacio(espacio.id)}
                  className="btn-danger"
                  aria-label={`Eliminar espacio ${idx + 1}`}
                >
                  Eliminar espacio
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-navy/10 text-left text-xs uppercase tracking-wide text-navy/50">
                      <th className="py-2 pr-2 font-medium">Referencia / descripción</th>
                      <th className="py-2 px-2 font-medium w-24">Cantidad</th>
                      <th className="py-2 px-2 font-medium w-28">Área (m²)</th>
                      <th className="py-2 px-2 font-medium w-40">Precio total (COP)</th>
                      <th className="py-2 pl-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {espacio.items.map((item) => (
                      <tr key={item.id} className="border-b border-navy/5">
                        <td className="py-2 pr-2">
                          <input
                            type="text"
                            value={item.referencia}
                            onChange={(e) =>
                              actualizarItem(espacio.id, item.id, {
                                referencia: e.target.value,
                              })
                            }
                            placeholder="Ej: velo tela cesto - confección al 2,8"
                            className="input"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min={0}
                            step="1"
                            value={item.cantidad}
                            onChange={(e) =>
                              actualizarItem(espacio.id, item.id, {
                                cantidad: Number(e.target.value),
                              })
                            }
                            className="input"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={item.area}
                            onChange={(e) =>
                              actualizarItem(espacio.id, item.id, {
                                area: e.target.value,
                              })
                            }
                            placeholder="—"
                            className="input"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min={0}
                            step="1"
                            value={item.precioTotal}
                            onChange={(e) =>
                              actualizarItem(espacio.id, item.id, {
                                precioTotal: Number(e.target.value),
                              })
                            }
                            className="input"
                          />
                        </td>
                        <td className="py-2 pl-2 text-center">
                          <button
                            type="button"
                            onClick={() => eliminarItem(espacio.id, item.id)}
                            className="text-navy/40 hover:text-red-600"
                            aria-label="Eliminar ítem"
                            title="Eliminar ítem"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={() => agregarItem(espacio.id)}
                className="mt-3 text-sm font-medium text-gold hover:text-navy"
              >
                + Agregar ítem
              </button>
            </div>
          ))}
        </section>

        {/* Términos y condiciones */}
        <section className="rounded-lg border border-navy/10 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-lg font-semibold text-navy mb-4">
            Términos y condiciones
          </h2>
          <textarea
            value={terminos}
            onChange={(e) => setTerminos(e.target.value)}
            rows={10}
            className="input resize-y font-mono text-xs leading-relaxed"
          />
        </section>

        {/* Totales y acción */}
        <section className="sticky bottom-4 rounded-lg border border-gold/40 bg-navy p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between gap-8 sm:justify-start">
                <span className="text-white/60">Subtotal</span>
                <span>{formatearCOP(subtotal)}</span>
              </div>
              <div className="flex justify-between gap-8 sm:justify-start">
                <span className="text-white/60">Descuento ({descuentoPct || 0}%)</span>
                <span>- {formatearCOP(descuento)}</span>
              </div>
              <div className="flex justify-between gap-8 sm:justify-start font-serif text-lg font-semibold text-gold">
                <span>Total</span>
                <span>{formatearCOP(total)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={generarPDF}
              disabled={generando}
              className="btn-gold-lg"
            >
              {generando ? "Generando..." : "Generar PDF"}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-300">{error}</p>
          )}
        </section>
      </div>
    </main>
  );
}

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-navy/60">
        {label}
      </span>
      {children}
    </label>
  );
}
