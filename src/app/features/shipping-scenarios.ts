import { decide, ADDR } from '../core/shipping-rules';
import { ShippingDoc, ShippingFlags } from '../core/models';
import { QaScenario } from '../shared/qa-runner.component';

interface RawShip { id: string; sec: string; title: string; cond: string[]; doc?: ShippingDoc; flags?: ShippingFlags; manualExpected?: string; knownIssue?: string; order?: string; }

const SECTIONS: Record<string, string> = {
  A:"Section A · Blank PO", B:"Section B · Decorator PO", C:"Section C · Supplier Decorated PO",
  D:"Section D · Field Mapping Validation", E:"Section E · Multi-Decoration Chain",
  F:"Section F · Priority / Conflict Resolution", G:"Section G · Store Orders",
  H:"Section H · Edge Case / Negative", P:"Section P · Cloning & Customer Portal (multi-vendor)"};

const RAW: RawShip[] = [
  // ---- A: Blank PO ----
  {id:"A-01",sec:"A",title:"No decoration, Alternate Ship To",doc:"blank",flags:{decorated:false,alternateShipTo:true},
   cond:["Decorated = No","Alternate Ship To = Yes"]},
  {id:"A-02",sec:"A",title:"Decorated, Ship to Us Instead of Decorator, Destination Warehouse",doc:"blank",flags:{decorated:true,shipToUsInstead:true,destWarehouse:true},
   cond:["Decorated = Yes","Alternate = No","Ship to Us Instead of Decorator = Yes","Destination Warehouse = Yes"],order:"https://prd.anterasaas.com/e-commerce/orders/dbd15176-5921-11f1-9447-0e9649c979d9"},
  {id:"A-03",sec:"A",title:"Decorated, Ship to Us, No Warehouse, Corporate Identity",doc:"blank",flags:{decorated:true,shipToUsInstead:true,corpIdentity:true},
   cond:["Decorated = Yes","Ship to Us Instead of Decorator = Yes","Destination Warehouse = No","Corporate Identity = Yes"],order:"https://prd.anterasaas.com/e-commerce/orders/70cdad32-5925-11f1-9447-0e9649c979d9"},
  {id:"A-04",sec:"A",title:"Decorated, Ship to Us, No Warehouse, No Corporate Identity",doc:"blank",flags:{decorated:true,shipToUsInstead:true},
   cond:["Decorated = Yes","Ship to Us Instead of Decorator = Yes","Destination Warehouse = No","Corporate Identity = No"],order:"https://prd.anterasaas.com/e-commerce/orders/3981739c-5926-11f1-9447-0e9649c979d9"},
  {id:"A-05",sec:"A",title:"Decorated, No Alternate, No Ship to Us",doc:"blank",flags:{decorated:true},
   cond:["Decorated = Yes","Alternate = No","Ship to Us Instead of Decorator = No"],
   order:"https://prd.anterasaas.com/e-commerce/orders/99442fdb-5926-11f1-9447-0e9649c979d9"},
  {id:"A-06",sec:"A",title:"No decoration, No Alternate, default flow",doc:"blank",flags:{decorated:false},
   cond:["Decorated = No","Alternate = No","Ship to Us = No"],order:"https://prd.anterasaas.com/e-commerce/orders/d3859e9c-5926-11f1-9447-0e9649c979d9"},
  {id:"A-07",sec:"A",title:"Ship to Us, cloned line item WITHOUT Ship to Us (split)",manualExpected:"Split shipment, line with Ship to Us goes to Us; the cloned line (Ship to Us = No) goes to the Decorator.",
   cond:["Decorated = No","Ship to Us Instead of Decorator = Yes","Cloned line item with Ship to Us = No"],
   order:"https://prd.anterasaas.com/e-commerce/orders/9ddab630-5aae-11f1-9447-0e9649c979d9"},
  {id:"A-08",sec:"A",title:"Customer Portal, Ship to Us on only one line item (split)",manualExpected:"Split shipment, the Ship-to-Us line goes to Us; the other line ships to the Decorator.",
   cond:["Customer Portal order","Decorated = No","Ship to Us Instead of Decorator = Yes (1 line item)"]},
  {id:"A-09",sec:"A",title:"Not decorated, Ship to Us Upon Completion, Destination Warehouse",doc:"blank",flags:{decorated:false,shipToUsUponCompletion:true,destWarehouse:true},
   cond:["Decorated = No","Alternate = No","Ship to Us Upon Completion = Yes","Destination Warehouse = Yes"]},
  {id:"A-10",sec:"A",title:"Not decorated, Ship to Us Upon Completion, No Warehouse, Corporate Identity",doc:"blank",flags:{decorated:false,shipToUsUponCompletion:true,corpIdentity:true},
   cond:["Decorated = No","Ship to Us Upon Completion = Yes","Destination Warehouse = No","Corporate Identity = Yes"]},
  {id:"A-11",sec:"A",title:"Not decorated, Ship to Us Upon Completion, No Warehouse, No Corporate Identity",doc:"blank",flags:{decorated:false,shipToUsUponCompletion:true},
   cond:["Decorated = No","Ship to Us Upon Completion = Yes","Destination Warehouse = No","Corporate Identity = No"]},

  // ---- B: Decorator PO ----
  {id:"B-01",sec:"B",title:"Alternate Ship To, No additional vendors",doc:"decorator",flags:{alternateShipTo:true},
   cond:["Alternate Ship To = Yes","Additional Vendors = No"],order:"https://prd.anterasaas.com/e-commerce/orders/fd2b9467-5926-11f1-9447-0e9649c979d9"},
  {id:"B-02",sec:"B",title:"Alternate Ship To, Additional vendors, NOT final PO",doc:"decorator",flags:{alternateShipTo:true,additionalVendors:true,isFinalPO:false},
   cond:["Alternate Ship To = Yes","Additional Vendors = Yes","This is NOT the final PO"],
   order:"https://prd.anterasaas.com/e-commerce/orders/3dd3dffd-5927-11f1-9447-0e9649c979d9"},
  {id:"B-03",sec:"B",title:"Alternate Ship To, Additional vendors, final PO",doc:"decorator",flags:{alternateShipTo:true,additionalVendors:true,isFinalPO:true},
   cond:["Alternate Ship To = Yes","Additional Vendors = Yes","This IS the final PO"],order:"https://prd.anterasaas.com/e-commerce/orders/dedccc83-5927-11f1-9447-0e9649c979d9"},
  {id:"B-04",sec:"B",title:"No Alternate, Additional vendors, final PO default",doc:"decorator",flags:{additionalVendors:true,isFinalPO:true},
   cond:["Alternate = No","Additional Vendors = Yes","Ship to Us Upon Completion = No"],order:"https://prd.anterasaas.com/e-commerce/orders/390f3d5f-5928-11f1-9447-0e9649c979d9"},
  {id:"B-05",sec:"B",title:"No Alternate, No additional vendors, default",doc:"decorator",flags:{},
   cond:["Alternate = No","Additional Vendors = No","Ship to Us Upon Completion = No"],order:"https://prd.anterasaas.com/e-commerce/orders/adf2de3d-5928-11f1-9447-0e9649c979d9"},
  {id:"B-06",sec:"B",title:"No Alternate, Additional vendors, Ship to Us, Destination Warehouse (final)",doc:"decorator",flags:{additionalVendors:true,isFinalPO:true,shipToUsUponCompletion:true,destWarehouse:true},
   cond:["Alternate = No","Additional Vendors = Yes","Ship to Us Upon Completion = Yes","Destination Warehouse = Yes"],order:"https://prd.anterasaas.com/e-commerce/orders/e6896bb9-5928-11f1-9447-0e9649c979d9"},
  {id:"B-07",sec:"B",title:"No Alternate, No additional vendors, Ship to Us, Destination Warehouse",doc:"decorator",flags:{shipToUsUponCompletion:true,destWarehouse:true},
   cond:["Alternate = No","Additional Vendors = No","Ship to Us Upon Completion = Yes","Destination Warehouse = Yes"],order:"https://prd.anterasaas.com/e-commerce/orders/9e441eb8-5929-11f1-9447-0e9649c979d9"},
  {id:"B-08",sec:"B",title:"No Alternate, Additional vendors, Ship to Us, No Warehouse, Corporate Identity (final)",doc:"decorator",flags:{additionalVendors:true,isFinalPO:true,shipToUsUponCompletion:true,corpIdentity:true},
   cond:["Alternate = No","Additional Vendors = Yes","Ship to Us Upon Completion = Yes","Destination Warehouse = No","Corporate Identity = Yes"],order:"https://prd.anterasaas.com/e-commerce/orders/debc77f7-5929-11f1-9447-0e9649c979d9"},
  {id:"B-09",sec:"B",title:"No Alternate, No additional vendors, Ship to Us, No Warehouse, Corporate Identity",doc:"decorator",flags:{shipToUsUponCompletion:true,corpIdentity:true},
   cond:["Alternate = No","Additional Vendors = No","Ship to Us Upon Completion = Yes","Destination Warehouse = No","Corporate Identity = Yes"],order:"https://prd.anterasaas.com/e-commerce/orders/90f07c09-593d-11f1-9447-0e9649c979d9"},
  {id:"B-10",sec:"B",title:"No Alternate, Ship to Us, No Warehouse, No Corporate Identity",doc:"decorator",flags:{shipToUsUponCompletion:true},
   cond:["Alternate = No","Ship to Us Upon Completion = Yes","Destination Warehouse = No","Corporate Identity = No"],order:"https://prd.anterasaas.com/e-commerce/orders/cd708a26-593d-11f1-9447-0e9649c979d9"},

  // ---- C: Supplier Decorated PO ----
  {id:"C-01",sec:"C",title:"Alternate Ship To, No additional vendors",doc:"supplier",flags:{alternateShipTo:true},
   cond:["Alternate Ship To = Yes","Additional Vendors = No"],order:"https://prd.anterasaas.com/e-commerce/orders/f5a7ca89-593d-11f1-9447-0e9649c979d9"},
  {id:"C-02",sec:"C",title:"Alternate Ship To, Additional vendors (non-final)",doc:"supplier",flags:{alternateShipTo:true,additionalVendors:true,isFinalPO:false},
   cond:["Alternate Ship To = Yes","Additional Vendors = Yes","This is NOT the final PO"],
   order:"https://prd.anterasaas.com/e-commerce/orders/0b334acc-5942-11f1-9447-0e9649c979d9"},
  {id:"C-03",sec:"C",title:"No Alternate, Ship to Us, Destination Warehouse",doc:"supplier",flags:{shipToUsUponCompletion:true,destWarehouse:true},
   cond:["Alternate = No","Ship to Us Upon Completion = Yes","Destination Warehouse = Yes"],order:"https://prd.anterasaas.com/e-commerce/orders/6c721bea-5942-11f1-9447-0e9649c979d9"},
  {id:"C-04",sec:"C",title:"No Alternate, Ship to Us, No Warehouse, Corporate Identity",doc:"supplier",flags:{shipToUsUponCompletion:true,corpIdentity:true},
   cond:["Alternate = No","Ship to Us Upon Completion = Yes","Destination Warehouse = No","Corporate Identity = Yes"],order:"https://prd.anterasaas.com/e-commerce/orders/bf4d3d16-5942-11f1-9447-0e9649c979d9"},
  {id:"C-05",sec:"C",title:"No Alternate, Ship to Us, No Warehouse, No Corporate Identity",doc:"supplier",flags:{shipToUsUponCompletion:true},
   cond:["Alternate = No","Ship to Us Upon Completion = Yes","Destination Warehouse = No","Corporate Identity = No"],order:"https://prd.anterasaas.com/e-commerce/orders/ee1d0fe3-5942-11f1-9447-0e9649c979d9"},
  {id:"C-06",sec:"C",title:"No Alternate, No additional vendors, No Ship to Us",doc:"supplier",flags:{},
   cond:["Alternate = No","Additional Vendors = No","Ship to Us Upon Completion = No"],order:"https://prd.anterasaas.com/e-commerce/orders/196d7eeb-5943-11f1-9447-0e9649c979d9"},

  // ---- D: Field Mapping Validation ----
  {id:"D-01",sec:"D",title:"Supplier PO ships to Decorator, field mapping",manualExpected:"All fields populate from the VENDOR source: accountName, email, shipAddress1, shipAddress2 (cond.), shipCity, shipState, shipPostalCode, shipCountry.",cond:["Standard order","Source = Vendor"]},
  {id:"D-02",sec:"D",title:"Decorator PO ships to Customer, field mapping",manualExpected:"Fields populate from the ORDER source: shippingCustomerName, shippingCompanyName, shippingCustomerEmail, shippingStreet, shippingStreet2 (cond.), shippingCity, shippingState, shippingPostalCode, shippingCountry, shippingPhone (cond.).",cond:["Standard order","Source = Order (Customer)"]},
  {id:"D-03",sec:"D",title:"Ship to Us, Corporate Identity NOT used, field mapping",manualExpected:"Fields populate from the PARTNER COMPANY source: Partner Company, Partner Address, Partner Address 2 (cond.), Partner City, Partner State, Partner Postal Code, Partner Country, Partner Phone.",cond:["Ship to Us","Source = Partner Company"]},
  {id:"D-04",sec:"D",title:"Ship to Us, Corporate Identity IS used, field mapping",manualExpected:"Fields populate from the CORPORATE IDENTITY source: Corporate Identity Name, Shipping Street, Shipping City, Shipping State, Shipping Postal Code, Shipping Country, Phone.",cond:["Ship to Us","Source = Corporate Identity"]},
  {id:"D-05",sec:"D",title:"Alternate Ship To, field mapping",manualExpected:"Fields populate from the ALTERNATE SHIP TO source: accountName, email, shipAddress1, shipAddress2 (cond.), shipCity, shipState, shipPostalCode, shipCountry, shipPhone (cond.).",cond:["Source = Alternate Ship To"]},
  {id:"D-06",sec:"D",title:"Store Order, Decorator PO ships to Store Customer, field mapping",manualExpected:"Fields populate from the ORDER source with store prefixes: storeShippingAttentionTo, storeShippingCompanyName, storeShippingContactEmail, shippingStreet, shippingStreet2 (cond.), shippingCity, shippingState, shippingPostalCode, shippingCountry, shippingPhone (cond.).",cond:["Store order","Source = Order (Store Customer)"]},
  {id:"D-07",sec:"D",title:"Address Line 2, conditional display",manualExpected:"Address Line 2 / shipAddress2 / shippingStreet2 displays when present; field is completely omitted (no blank line) when empty/null.",cond:["Display rule"]},
  {id:"D-08",sec:"D",title:"Phone, conditional display",manualExpected:"Phone / shippingPhone / shipPhone displays when present; field is completely omitted when empty/null.",cond:["Display rule"]},
  {id:"D-09",sec:"D",title:"Email, display when available",manualExpected:"Email displays whenever available from the source.",cond:["Display rule"]},

  // ---- E: Multi-Decoration Chain ----
  {id:"E-01",sec:"E",title:"1 line item, 2 artworks from different vendors",manualExpected:"Chain: Supplier → Deco Vendor 1 → Deco Vendor 2 → Customer. Supplier PO → Deco 1; Deco 1 PO → Deco 2; Deco 2 PO → Customer.",cond:["1 line item","2 decorations, 2 vendors"]},
  {id:"E-02",sec:"E",title:"2 line items, each 1 artwork from different vendors",manualExpected:"Line 1: Supplier → Deco 1 → Customer. Line 2: Supplier → Deco 2 → Customer. Each supplier PO routes to its correct deco vendor; each deco PO routes to customer.",cond:["2 line items","Different vendor each"]},
  {id:"E-03",sec:"E",title:"Multi-ship with mixed decoration counts",manualExpected:"Product A: Supplier → Deco 1 → Customer. Product B: Supplier → Deco 1 → Deco 2 → Customer. Product B routes through both decoration vendors.",cond:["Product A: 1 decoration","Product B: 2 decorations (2nd from a different vendor)"]},
  {id:"E-04",sec:"E",title:"One line with Ship to Us, another without",manualExpected:"Line 1 (Ship to Us) follows Ship-to-Us logic; Line 2 follows standard routing. Each line's POs route independently based on its own settings.",cond:["2 line items","Line 1 Ship to Us = Yes","Line 2 Ship to Us = No"]},

  // ---- F: Priority / Conflict Resolution ----
  {id:"F-01",sec:"F",title:"Alternate Ship To overrides Ship to Us",doc:"decorator",flags:{alternateShipTo:true,shipToUsUponCompletion:true},
   cond:["Alternate Ship To = Yes","Ship to Us Upon Completion = Yes"]},
  {id:"F-02",sec:"F",title:"Ship to Us overrides default behavior",manualExpected:"Ship-to-Us routing applies (Warehouse → Corporate Identity → Partner) instead of the default Vendor/Order routing.",cond:["Alternate = No","Ship to Us Upon Completion = Yes"]},
  {id:"F-03",sec:"F",title:"Default behavior when no overrides set",doc:"decorator",flags:{},
   cond:["Alternate = No","Ship to Us = No (both toggles)"]},

  // ---- G: Store Orders ----
  {id:"G-01",sec:"G",title:"Store order, Supplier + Decorator PO default flow",manualExpected:"Supplier PO ships from Vendor; Decorator PO ships to Store Customer using store-specific fields.",cond:["Store order","No overrides"]},
  {id:"G-02",sec:"G",title:"Store order, Supplier PO only",manualExpected:"Supplier PO ships to Store Customer using store-specific fields.",cond:["Store order","No decoration"]},
  {id:"G-03",sec:"G",title:"Store order, Ship to Us logic",manualExpected:"Same Ship-to-Us logic as standard orders, with store-order field mappings.",cond:["Store order","Ship to Us enabled"]},
  {id:"G-04",sec:"G",title:"Store order, Alternate Ship To logic",manualExpected:"Same Alternate logic as standard orders, with store-order field mappings.",cond:["Store order","Alternate Ship To enabled"]},

  // ---- H: Edge Case / Negative ----
  {id:"H-01",sec:"H",title:"Missing Address Line 2, verify field omission",manualExpected:"Address Line 2 does not appear on the PO at all (no blank line).",cond:["Address Line 2 null/empty"]},
  {id:"H-02",sec:"H",title:"Missing Phone, verify field omission",manualExpected:"Phone field does not appear on the PO at all.",cond:["Phone null/empty"]},
  {id:"H-03",sec:"H",title:"No decoration, no Alternate, no Ship to Us",doc:"blank",flags:{decorated:false},
   cond:["All override flags = No","Decorated = No"]},
  {id:"H-04",sec:"H",title:"Decorated but no decorator vendor address configured",manualExpected:"System handles gracefully, error message or fallback (no silently wrong address).",cond:["Decorated = Yes","Decorator vendor has no shipping address"]},
  {id:"H-05",sec:"H",title:"Corporate Identity with incomplete address",manualExpected:"System handles gracefully, validation error or fallback.",cond:["Corporate Identity = Yes","Address missing required fields"]},
  {id:"H-06",sec:"H",title:"Destination Warehouse with no address configured",manualExpected:"System handles gracefully, error message or fallback.",cond:["Destination Warehouse = Yes","No warehouse address configured"]},
  {id:"H-07",sec:"H",title:"Multiple shipping addresses on order (multi-ship)",manualExpected:"Each PO references the correct shipping address for its respective line items.",cond:["Order has multiple shipping addresses"]},

  // ---- P: Cloning & Customer Portal (multi-vendor) ----
  {id:"P-01",sec:"P",title:"Cloned line item, same garment vendor, different decoration vendor",manualExpected:"Decoration hands off in sequence: Supplier → First Decorator → Next Decorator → Customer. The Blank PO sends the goods to the first decorator, then on to the next.",cond:["Cloned line item","Same garment vendor","Different decoration vendor"]},
  {id:"P-02",sec:"P",title:"Customer-portal order, same garment vendor, different decoration vendor",manualExpected:"Same chain as a cloned line: Supplier → First Decorator → Next Decorator → Customer.",cond:["Customer Portal order","Same garment vendor","Different decoration vendor"]},
  {id:"P-03",sec:"P",title:"Cloned line, different decoration vendor + Alternate Ship To",manualExpected:"Earlier POs still hand off decorator → decorator; only the FINAL decorator PO ships to the Alternate Ship To Address.",cond:["Cloned line item","Different decoration vendor","Alternate Ship To = Yes"]},
  {id:"P-04",sec:"P",title:"Cloned line, different decoration vendor + Ship to Us",manualExpected:"Earlier POs hand off decorator → decorator; the FINAL decorator PO follows Ship-to-Us (Warehouse → Corporate Identity → Partner).",cond:["Cloned line item","Different decoration vendor","Ship to Us = Yes"]},
  {id:"P-05",sec:"P",title:"Customer-portal, different decoration vendor + Alternate Ship To",manualExpected:"Earlier POs hand off decorator → decorator; the FINAL decorator PO ships to the Alternate Ship To Address.",cond:["Customer Portal order","Different decoration vendor","Alternate Ship To = Yes"]},
  {id:"P-06",sec:"P",title:"Customer-portal, different decoration vendor + Ship to Us",manualExpected:"Earlier POs hand off decorator → decorator; the FINAL decorator PO follows Ship-to-Us (Warehouse → Corporate Identity → Partner).",cond:["Customer Portal order","Different decoration vendor","Ship to Us = Yes"]}];

export const SHIPPING_QA_SCENARIOS: QaScenario[] = RAW.map(s => {
  const computed = !!(s.doc && s.flags && !s.manualExpected);
  const expected = computed
    ? 'Ships to ' + ADDR[decide(s.doc as ShippingDoc, s.flags as ShippingFlags).a].name
    : (s.manualExpected || '');
  return { id: s.id, group: SECTIONS[s.sec], title: s.title, cond: s.cond, expected, computed };
});
