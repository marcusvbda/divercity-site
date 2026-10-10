export function isAdvancePurchaseEnabled() {
  return process.env.ADVANCE_PURCHASE_ENABLED !== 'false'
}
