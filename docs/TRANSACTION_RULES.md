# BILIDITO — Payment & Transaction Rules (canonical)

This document settles the places where the master spec (`docs/SPEC.md`) contradicts itself or is
silent about payments, orders, listing status and ratings. **Where this file and the spec disagree,
this file wins.** All rules are enforced server-side in `src/lib/server/services/orders.ts`; the
pure transition table lives in `src/lib/domain/orders.ts` so it can be unit-tested and reused by the
future mobile API.

---

## 1. Conflicts found and how they are resolved

| #   | Spec says                                                                                | Conflict / gap                                                                         | Resolution                                                                                                                                                                                                             |
| --- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | §22 "seller can mark an item as SOLD" vs §27/§47 "seller cannot mark an order COMPLETED" | Is "sold" the same as "completed"? If so the seller _can_ self-complete.               | **Listing status and order status are separate.** A seller may mark a _listing_ SOLD (e.g. sold off-app). That never completes an order, never unlocks ratings, never counts toward "completed transactions". (§3, §6) |
| C2  | §27 "seller cannot complete" vs §69 "user can complete transaction"                      | With no payments, the platform cannot verify handover. Who completes?                  | **Both parties confirm.** Seller confirms _handed over / shipped_, buyer confirms _received_. COMPLETED only when both are recorded (or auto-complete after 7 days, §4).                                               |
| C3  | §26 flow "Seller Accepts / Declines" vs §27 statuses (no ACCEPTED/DECLINED)              | No status for accept/decline.                                                          | Accept = `PENDING → CONFIRMED`. Decline = `PENDING → CANCELLED` with `close_reason = DECLINED`. Status list stays exactly as the spec defines it.                                                                      |
| C4  | §26 "no online payments" vs §29–30, §43 delivery fees and "estimated base fee"           | Money amounts appear, but nothing is ever collected.                                   | **BILIDITO never collects, holds, transfers or refunds money.** Amounts on an order are informational records only (§2).                                                                                               |
| C5  | §20 listings have `quantity` and `negotiable` vs single-item statuses RESERVED/SOLD      | When does a multi-quantity listing become RESERVED/SOLD? What price does an order use? | Stock is tracked as `quantity − reserved − sold`. Listing status follows stock automatically (§3). Orders snapshot an `agreed_price` (§2).                                                                             |
| C6  | §12 "unverified cannot complete transactions"; "messaging restrictions may apply"        | What about users who get suspended/banned mid-order? Can unverified users message?     | Transaction actions need ACTIVE + VERIFIED at creation/acceptance, ACTIVE afterwards. Suspension/ban auto-cancels open orders. Unverified users **may** message (rate-limited, labelled). (§5)                         |
| C7  | §27 has DISPUTED but no escrow exists                                                    | What does a dispute do without money in the middle?                                    | A dispute **freezes the order and opens an admin report**. Only an admin can resolve it, to COMPLETED or CANCELLED, audit-logged. (§4)                                                                                 |
| C8  | §19 public listing map vs §28 "exact location only for participants"                     | Which location data is public?                                                         | Public: municipality/barangay + an approximate area (~1 km). Meet-up place and delivery address: buyer, seller and admins only. (§7)                                                                                   |
| C9  | §5 admin "monitor transactions" vs §47 "no unauthorised status manipulation"             | Can admins edit orders freely?                                                         | Admins can **view** all orders, **cancel** open orders (moderation) and **resolve disputes**. Admins cannot complete a non-disputed order. Every admin action is audit-logged.                                         |

---

## 2. Money (no payments in MVP)

- No payment, wallet, escrow, refund or "paid" status exists anywhere in the app.
- An order stores, as **records only**:
  - `agreed_price` — integer **centavos** (PHP). Defaults to the listing price at request time.
    If the listing is `negotiable`, the buyer may enter an offer instead; the seller accepts or
    declines it as-is. No counter-offer UI in MVP — negotiate in chat, then the buyer withdraws and
    re-requests at the new price.
  - `quantity` — units requested (≤ available stock at request time).
  - `delivery_fee_min` / `delivery_fee_max` — optional, centavos, **always labelled "Estimate"**.
    Pre-filled from the selected provider's admin-configured base fee, or entered manually by the
    seller. The UI never implies live courier pricing.
- Changing a listing's price later never changes existing orders (`agreed_price` is a snapshot).
- Payment is settled directly between buyer and seller (cash at meet-up, courier COD, or transfer
  arranged between them). The order page shows: _"BILIDITO does not process payments. Inspect the
  item before you pay."_

---

## 3. Listing status (DRAFT · ACTIVE · RESERVED · SOLD · REMOVED)

Stock: `available = quantity − reserved − sold`, where `reserved` = units in orders that are
CONFIRMED, FOR_MEETUP, FOR_DELIVERY or DISPUTED, and `sold` = units in COMPLETED orders.

**Automatic transitions (system):**

- `available` reaches 0 and `reserved > 0` → **RESERVED**
- `sold` reaches `quantity` → **SOLD**
- an accepted order is cancelled and `available > 0` again → back to **ACTIVE** (only if the
  listing was RESERVED by the system, not manually held)

**Seller transitions:**

- DRAFT → ACTIVE (publish; requires VERIFIED + ACTIVE account, ≥1 image, valid category/location)
- ACTIVE ↔ RESERVED (manual hold, e.g. promised to someone off-app)
- ACTIVE/RESERVED → **SOLD** ("sold elsewhere"). **Blocked while any accepted order
  (CONFIRMED/FOR\_*/DISPUTED) is open** — the seller must complete or cancel those first, so SOLD
  can't be used to bypass the order flow. Open PENDING requests are auto-cancelled
  (`close_reason = LISTING_UNAVAILABLE`).
- any → **REMOVED** (delete). Same block and same auto-cancel as SOLD. Soft delete only.

**Admin:** remove (→ REMOVED) / restore. Admin removal cancels _all_ open orders except DISPUTED
ones (`close_reason = ADMIN_ACTION`), which stay for admin resolution.

**Side effects:** SOLD or REMOVED notifies users who favourited the listing (§24).
Editing price is always allowed; lowering `quantity` below `reserved + sold` is rejected.

---

## 4. Order status machine

The client always sends an **action**, never a target status. The server looks the action up in
the transition table, checks actor + guards inside a DB transaction (row-locking the listing and
order with `SELECT … FOR UPDATE`), applies the change, writes an `order_events` row and sends
notifications.

| Action             | From → To                         | Who             | Guards / side effects                                                                                                                                                                                                                                                               |
| ------------------ | --------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `request`          | ∅ → PENDING                       | buyer           | buyer ACTIVE + VERIFIED; buyer ≠ seller; listing ACTIVE; `available ≥ qty`; buyer has no other open order on this listing (partial unique index); offer only if `negotiable`. Buyer picks a _preferred_ method (meet-up/delivery). Notifies seller; links/creates the conversation. |
| `accept`           | PENDING → CONFIRMED               | seller          | seller ACTIVE + VERIFIED; listing ACTIVE; `available ≥ qty` re-checked under lock. Reserves stock (may flip listing to RESERVED). Notifies buyer.                                                                                                                                   |
| `decline`          | PENDING → CANCELLED               | seller          | `close_reason = DECLINED`. Notifies buyer "Request declined".                                                                                                                                                                                                                       |
| `withdraw`         | PENDING → CANCELLED               | buyer           | `close_reason = WITHDRAWN`.                                                                                                                                                                                                                                                         |
| `expire`           | PENDING → CANCELLED               | system          | No seller response for **7 days**. `close_reason = EXPIRED`.                                                                                                                                                                                                                        |
| `set_meetup`       | CONFIRMED / FOR_* → FOR_MEETUP    | buyer or seller | Requires place name; optional pin and date/time. Notifies the other party. Encourages public places.                                                                                                                                                                                |
| `set_delivery`     | CONFIRMED / FOR_* → FOR_DELIVERY  | buyer or seller | Provider (admin list or "arranged privately"), fee estimate, buyer's delivery address. Notifies the other party.                                                                                                                                                                    |
| `cancel`           | CONFIRMED / FOR_* → CANCELLED     | buyer or seller | Reason required. Releases reserved stock. Not allowed after the _other_ party has confirmed handover — open a dispute instead.                                                                                                                                                      |
| `confirm_handover` | FOR_* (stays)                     | seller          | Sets `seller_confirmed_at`. If the buyer has already confirmed → COMPLETED.                                                                                                                                                                                                         |
| `confirm_received` | FOR_* (stays)                     | buyer           | Sets `buyer_confirmed_at`. If the seller has already confirmed → COMPLETED.                                                                                                                                                                                                         |
| `auto_complete`    | FOR_* → COMPLETED                 | system          | Exactly one party confirmed, **7 days** passed, no dispute.                                                                                                                                                                                                                         |
| `dispute`          | CONFIRMED / FOR_* → DISPUTED      | buyer or seller | Reason required. Freezes the order (no confirm/cancel). Creates a linked admin report (`target_type = ORDER`). Stock stays reserved.                                                                                                                                                |
| `admin_resolve`    | DISPUTED → COMPLETED or CANCELLED | admin           | Reason required. Audit log `RESOLVE_DISPUTE`. Cancelling releases stock.                                                                                                                                                                                                            |
| `admin_cancel`     | any open → CANCELLED              | admin           | Reason required. Audit log `CANCEL_ORDER`.                                                                                                                                                                                                                                          |

**Terminal states:** COMPLETED and CANCELLED are final. Problems after completion are handled with
a **user report** and the rating, not by reopening the order.

**Timers** (7-day expiry and auto-complete) run in one idempotent `settleDueOrders()` function. It
is called lazily whenever orders are loaded, and from a protected endpoint a cheap external cron
can hit. No job queue in MVP.

---

## 5. Who may act

| Action                                 | Account requirement                                                                                                                                        |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Browse, search, view listings/profiles | none (public)                                                                                                                                              |
| Message a seller                       | logged in, ACTIVE. Unverified users allowed: **max 5 new conversations/day**, messages show a _"Not yet verified"_ label. Recipients can block and report. |
| Post / publish a listing               | ACTIVE + VERIFIED                                                                                                                                          |
| `request`, `accept`                    | ACTIVE + VERIFIED                                                                                                                                          |
| Any later order action                 | ACTIVE (suspended/banned users cannot act)                                                                                                                 |
| Rate                                   | participant of a COMPLETED order, ACTIVE                                                                                                                   |

**Suspension or ban** (admin action, audit-logged):

- all the user's open orders (PENDING/CONFIRMED/FOR_*) are auto-cancelled
  (`close_reason = ACCOUNT_RESTRICTED`) and counterparties notified; DISPUTED orders stay for admin;
- their listings disappear from public results (suspension hides them; **ban** sets REMOVED);
- **restore** brings hidden listings back but does not revive cancelled orders;
- records are never deleted (§34).

---

## 6. Ratings and completed counts

- Only for **COMPLETED** orders. CANCELLED orders → use reports.
- Rater must be the buyer or seller of that order; the ratee is the other party.
- One rating per party per order: unique `(order_id, rater_id)`.
- 1–5 stars, optional text; must be submitted within **30 days** of completion; no edits in MVP.
- Orders an admin resolves to COMPLETED are ratable.
- "Completed transactions" on a profile = count of COMPLETED orders where the user is buyer or
  seller. Listings marked SOLD manually do **not** count.

---

## 7. Location privacy within transactions

- Public listing pages show municipality + barangay and an approximate ~1 km area on the map —
  never a seller's exact pin or home address.
- Meet-up place/pin and the buyer's delivery address are visible only to the two participants and
  admins, and only once the order is CONFIRMED or later.
- The meet-up form suggests public places and shows a safety reminder.

---

## 8. Data model additions this implies

- `orders`: `agreed_price`, `quantity`, `preferred_method`, `method`, `meetup_place`,
  `meetup_lat/lng`, `meetup_at`, `delivery_provider_id`, `delivery_fee_min/max`,
  `delivery_address`, `seller_confirmed_at`, `buyer_confirmed_at`, `completed_at`,
  `close_reason`, `closed_by`, plus a partial unique index on `(listing_id, buyer_id)` for open
  statuses.
- `order_events` (new, not in the spec's table list): `order_id`, `actor_id` (null for system),
  `action`, `from_status`, `to_status`, `note`, `created_at` — the order timeline and the admin
  "action history".
- `reports.target_type` gains `ORDER` for disputes.
