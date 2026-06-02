import { decide } from './shipping-rules';
import { AddressKey, ShippingDoc, ShippingFlags } from './models';

type Case = [string, ShippingDoc, ShippingFlags, AddressKey];

const cases: Case[] = [
  // Blank PO
  ['Blank: default', 'blank', { decorated: false }, 'order'],
  ['Blank: alternate only', 'blank', { decorated: false, alternateShipTo: true }, 'alternate'],
  ['Blank: not decorated + ship to us upon completion', 'blank', { decorated: false, shipToUsUponCompletion: true }, 'partner'],
  ['Blank: + warehouse', 'blank', { decorated: false, shipToUsUponCompletion: true, destWarehouse: true }, 'warehouse'],
  ['Blank: + corp identity', 'blank', { decorated: false, shipToUsUponCompletion: true, corpIdentity: true }, 'corpIdentity'],
  ['Blank: alternate beats ship to us', 'blank', { decorated: false, alternateShipTo: true, shipToUsUponCompletion: true }, 'alternate'],
  ['Blank: decorated default', 'blank', { decorated: true }, 'firstDecorator'],
  ['Blank: decorated + alternate', 'blank', { decorated: true, alternateShipTo: true }, 'alternate'],
  ['Blank: decorated + ship to us instead', 'blank', { decorated: true, shipToUsInstead: true }, 'partner'],
  ['Blank: + warehouse', 'blank', { decorated: true, shipToUsInstead: true, destWarehouse: true }, 'warehouse'],
  ['Blank: + corp identity', 'blank', { decorated: true, shipToUsInstead: true, corpIdentity: true }, 'corpIdentity'],
  // Decorator / chain
  ['B-01 alternate, no additional vendors', 'decorator', { alternateShipTo: true }, 'alternate'],
  ['B-02 alternate, additional, NOT final', 'decorator', { alternateShipTo: true, additionalVendors: true, isFinalPO: false }, 'secondBeyond'],
  ['B-03 alternate, additional, final', 'decorator', { alternateShipTo: true, additionalVendors: true, isFinalPO: true }, 'alternate'],
  ['B-04 no alternate, additional, final default', 'decorator', { additionalVendors: true, isFinalPO: true }, 'order'],
  ['B-05 no alternate, no additional', 'decorator', {}, 'order'],
  ['B-06 final + ship to us + warehouse', 'decorator', { additionalVendors: true, isFinalPO: true, shipToUsUponCompletion: true, destWarehouse: true }, 'warehouse'],
  ['B-07 ship to us + warehouse', 'decorator', { shipToUsUponCompletion: true, destWarehouse: true }, 'warehouse'],
  ['B-08 final + ship to us + corp', 'decorator', { additionalVendors: true, isFinalPO: true, shipToUsUponCompletion: true, corpIdentity: true }, 'corpIdentity'],
  ['B-09 ship to us + corp', 'decorator', { shipToUsUponCompletion: true, corpIdentity: true }, 'corpIdentity'],
  ['B-10 ship to us + partner', 'decorator', { shipToUsUponCompletion: true }, 'partner'],
  ['non-final ignores overrides', 'decorator', { additionalVendors: true, isFinalPO: false, shipToUsUponCompletion: true, destWarehouse: true }, 'secondBeyond'],
  // Supplier mirrors decorator
  ['C-01 supplier alternate', 'supplier', { alternateShipTo: true }, 'alternate'],
  ['C-02 supplier non-final', 'supplier', { alternateShipTo: true, additionalVendors: true, isFinalPO: false }, 'secondBeyond'],
  ['C-06 supplier default', 'supplier', {}, 'order'],
];

describe('shipping-rules: decide()', () => {
  for (const [label, doc, flags, expected] of cases) {
    it(label, () => expect(decide(doc, flags).a).toBe(expected));
  }
});
