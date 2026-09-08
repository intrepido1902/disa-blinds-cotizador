import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { CotizacionData, calcularTotales, formatearCOP } from "../types";

const NAVY = "#0b2447";
const GOLD = "#c9a24b";
const CREAM = "#f7f4ee";
const GRAY = "#4a4a4a";
const BORDER = "#e2ddd0";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: NAVY,
  },

  // Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  logo: {
    width: 150,
    objectFit: "contain",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  title: {
    fontFamily: "Times-Bold",
    fontSize: 22,
    color: NAVY,
    letterSpacing: 1,
  },
  numero: {
    fontFamily: "Times-Bold",
    fontSize: 12,
    color: GOLD,
    marginTop: 2,
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: GOLD,
    marginBottom: 14,
  },

  // Info rows
  infoRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: GOLD,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 10,
    color: NAVY,
  },

  intro: {
    marginTop: 10,
    marginBottom: 14,
    fontSize: 9.5,
    lineHeight: 1.5,
    color: GRAY,
  },

  // Table
  table: {
    borderWidth: 1,
    borderColor: BORDER,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: NAVY,
  },
  tableHeaderCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: "#ffffff",
    paddingVertical: 6,
    paddingHorizontal: 6,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  espacioRow: {
    flexDirection: "row",
    backgroundColor: CREAM,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  espacioCell: {
    fontFamily: "Times-Bold",
    fontSize: 10.5,
    color: GOLD,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  itemRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  itemCell: {
    fontSize: 9,
    color: NAVY,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  colReferencia: { width: "46%" },
  colCantidad: { width: "14%", textAlign: "center" },
  colArea: { width: "16%", textAlign: "center" },
  colPrecio: { width: "24%", textAlign: "right" },

  // Totales
  totalsBlock: {
    marginTop: 12,
    alignSelf: "flex-end",
    width: "55%",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalsLabel: {
    fontSize: 9.5,
    color: GRAY,
  },
  totalsValue: {
    fontSize: 9.5,
    color: NAVY,
  },
  totalFinalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: NAVY,
    marginTop: 4,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  totalFinalLabel: {
    fontFamily: "Times-Bold",
    fontSize: 12,
    color: "#ffffff",
  },
  totalFinalValue: {
    fontFamily: "Times-Bold",
    fontSize: 12,
    color: GOLD,
  },

  // Contacto
  contacto: {
    marginTop: 16,
    fontSize: 9.5,
    color: NAVY,
  },
  contactoBold: {
    fontFamily: "Helvetica-Bold",
  },

  // Secciones (observaciones / terminos)
  section: {
    marginTop: 14,
  },
  sectionTitle: {
    fontFamily: "Times-Bold",
    fontSize: 11.5,
    color: NAVY,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: GOLD,
    paddingBottom: 3,
  },
  paragraph: {
    fontSize: 9,
    lineHeight: 1.5,
    color: GRAY,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  bulletMark: {
    width: 10,
    fontSize: 9,
    color: GOLD,
  },
  bulletText: {
    flex: 1,
    fontSize: 8.7,
    lineHeight: 1.4,
    color: GRAY,
  },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#9a9a9a",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 6,
  },
});

function parseTerminos(texto: string): string[] {
  const porLinea = texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (porLinea.length > 1) return porLinea;

  // fallback: un solo bloque de texto, separar por puntos seguidos
  return texto
    .split(/(?<=\.)\s+(?=[A-ZÁÉÍÓÚÑ])/)
    .map((l) => l.trim())
    .filter(Boolean);
}

interface Props {
  data: CotizacionData;
  logoDataUri: string | null;
}

export default function CotizacionDocument({ data, logoDataUri }: Props) {
  const { subtotal, descuento, total } = calcularTotales(data);
  const terminosItems = parseTerminos(data.terminos || "");

  return (
    <Document
      title={`Cotización ${data.numero || ""} - Disa Blinds`}
      author="Disa Blinds"
    >
      <Page size="A4" style={styles.page} wrap>
        {/* Encabezado */}
        <View style={styles.headerRow}>
          {logoDataUri ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={logoDataUri} style={styles.logo} />
          ) : (
            <View />
          )}
          <View style={styles.headerRight}>
            <Text style={styles.title}>COTIZACIÓN</Text>
            <Text style={styles.numero}>No. {data.numero || "—"}</Text>
          </View>
        </View>
        <View style={styles.divider} />

        {/* Ciudad / Fecha */}
        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Ciudad</Text>
            <Text style={styles.infoValue}>{data.ciudad || "—"}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Fecha</Text>
            <Text style={styles.infoValue}>{data.fecha || "—"}</Text>
          </View>
        </View>

        {/* Cliente / Asesor */}
        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Cliente</Text>
            <Text style={styles.infoValue}>{data.cliente || "—"}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Asesor</Text>
            <Text style={styles.infoValue}>{data.asesor || "—"}</Text>
          </View>
        </View>

        {/* Intro */}
        <Text style={styles.intro}>
          Agradecemos la oportunidad de presentarle esta propuesta. A continuación
          encontrará el detalle de los productos y servicios cotizados por Disa
          Blinds para su proyecto, elaborados con materiales de alta calidad y
          acabados de lujo.
        </Text>

        {/* Tabla */}
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, styles.colReferencia]}>
              Referencia
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colCantidad]}>
              Cantidad
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colArea]}>
              Área (m²)
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colPrecio]}>
              Precio total
            </Text>
          </View>

          {data.espacios.map((espacio) => (
            <View key={espacio.id} wrap={false}>
              <View style={styles.espacioRow}>
                <Text style={styles.espacioCell}>{espacio.nombre || "Espacio"}</Text>
              </View>
              {espacio.items.map((item) => (
                <View style={styles.itemRow} key={item.id}>
                  <Text style={[styles.itemCell, styles.colReferencia]}>
                    {item.referencia}
                  </Text>
                  <Text style={[styles.itemCell, styles.colCantidad]}>
                    {item.cantidad}
                  </Text>
                  <Text style={[styles.itemCell, styles.colArea]}>
                    {item.area !== "" && item.area !== undefined ? item.area : ""}
                  </Text>
                  <Text style={[styles.itemCell, styles.colPrecio]}>
                    {formatearCOP(item.precioTotal || 0)}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Totales */}
        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{formatearCOP(subtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>
              Descuento ({data.descuentoPct || 0}%)
            </Text>
            <Text style={styles.totalsValue}>- {formatearCOP(descuento)}</Text>
          </View>
          <View style={styles.totalFinalRow}>
            <Text style={styles.totalFinalLabel}>TOTAL</Text>
            <Text style={styles.totalFinalValue}>{formatearCOP(total)}</Text>
          </View>
        </View>

        {/* Contacto */}
        <Text style={styles.contacto}>
          <Text style={styles.contactoBold}>Contacto WhatsApp: </Text>
          {data.whatsapp || "—"}
        </Text>

        {/* Observaciones */}
        {data.observaciones && data.observaciones.trim() !== "" && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Observaciones</Text>
            <Text style={styles.paragraph}>{data.observaciones}</Text>
          </View>
        )}

        {/* Términos y condiciones */}
        {terminosItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Términos y condiciones</Text>
            {terminosItems.map((linea, i) => (
              <View style={styles.bulletRow} key={i}>
                <Text style={styles.bulletMark}>•</Text>
                <Text style={styles.bulletText}>{linea}</Text>
              </View>
            ))}
          </View>
        )}

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
