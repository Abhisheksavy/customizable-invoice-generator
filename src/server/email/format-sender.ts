/** Builds a From header like `"Juniper Studio" <billing@example.com>`, stripping header-breaking characters. */
export function formatSender(name: string, address: string): string {
  const safeName = name.replace(/["<>\\\r\n]/g, "").trim();
  return safeName ? `"${safeName}" <${address}>` : address;
}
