import QRCode from "qrcode";

/**
 * O QR Code representa exatamente a mesma compra que o código curto (spec seção 8):
 * codifica apenas o shortCode como texto puro, sem IDs internos nem dados pessoais.
 * O leitor operacional trata o valor lido de forma idêntica à digitação manual do código.
 */
export async function generateTicketQrCodeDataUrl(shortCode: string): Promise<string> {
  return QRCode.toDataURL(shortCode, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 320,
  });
}
