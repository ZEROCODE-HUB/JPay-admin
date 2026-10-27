/** Descarga la imagen del QR como PNG. No hace nada si la imagen todavía no se generó. */
export function descargarQrPng(qrDataUrl: string, id: string): void {
  if (qrDataUrl) {
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qr-${id}.png`;
    a.click();
  }
}

/** Abre una ventana con la imagen del QR y lanza la impresión al cargarla. */
export function imprimirQr(qrDataUrl: string): void {
  if (qrDataUrl) {
    const w = window.open();
    if (w) w.document.write(`<img src="${qrDataUrl}" onload="window.print()"/>`);
  }
}
