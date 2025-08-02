export type CustomerPurchaseID = string;

export interface ValidCustomerRecord {
  id: CustomerPurchaseID;
  customer_billing_api_key: string;
  vendor_billing_api_key: string;
}
