import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** Genera (async) la imagen PNG en data URL del valor dado; "" mientras se genera o si falla. */
export function useQrDataUrl(value: string): string {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, { width: 260, margin: 2 })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => setQrDataUrl(""));
    return () => {
      cancelled = true;
    };
  }, [value]);

  return qrDataUrl;
}
