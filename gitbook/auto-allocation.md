# Auto Allocation Guide

How the system decides, line item by line item, _what ships from stock and what gets dropshipped_ when you book a pending order, including partial stock, backorders, warehouse priority, and pulling inventory from a parent.

`Intended behavior reference · Standard & Store orders`

## How auto-allocation works, in one minute

When you **book** a pending order, auto-allocation walks every line item, and every size within it, and asks one question: **can I cover this from stock?** Then it reserves what it can and routes the rest.

{% hint style="info" %}
**Three outcomes per size, decided by available stock:** 1) **Enough stock**, the row stays Stock and inventory is reserved. 2) **Partial stock**, the covered quantity stays Stock and the shortfall becomes a DropShip line (or a Backorder, if that mode is on). 3) **No stock**, DropShip / Backorder / in-place flip depending on settings.
{% endhint %}

The line-item "source from stock vs dropship" value is the **Matrix PO type**, shown as **Source** on the order line. On the product itself, the eligibility field is **Li Type**.

## Prerequisites, when auto-allocation runs

All of these must be true, or the order books without any auto-allocation happening.

| Requirement | Detail |
| --- | --- |
| Order is Pending | Allocation happens when a pending order is booked. |
| Auto Allocation is ON | Enabled in Admin, Antera Admin, Settings, Orders, Inventory Sourcing. |
| Order has line items | There must be at least one line item to evaluate. |
| Product Li Type = Stock | Set on the product (the Li Type field). Only Stock-type products are eligible. |

{% hint style="warning" %}
**Aether Store Orders** have a special path: a zero-stock line is sent to backorder even when the system-level auto-allocation setting is OFF (scenarios SC-10 and SC-11).
{% endhint %}

## Settings & flags

Each of these changes how a shortfall is handled or where stock is pulled from.

| Setting | What it does | Where |
| --- | --- | --- |
| Auto Allocation | Master switch. Must be ON for allocation to run. | Admin ▸ Antera Admin ▸ Settings ▸ Orders |
| Allow No/Low Stock Allocation | Backorder mode. Keeps one Stock line and records shortfalls as backorders. | Admin ▸ Settings ▸ Orders |
| Li Type = Stock | Makes a product eligible for allocation. | Product record · Li Type field |
| Matrix PO type (Source) | Per line-item: source from Stock or DropShip. | Order ▸ line item · Source |
| Warehouse priority & Default | Global priority via the Auto Allocation Priority column; Default toggle marks the fallback. | Admin ▸ Configuration ▸ Warehouse |
| Customer override + Search Warehouses for Stock | Per-customer priority; optional scan of all warehouses. | Customer ▸ Warehouse tab |
| Share Parent Inventory | Lets a child pull inventory from its parent at booking. | Product ▸ Child Product Settings |
| Allow Transfer Parent Inventory to Child Pre-Decorated Products | System-level enable for parent to child transfer. Aether Orders Only. | Admin ▸ Settings ▸ Orders |

### Setting locations

Where each setting lives in Antera.

![Auto Allocation · Backorder · Parent-transfer — Admin ▸ Settings ▸ Orders ▸ Inventory Sourcing](https://dpartida-antera.github.io/documentation/assets/screenshots/auto-allocation-backorder.png)

![Li Type = Stock — Product record · Li Type field](https://dpartida-antera.github.io/documentation/assets/screenshots/li-type-stock.png)

![Matrix PO type / Source — Order ▸ line item · Source](https://dpartida-antera.github.io/documentation/assets/screenshots/matrix-po-type.png)

![Global warehouses · Default · Priority — Admin ▸ Configuration ▸ Warehouse](https://dpartida-antera.github.io/documentation/assets/screenshots/global-warehouses-default.png)

![Customer override + Search Warehouses — Customer ▸ Warehouse tab](https://dpartida-antera.github.io/documentation/assets/screenshots/customer-warehouse-search.png)

![Share Parent Inventory — Product ▸ Child Product Settings](https://dpartida-antera.github.io/documentation/assets/screenshots/share-parent-inventory.png)

## The allocation outcomes

For each size, allocated = min(required, available stock) and remainder = required minus allocated. What happens to the remainder is the whole story.

| Case | Outcome | What happens |
| --- | --- | --- |
| **Full** | All Stock | Stock covers the row. It stays Stock and inventory is reserved. No DropShip line. |
| **Partial · default** | Stock + DropShip line | The covered quantity stays Stock; the shortfall (plus any fully-unstocked sizes) moves to a new DropShip line. |
| **Partial · backorder** | Stock + Backorder | With Backorder mode on, nothing splits off. The line stays a single Stock line and the shortfall is stored as a backorder (bell). |

{% hint style="info" %}
**When no size has any stock** the entire original line flips to DropShip in-place (no separate line). With a Default warehouse and Backorder mode, the full quantity is backordered against the Default warehouse instead.
{% endhint %}

## Warehouse priority & fallback

Available stock depends on which warehouse the system checks. It walks a priority list and stops at the first that can cover the row.

| Order | Warehouse | Notes |
| --- | --- | --- |
| 1 | Primary | Customer override if set, otherwise global. |
| 2 | Secondary | Customer override or global. |
| 3 | Tertiary | Customer override or global. |
| 4 | Any other warehouse | Only if Search Warehouses for Stock is ON. |
| 5 | Default warehouse | Final fallback. If empty too, the row follows DropShip / Backorder rules. |

{% hint style="info" %}
**Customer override wins:** if a customer has its own priority set, the global list is not consulted (scenario SC-9).
{% endhint %}

## Parent to Child inventory transfer

With Share Parent Inventory on, a child that is short on stock can pull inventory from its parent at booking, before the shortfall is dropshipped or backordered.

| Rule | Behavior |
| --- | --- |
| Only Stock-type lines | If the line's Matrix PO type is DropShip, no transfer happens. |
| Transfer amount | min(shortfall, parent inventory). If the parent can't cover it all, the rest is backordered/dropshipped. |
| Warehouse type must match | Normally only works when parent and child stock are the same warehouse type (Customer-owned, Distributor-owned, Vendor-owned). |
| Unless the child has zero | If the child has 0 stock for the items, it can pull from the parent regardless of warehouse type. |
| Unreserve does not reverse it | If you unreserve the line after booking, the child keeps the transferred inventory. |

{% hint style="info" %}
**Two switches enable this:** the product opt-in Share Parent Inventory (Product, Child Product Settings) and the system-level Allow Transfer Parent Inventory to Child Pre-Decorated Products (Admin, Settings, Orders). Per that setting's label, the transfer is scoped to Aether orders and pre-decorated child products.
{% endhint %}

## Allocation simulator

Enter the required and in-stock quantities per size, flip the flags, and see exactly how the line item is rewritten when the order books.

{% embed url="https://dpartida-antera.github.io/documentation/oembed/allocation-simulator.html" %}

## Decision flowcharts

The same logic, drawn out. Diamonds are checks; green boxes are outcomes.

{% embed url="https://dpartida-antera.github.io/documentation/oembed/allocation-flows.html" %}

## Scenario library & QA runner

Every auto-allocation and parent-transfer scenario as a live, trackable checklist. Expected outcomes are computed by the same rules engine the guide uses, so the sheet can't drift.

{% embed url="https://dpartida-antera.github.io/documentation/oembed/allocation-qa.html" %}

---

_Auto Allocation Guide · QA & Support reference · Describes intended system behavior._
