"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  CotizacionData,
  EspacioCotizacion,
  ItemCotizacion,
  TERMINOS_DEFAULT,
  TIPOS_ITEM,
  TipoItem,
  WHATSAPP_DEFAULT,
  calcularItem,
  calcularMargenInterno,
  calcularTotales,
  formatearCOP,
} from "@/lib/types";

function nuevoId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function nuevoItem(): ItemCotizacion {
  return calcularItem({
    id: nuevoId(),
    tipo: "tela",
    referencia: "",
    cantidad: 1,
    ancho: "",
    largo: "",
    precioM2: 0,
    precioUnitario: 0,
    area: "",
    precioTotal: 0,
    nuestroPrecio: 0,
  });
}

function placeholderReferencia(tipo: TipoItem): string {
  return tipo === "tela"
    ? "Ej: velo tela cesto - confección al 2,8"
    : "Ej: motor radiofrecuencia cortina contemporánea";
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
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
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
  const { costoTotal, precioVentaTotal, margen, margenPct } = calcularMargenInterno({
    espacios,
    descuentoPct,
  });

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
                i.id === itemId ? calcularItem({ ...i, ...cambios }) : i
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
      telefono,
      direccion,
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
            <Campo label="Teléfono">
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Teléfono del cliente"
                className="input"
              />
            </Campo>
            <Campo label="Dirección">
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Dirección de instalación"
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

              <div className="space-y-3">
                {espacio.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-md border border-navy/10 bg-cream/40 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                        <Campo label="Tipo de ítem">
                          <select
                            value={item.tipo}
                            onChange={(e) =>
                              actualizarItem(espacio.id, item.id, {
                                tipo: e.target.value as TipoItem,
                              })
                            }
                            className="input"
                          >
                            {TIPOS_ITEM.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </Campo>
                        <Campo label="Descripción / referencia">
                          <input
                            type="text"
                            value={item.referencia}
                            onChange={(e) =>
                              actualizarItem(espacio.id, item.id, {
                                referencia: e.target.value,
                              })
                            }
                            placeholder={placeholderReferencia(item.tipo)}
                            className="input"
                          />
                        </Campo>
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarItem(espacio.id, item.id)}
                        className="mt-6 shrink-0 text-navy/40 hover:text-red-600"
                        aria-label="Eliminar ítem"
                        title="Eliminar ítem"
                      >
                        ✕
                      </button>
                    </div>

                    {item.tipo === "tela" ? (
                      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                        <Campo label="Ancho (m)">
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={item.ancho}
                            onChange={(e) =>
                              actualizarItem(espacio.id, item.id, {
                                ancho: e.target.value,
                              })
                            }
                            className="input"
                          />
                        </Campo>
                        <Campo label="Largo (m)">
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={item.largo}
                            onChange={(e) =>
                              actualizarItem(espacio.id, item.id, {
                                largo: e.target.value,
                              })
                            }
                            className="input"
                          />
                        </Campo>
                        <Campo label="Precio por m² (COP)">
                          <input
                            type="number"
                            min={0}
                            step="1"
                            value={item.precioM2}
                            onChange={(e) =>
                              actualizarItem(espacio.id, item.id, {
                                precioM2: Number(e.target.value),
                              })
                            }
                            className="input"
                          />
                        </Campo>
                        <Campo label="Cantidad">
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
                        </Campo>
                        <Campo label="Área">
                          <div className="input flex cursor-not-allowed items-center bg-navy/5 text-navy/60">
                            Área: {item.area !== "" ? item.area : "0.00"} m²
                          </div>
                        </Campo>
                        <Campo label="Precio total del ítem">
                          <div className="input flex cursor-not-allowed items-center bg-navy/5 font-medium text-navy/70">
                            {formatearCOP(item.precioTotal || 0)}
                          </div>
                        </Campo>
                      </div>
                    ) : (
                      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <Campo label="Cantidad">
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
                        </Campo>
                        <Campo label="Precio unitario (COP)">
                          <input
                            type="number"
                            min={0}
                            step="1"
                            value={item.precioUnitario}
                            onChange={(e) =>
                              actualizarItem(espacio.id, item.id, {
                                precioUnitario: Number(e.target.value),
                              })
                            }
                            className="input"
                          />
                        </Campo>
                        <Campo label="Precio total del ítem">
                          <div className="input flex cursor-not-allowed items-center bg-navy/5 font-medium text-navy/70">
                            {formatearCOP(item.precioTotal || 0)}
                          </div>
                        </Campo>
                      </div>
                    )}

                    {/* Costo interno — solo para el resumen de margen en pantalla, nunca va al PDF */}
                    <div className="mt-3 flex flex-wrap items-end gap-3 rounded-md border border-dashed border-amber-400 bg-amber-50 p-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                        🔒 Solo interno
                      </span>
                      <div className="w-48">
                        <Campo label="Nuestro precio (costo, COP)">
                          <input
                            type="number"
                            min={0}
                            step="1"
                            value={item.nuestroPrecio}
                            onChange={(e) =>
                              actualizarItem(espacio.id, item.id, {
                                nuestroPrecio: Number(e.target.value),
                              })
                            }
                            className="input border-amber-300 bg-white focus:border-amber-500"
                          />
                        </Campo>
                      </div>
                    </div>
                  </div>
                ))}
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

        {/*
          Resumen interno de margen — SOLO para uso interno del cotizador.
          No se envía a la API de generación de PDF ni se referencia en
          CotizacionDocument, así que bajo ninguna circunstancia aparece
          en el PDF entregado al cliente.
        */}
        <section className="rounded-lg border-2 border-dashed border-amber-500 bg-amber-50 p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg">🔒</span>
            <h2 className="font-serif text-lg font-semibold text-amber-900">
              Resumen interno de margen
            </h2>
          </div>
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-amber-700">
            Solo visible aquí — nunca se incluye en el PDF
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-amber-700">
                Nuestro costo total
              </p>
              <p className="text-lg font-semibold text-amber-950">
                {formatearCOP(costoTotal)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-amber-700">
                Precio de venta total
              </p>
              <p className="text-lg font-semibold text-amber-950">
                {formatearCOP(precioVentaTotal)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-amber-700">Margen</p>
              <p className="text-lg font-semibold text-amber-950">
                {formatearCOP(margen)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-amber-700">Margen %</p>
              <p className="text-lg font-semibold text-amber-950">
                {margenPct.toFixed(1)}%
              </p>
            </div>
          </div>
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
