export interface ItemCotizacion {
  id: string;
  referencia: string;
  cantidad: number;
  /** Área en m². Cadena vacía = sin área (ej. motores, controles). */
  area: string;
  precioTotal: number;
}

export interface EspacioCotizacion {
  id: string;
  nombre: string;
  items: ItemCotizacion[];
}

export interface CotizacionData {
  numero: string;
  ciudad: string;
  fecha: string;
  cliente: string;
  asesor: string;
  whatsapp: string;
  descuentoPct: number;
  observaciones: string;
  terminos: string;
  espacios: EspacioCotizacion[];
}

export const TERMINOS_DEFAULT = `Método de pago: efectivo o transferencia. Abono inicial del 50%, saldo contra entrega verificado el funcionamiento.
Tiempos de producción: enrollables y panel japonés 4 días hábiles, cortina contemporánea 10 días hábiles, Vertess y Doha 8 días hábiles.
Garantías: persianas 5 años, motores RF/WiFi y controles 2 años, cortinas contemporáneas 1 año, instalación y accesorios 1 año.
No se realizan devoluciones de dinero una vez se solicite material o se inicie fabricación.
Cambios en la red WiFi/router del cliente requieren nueva configuración con costo adicional, no cubierta por garantía.
Reprogramaciones por causas del cliente pueden generar costos adicionales.
Trabajos no incluidos en esta cotización se facturan por separado.
Validez de la cotización: 30 días.
El valor final puede variar con la rectificación de medidas.`;

export const WHATSAPP_DEFAULT = "+57 300 123 4567";

export function calcularTotales(data: Pick<CotizacionData, "espacios" | "descuentoPct">) {
  const subtotal = data.espacios.reduce(
    (accEspacio, espacio) =>
      accEspacio + espacio.items.reduce((accItem, item) => accItem + (item.precioTotal || 0), 0),
    0
  );
  const descuento = subtotal * ((data.descuentoPct || 0) / 100);
  const total = subtotal - descuento;
  return { subtotal, descuento, total };
}

export function formatearCOP(valor: number): string {
  const redondeado = Math.round(valor);
  const conPuntos = Math.abs(redondeado)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${redondeado < 0 ? "-" : ""}$ ${conPuntos}`;
}
