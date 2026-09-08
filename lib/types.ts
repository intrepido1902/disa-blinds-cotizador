export type TipoItem =
  | "tela"
  | "motor"
  | "control"
  | "minibridge"
  | "perfil"
  | "otro";

export const TIPOS_ITEM: { value: TipoItem; label: string }[] = [
  { value: "tela", label: "Tela / Confección" },
  { value: "motor", label: "Motor" },
  { value: "control", label: "Control" },
  { value: "minibridge", label: "Mini bridge / Domótica" },
  { value: "perfil", label: "Perfil / Riel" },
  { value: "otro", label: "Otro (accesorio)" },
];

export interface ItemCotizacion {
  id: string;
  tipo: TipoItem;
  referencia: string;
  cantidad: number;
  /** Solo aplica a tipo "tela": ancho de la ventana en metros. */
  ancho: string;
  /** Solo aplica a tipo "tela": largo de la ventana en metros. */
  largo: string;
  /** Solo aplica a tipo "tela": precio por m² en COP. */
  precioM2: number;
  /** Solo aplica a tipos distintos de "tela": precio unitario en COP. */
  precioUnitario: number;
  /** Área en m², calculada automáticamente para tipo "tela". Cadena vacía = sin área (resto de tipos). */
  area: string;
  /** Calculado automáticamente según el tipo de ítem. */
  precioTotal: number;
}

/**
 * Recalcula el área y el precio total de un ítem según su tipo.
 * "tela": área = ancho × largo; precio total = ancho × largo × precioM2 × cantidad.
 * Cualquier otro tipo: sin área; precio total = precioUnitario × cantidad.
 */
export function calcularItem(item: ItemCotizacion): ItemCotizacion {
  const cantidad = item.cantidad || 0;

  if (item.tipo === "tela") {
    const ancho = parseFloat(item.ancho) || 0;
    const largo = parseFloat(item.largo) || 0;
    const precioM2 = item.precioM2 || 0;
    const areaNum = ancho * largo;
    return {
      ...item,
      area: ancho > 0 && largo > 0 ? areaNum.toFixed(2) : "",
      precioTotal: areaNum * precioM2 * cantidad,
    };
  }

  const precioUnitario = item.precioUnitario || 0;
  return {
    ...item,
    area: "",
    precioTotal: precioUnitario * cantidad,
  };
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
