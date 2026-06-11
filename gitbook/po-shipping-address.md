# PO Shipping Address Guide

How the system decides _where every purchase order ships_, written for QA and Support. Start with the mental model, then use the interactive tool to confirm any case in seconds.

`Intended behavior reference · Standard & Store orders`

## How shipping works, in one minute

Every order is broken into one or more **Purchase Orders (POs)**. Each PO is a document telling one party to send goods somewhere. The system answers a single question for each PO: **what address goes in the Ship To block?**

{% hint style="info" %}
**The whole system is three inputs feeding one decision.** 1) **Which document** is this (Blank PO, Decorator PO, or Supplier Decorated PO)? 2) **Which flags** are set on the order or product? 3) The system walks a **decision tree** and picks one of seven possible **destination addresses**.
{% endhint %}

The goal is to route product through the right hands: a blank garment may need to reach a decorator before it reaches the customer; a finished item may go straight to the buyer; sometimes everything routes back to your own warehouse first.

## The three PO documents

A single order can generate more than one of these. Each follows its own decision tree because they sit at different points in the production chain.

| Document | Title | What it does |
| --- | --- | --- |
| **Blank PO** | Undecorated goods from a supplier | Orders blank product from the blank supplier. If the item is decorated, the blank usually has to reach a decorator before going anywhere else. |
| **Decorator PO** | Sends work to a decorator | Goes to the vendor doing the decoration when decoration is done by a _different_ vendor than the blank supplier. |
| **Supplier Decorated PO** | Supplier also decorates | Used when the product and its decoration come from the _same_ supplier. Follows the same address logic as a Decorator PO. |

{% hint style="info" %}
**Multi-decoration chains:** when an item carries decorations from several vendors, POs hand off in sequence, Supplier to Decorator 1 to Decorator 2 to final destination. Only the **final** PO ships to the customer (or Alternate address); every earlier PO ships to the _next_ decorator.
{% endhint %}

## Settings & flags that drive the decision

These are the toggles a CSR sets on the order, product, or partner configuration. Each one can redirect where a PO ships.

| Flag | What it means | Effect when ON |
| --- | --- | --- |
| **Decorated** | The item has artwork applied. | Opens the decorator routing branch (Blank PO). |
| **Alternate Ship To** | A specific override address was entered on the order. | **Highest priority.** Sends the final PO to that address. |
| **Ship to Us Instead of Decorator** | Route blanks back to your own location rather than to the decorator. | Triggers the Ship to Us branch on a decorated Blank PO. |
| **Ship to Us Upon Completion** | Route goods back to your location instead of out to the customer. | Triggers the Ship to Us branch on Decorator / Supplier Decorated POs, and on an undecorated Blank PO. |
| **Destination Warehouse Setting** | A warehouse is configured to receive Ship to Us goods. | Ship-to-Us goods go to the Destination Warehouse Address, but only if the Prioritize Warehouse admin setting is also On. |
| **Corporate Identity Assigned** | The order is tied to a Corporate Identity location. | Used as the Ship-to-Us address when no warehouse is set. |
| **Additional Decorations / This is the FINAL PO** | Describe where this PO sits in the decoration chain. On their own they do not change the address. | If another decorator comes next, this PO ships to the next decorator; if final, the normal checks decide. |

## Priority rules

When more than one flag is set, the system resolves conflicts in a fixed order. This single rule explains most "why did it ship there?" questions.

| Priority | Rule | Detail |
| --- | --- | --- |
| **1 · Highest** | Alternate Ship To | If an Alternate address is set, it wins over Ship-to-Us and default routing on the final PO. |
| **2** | Ship to Us settings | If no Alternate address, Ship-to-Us routing (warehouse to corporate identity to partner) applies. |
| **3 · Default** | Vendor / Order | With no overrides, the Supplier PO ships from Vendor and the Decorator PO ships to the order shipping address. |

{% hint style="info" %}
**Within Ship to Us there is a sub-priority:** Destination Warehouse, then Corporate Identity, then Partner Address. The Destination Warehouse step only applies when the admin setting "Prioritize Warehouse Address on Ship To Us Toggles" is On.
{% endhint %}

## Address determination tool

Pick a document, flip the flags as they appear on the order, and the tool shows the exact destination, its data source, and the fields you should see in the address block.

{% embed url="https://dpartida-antera.github.io/documentation/embed/shipping-tool" %}

## Decision flowcharts

The same logic the tool uses, drawn out. Diamonds are flag checks; green boxes are destinations.

{% embed url="https://dpartida-antera.github.io/documentation/embed/shipping-flows" %}

## Scenario library & QA runner

Worked examples of intended behavior as a live, trackable checklist. Expected results are computed by the same rules engine the guide uses, so the sheet can never drift. Search, filter, and save runs.

{% embed url="https://dpartida-antera.github.io/documentation/embed/shipping-qa" %}

## Glossary

| Term | Definition |
| --- | --- |
| **PO (Purchase Order)** | A document instructing one party to supply/decorate/ship goods. One order can spawn several. |
| **Final / Final Decorator PO** | The last PO in a decoration chain, the one that ships to the customer or Alternate address. |
| **Ship to Us** | Routing goods back to your own location (warehouse to corporate identity to partner) instead of onward. |
| **Alternate Ship To** | A one-off override address entered on the order; highest routing priority. |

---

_PO Shipping Address Guide · QA & Support reference · Describes intended system behavior._
