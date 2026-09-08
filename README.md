# Cotizador Disa Blinds

Sistema web para generar cotizaciones en PDF para Disa Blinds (cortinas y persianas de lujo). Sin base de datos: el formulario se llena en el navegador y el PDF se genera al vuelo en el servidor.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS v4 · [@react-pdf/renderer](https://react-pdf.org/)

## Correr en local

```bash
npm install   # solo la primera vez
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000), llena la cotización y haz clic en **Generar PDF**.

## Build de producción

```bash
npm run build
npm start
```

`npm run build` corre el chequeo de tipos y ESLint; si pasa sin errores, el proyecto está listo para desplegar.

## Estructura relevante

- `app/page.tsx` — formulario (datos generales, espacios/ítems dinámicos, totales en vivo).
- `app/api/cotizacion/route.ts` — API route que genera el PDF con `@react-pdf/renderer` (runtime Node.js) y lo devuelve como archivo descargable.
- `lib/pdf/CotizacionDocument.tsx` — plantilla del PDF (encabezado con logo, tabla por espacios, totales, observaciones, términos y condiciones).
- `lib/types.ts` — tipos compartidos, cálculo de totales, formato de moneda COP y texto por defecto de términos y condiciones.
- `public/logo.jpeg` — logo de Disa Blinds usado en la web y en el PDF.

## Notas

- El WhatsApp de contacto por defecto está en `lib/types.ts` (`WHATSAPP_DEFAULT`) — actualízalo con el número real.
- No hay autenticación ni persistencia: cada cotización vive solo en el formulario hasta que se descarga el PDF.
