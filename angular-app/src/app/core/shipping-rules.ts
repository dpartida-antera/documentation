import { AddressInfo, AddressKey, ShippingDoc, ShippingFlags, ShippingResult } from './models';

/** Address metadata: name, data source, and the expected address-block fields. */
export const ADDR: Record<AddressKey, AddressInfo> = {
  order:         { name: 'Order Shipping Address', source: 'Order, customer address on the order', fields: ['shippingCustomerName','shippingCompanyName','shippingCustomerEmail','shippingStreet','shippingStreet2 (cond.)','shippingCity','shippingState','shippingPostalCode','shippingCountry','shippingPhone (cond.)'] },
  alternate:     { name: 'Alternate Ship To Address', source: 'Alternate Ship To override fields', fields: ['accountName','email','shipAddress1','shipAddress2 (cond.)','shipCity','shipState','shipPostalCode','shipCountry','shipPhone (cond.)'] },
  firstDecorator:{ name: 'First Decorator Address', source: "First decorator vendor's shipping address", fields: ['accountName','email','shipAddress1','shipAddress2 (cond.)','shipCity','shipState','shipPostalCode','shipCountry'] },
  secondBeyond:  { name: 'Second & Beyond Decorator', source: 'Next decorator vendor in the chain, every non-final PO hands off here', fields: ['accountName','email','shipAddress1','shipAddress2 (cond.)','shipCity','shipState','shipPostalCode','shipCountry'] },
  warehouse:     { name: 'Destination Warehouse', source: 'Configured Destination Warehouse address', fields: ['Warehouse Name','Address 1','Address 2 (cond.)','City','State','Postal Code','Country','Phone'] },
  corpIdentity:  { name: 'Corporate Identity Address', source: 'Corporate Identity on the account', fields: ['Corporate Identity Name','Shipping Street','Shipping City','Shipping State','Shipping Postal Code','Shipping Country','Phone'] },
  partner:       { name: 'Partner Address', source: 'System, your Partner Company record', fields: ['Partner Company','Partner Address','Partner Address 2 (cond.)','Partner City','Partner State','Partner Postal Code','Partner Country','Partner Phone'] },
};

/** Origin (ships-from) per document. */
export const SHIPFROM: Record<ShippingDoc, string> = {
  blank:     'Blank Supplier, the Vendor that provides the undecorated goods',
  decorator: 'Decoration Vendor, the decorator this PO is issued to (a non-final PO ships from the previous decorator)',
  supplier:  'Supplier, the same Vendor provides the product and the decoration',
};

/** Blank PO routing. */
export function decideBlank(f: ShippingFlags): ShippingResult {
  if (f.alternateShipTo) return { a: 'alternate', p: ['Alternate Ship To = Yes'] };
  if (!f.decorated) {
    if (f.shipToUsUponCompletion) {
      if (f.destWarehouse) return { a: 'warehouse', p: ['Not decorated','Ship to Us Upon Completion','Destination Warehouse = Yes'] };
      if (f.corpIdentity) return { a: 'corpIdentity', p: ['Not decorated','Ship to Us Upon Completion','No warehouse','Corporate Identity = Yes'] };
      return { a: 'partner', p: ['Not decorated','Ship to Us Upon Completion','No warehouse','No corporate identity'] };
    }
    return { a: 'order', p: ['Not decorated','No alternate','No Ship to Us','to Customer'] };
  }
  if (f.shipToUsInstead) {
    if (f.destWarehouse) return { a: 'warehouse', p: ['Decorated','Ship to Us Instead of Decorator','Destination Warehouse = Yes'] };
    if (f.corpIdentity) return { a: 'corpIdentity', p: ['Decorated','Ship to Us Instead of Decorator','No warehouse','Corporate Identity = Yes'] };
    return { a: 'partner', p: ['Decorated','Ship to Us Instead of Decorator','No warehouse','No corporate identity'] };
  }
  return { a: 'firstDecorator', p: ['Decorated','No alternate','No Ship to Us'] };
}

/** Decorator and Supplier Decorated PO routing (shared chain logic). */
export function decideChain(f: ShippingFlags): ShippingResult {
  const isFinal = !f.additionalVendors || !!f.isFinalPO;
  if (!isFinal) return { a: 'secondBeyond', p: ['Additional vendors','NOT the final PO','hand off to the next decorator'] };
  if (f.alternateShipTo) return { a: 'alternate', p: ['Final PO','Alternate Ship To = Yes'] };
  if (f.shipToUsUponCompletion) {
    if (f.destWarehouse) return { a: 'warehouse', p: ['Final PO','No alternate','Ship to Us Upon Completion','Destination Warehouse = Yes'] };
    if (f.corpIdentity) return { a: 'corpIdentity', p: ['Final PO','No alternate','Ship to Us Upon Completion','No warehouse','Corporate Identity = Yes'] };
    return { a: 'partner', p: ['Final PO','No alternate','Ship to Us Upon Completion','No warehouse','No corporate identity'] };
  }
  return { a: 'order', p: ['Final PO','No alternate','No Ship to Us','to Customer'] };
}

export function decide(doc: ShippingDoc, f: ShippingFlags): ShippingResult {
  return doc === 'blank' ? decideBlank(f) : decideChain(f);
}
