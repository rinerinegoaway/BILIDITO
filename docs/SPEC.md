# BILIDITO — Master Spec (source of truth)

> Saved from the master development prompt (2026-10-08). Lists are kept complete but written inline.
> Payment/transaction conflicts in this spec are resolved in `docs/TRANSACTION_RULES.md`, which
> takes precedence. Section numbers (§) are referenced throughout the codebase and docs.

BILIDITO is a local, verified, location-based buy-and-sell marketplace, initially serving
**Cagayan Province, Philippines**. **Web app first**: responsive (desktop, laptop, tablet, mobile
browser), and **no native Android/iOS app yet**. The architecture must let a mobile app reuse the
same backend/API later.

## 1. Product vision

Verified users in Cagayan can: buy, sell, discover nearby listings, search, message sellers, request
to buy, arrange meet-up or delivery, rate buyers/sellers, report suspicious users/listings.
Priority: **LOCAL + VERIFIED + SAFE + SIMPLE**.

## 2. Brand

Tagline: **"Buy Nearby. Sell Safely. Connect Locally."** Alt: "Your Local Marketplace in Cagayan."
Feel: modern, local, friendly, trustworthy, safe, simple, professional. A community marketplace, not
a Shopee-style generic store.

## 3. Geographic scope

Province → Municipality/City → Barangay. Cagayan LGUs: Tuguegarao City, Aparri, Abulug, Alcala,
Allacapan, Amulung, Baggao, Ballesteros, Buguey, Calayan, Camalaniugan, Claveria, Enrile, Gattaran,
Gonzaga, Iguig, Lal-lo, Lasam, Pamplona, Peñablanca, Piat, Rizal, Sanchez-Mira, Santa Ana,
Santa Praxedes, Santa Teresita, Santo Niño, Solana, Tuao. **Do not hard-code around Cagayan**; the
design must allow Cagayan → Cagayan Valley → Northern Luzon → Nationwide.

## 4. MVP principle

Don't over-engineer. **Do NOT implement:** native apps, online payments, wallet, escrow, automated
refunds, complex shipping APIs, AI recommendations, advanced delivery tracking, nationwide ops,
seller subscriptions, paid ads.

## 5. User types

**USER**: one account is both buyer and seller (no separate account types). Can browse, search,
post listings, buy, sell, message, favourite, rate, review, report.
**ADMIN**: manage users, review verification, manage listings, review reports, suspend/ban, manage
categories, manage delivery options, monitor transactions, view analytics and audit logs.

## 6. Stack

SvelteKit, Svelte 5, TypeScript, Tailwind. Backend: SvelteKit server routes. DB: PostgreSQL
(Supabase). ORM: existing one, else **Drizzle**. Secure SvelteKit-compatible auth. Maps: **Leaflet +
OpenStreetMap**. Package manager: **Bun** (not npm unless explicitly requested).

## 7. Web app requirements

Desktop: sidebar/header nav, multi-column marketplace, tables for admin. Mobile: mobile-first,
bottom nav, large touch targets, responsive cards/forms. Must work on slow mobile internet; optimise
images, page loads, API requests, DB queries.

## 8. Public landing page

Header: logo, Browse Items, Categories, Search, Login, Register, Sell an Item.
Hero: "Buy Nearby. Sell Safely. Connect Locally." / "Discover products from verified sellers across
Cagayan Province." Buttons: Browse Items, Sell an Item.
Categories: Electronics, Phones, Computers, Vehicles, Fashion, Shoes, Furniture, Appliances,
Home & Living, Books, School Supplies, Sports, Beauty, Food, Services, Others.
Nearby/Popular listings (real active listings). Trust section: Verified Users, Local Listings,
Ratings & Reviews, Report & Moderation. Footer: About, Terms, Privacy, Community Guidelines,
Contact, Help.

## 9. Authentication

Register, login, logout, forgot password, reset password, change password. Registration fields:
full name, username, email, mobile number, password, province, municipality/city, barangay. Must
agree to Terms of Service, Privacy Policy, Community Guidelines.

## 10. Verification

Upload a valid government ID (PhilSys National ID, Driver's License, Passport, UMID, other
government ID). Statuses: `UNVERIFIED, PENDING, VERIFIED, REJECTED`. Flow: Register → Complete
Profile → Upload ID → Submit → Admin Review → Approved/Rejected. Verified users get a ✓ Verified badge.

## 11. Privacy rule

Never show normal users any ID image, ID number, verification document or sensitive verification
info. Only authorised admins can access them. No public URLs for documents; use protected storage.
No sensitive ID info in logs.

## 12. Access rules

Unverified users can browse, search, view listings and profiles. They cannot post listings, create
purchase requests or complete transactions. Messaging restrictions may apply (decided: see
TRANSACTION_RULES §5).

## 13. Profile

Picture, username, full name, verification badge, municipality, member since, rating, completed
transactions, active listings, reviews. Never public: email, government ID, password, sensitive
info, exact residential address.

## 14. Marketplace `/items`

Product cards, search, categories, filters, sorting, location. Card: image, name, price (₱),
condition, municipality, seller verification, seller rating, favourite button.

## 15. Search

By product name, brand, description, category. Fast, case-insensitive.

## 16. Filters

Category; price min/max; condition (New, Like New, Good, Fair, For Parts); location (municipality,
barangay, distance); seller verified only; availability (Available, Reserved).

## 17. Sorting

Recommended, Nearest, Newest, Lowest Price, Highest Price.

## 18. Location

Rank by proximity: own municipality → nearby municipalities → rest of Cagayan. Display
"Tuguegarao City, Cagayan", never an exact address.

## 19. Map

Leaflet + OSM: select listing location, view approximate listing location, find nearby listings,
optional meet-up location. Do not expose residential addresses.

## 20. Create listing `/items/create`

Fields: name, description, price, category, condition, quantity, municipality, barangay, location,
optional brand, optional model, negotiable flag. Required: ≥1 image, name, description, price,
category, condition, location.

## 21. Listing images

Multiple images: upload, preview, delete, reorder, set primary. Validate type, size, count.
Compress where practical.

## 22. Listing status

`DRAFT, ACTIVE, RESERVED, SOLD, REMOVED`. Seller can mark SOLD after a transaction.

## 23. Item details `/items/[id]`

Gallery, title, price, condition, description, category, quantity, location, date posted, seller
profile, verification badge, seller rating, completed transactions, Favourite, Message Seller,
Request to Buy, Report Listing.

## 24. Favourites `/favorites`

Add, remove, view. Notify when an item is sold, removed, or has an important update.

## 25. Messaging `/messages`, `/messages/[id]`

A conversation belongs to a listing + buyer + seller. Send, read, view history, report conversation,
block user.

## 26. Buying process

No online payments. **Request to Buy:** view → request → seller accepts/declines → coordinate →
meet-up or delivery → completed → rating & review.

## 27. Order status

`PENDING, CONFIRMED, FOR_DELIVERY, FOR_MEETUP, COMPLETED, CANCELLED, DISPUTED`. The seller cannot
manually complete without the proper flow. Prevent unauthorised status changes.

## 28. Meet-up

Parties agree a location. Encourage public places; avoid home addresses. Share the exact location
only with transaction participants.

## 29. Delivery

No courier APIs. Admin-configurable delivery provider table (e.g. J&T Express, LBC, local riders,
Cagayan/Tuguegarao services): name, description, service area, contact, estimated base fee,
status. May recommend an option based on seller location, buyer location, availability.

## 30. Delivery fees

Manually entered or estimated (e.g. "Estimated delivery fee: ₱80–₱120"). Always label estimates;
never imply live courier pricing.

## 31. Ratings

After completion: buyer rates seller, seller rates buyer. 1–5 stars + optional review. Participants
only; one review per completed transaction per party.

## 32. Reporting

Listings: scam, fake item, prohibited item, misleading, duplicate, inappropriate, other.
Users: scam, fake account, harassment, suspicious behaviour, other.
Messages: scam, harassment, spam, threats, other.

## 33. Moderation

Admin: review reports, dismiss, warn user, remove listing, suspend, permanently ban. Record every
admin action.

## 34. User status

`ACTIVE, SUSPENDED, BANNED`. Suspended = temporarily restricted; banned = permanently restricted.
Never delete banned users; keep records for audit and transaction integrity.

## 35. Prohibited items

Admin-configurable prohibited categories (illegal drugs, weapons, stolen property, counterfeit
goods, illegal services, other).

## 36. Notifications

Verification approved/rejected, new message, purchase request, request accepted/declined, order
status update, listing sold, new review, report update, account suspension, account ban, nearby
recommendations. Fields: title, message, read/unread, timestamp, optional reference.

## 37. Admin dashboard `/admin`

Cards: total users, verified users, active listings, completed transactions, pending verification,
pending reports, suspended users, banned users. Charts: user growth, listing growth, transactions,
reports, activity by municipality.

## 38–44. Admin pages

- `/admin/users`: search, filter, view profile/verification/transactions/reports; suspend, ban, restore.
- `/admin/verifications`: user, ID type, submission date, status; approve, or reject with reason.
- `/admin/listings`: search, filter, view, remove, restore, review reports.
- `/admin/reports`: statuses `OPEN, UNDER_REVIEW, RESOLVED, DISMISSED`; show reporter, reported
  user, listing, reason, description, date, status, action history.
- Categories: add, edit, disable, add subcategory, reorder.
- Delivery providers: add, edit, disable, service area, estimated fee.
- Audit log: admin, action, target, reason, timestamp. Actions include APPROVE_USER, REJECT_USER,
  REMOVE_LISTING, SUSPEND_USER, BAN_USER, RESTORE_USER, RESOLVE_REPORT, DISMISS_REPORT.

## 45. Database

Core tables: users, user_verifications, locations, categories, listings, listing_images, favorites,
conversations, messages, orders, delivery_providers, ratings, reports, notifications, audit_logs.
Use PKs, FKs, indexes, unique constraints, timestamps, soft deletion where appropriate.

## 46–47. Security

Protect passwords, government IDs, private messages, user info. Never trust the client; validate all
important operations server-side. Implement authn, authz, role checks, input validation, file
validation, rate limiting, secure sessions, SQL injection/XSS/CSRF protection. A normal user must
never be able to set `verification_status = VERIFIED`, `role = ADMIN` or `order_status = COMPLETED`.

## 48. User routes

`/ /login /register /verify /home /items /items/[id] /items/create /items/[id]/edit /search
/categories/[slug] /favorites /messages /messages/[id] /orders /orders/[id] /profile
/profile/[username] /settings /notifications`

## 49. Admin routes (server-protected)

`/admin /admin/users /admin/users/[id] /admin/verifications /admin/listings /admin/listings/[id]
/admin/reports /admin/reports/[id] /admin/orders /admin/categories /admin/delivery /admin/analytics
/admin/audit-logs /admin/settings`

## 50. UI design

Primary `#0B3D91`, accent `#10B981`, background `#F8FAFC`. Cards: white, rounded, subtle shadow,
clean borders. Modern, readable type with a strong price hierarchy. Avoid heavy gradients,
animations, cluttered dashboards.

## 51. Mobile

Design for 360px+. Large buttons, touch-friendly controls, responsive cards, bottom nav, sticky
search, mobile-friendly upload and filters.

## 52. Performance

Image compression, lazy loading, pagination/infinite scroll, efficient queries, indexes, minimal
requests, loading states, skeletons. Never load hundreds of listings at once.

## 53. Error states

Loading, empty, error, success. E.g. "No items found. Try changing your search or filters." /
"You haven't saved any items yet." / "No conversations yet." / "Something went wrong. Please try again."

## 54. Location experience

"📍 Tuguegarao City, Cagayan". Distance filters: within 5 km, 10 km, 25 km, within Cagayan. Manual
location selection when GPS is unavailable; never require GPS.

## 55. Recommendation logic

No AI. Score = proximity + search relevance + category relevance + recency + user favourites.
E.g. "iPhone": nearby iPhones → verified sellers → newer → relevant descriptions → rest of Cagayan.

## 56. PWA-ready

Prepare manifest, icon, installability, service worker, offline shell. Not a native app.

## 57. Future mobile

Web and future Android/iOS apps share one API/backend. Keep business logic in server, services,
DB and API, not in UI components.

## 58. Roadmap (do NOT implement now)

v2: online payments, receipts, buyer/seller protection, delivery tracking, push, better recs.
v3: promoted listings, subscriptions, business accounts, store pages, ads.
v4: Android, iOS, Cagayan Valley, nationwide.

## 59. Core MVP flow

Register → Verify → Browse → Search/Filter → View item → Message seller → Request to buy → Seller
accepts → Meet-up/Delivery → Completed → Rate & review.

## 60. Phases

1 Foundation · 2 Users · 3 Marketplace · 4 Communication · 5 Transactions · 6 Trust · 7 Admin ·
8 Polish (see `docs/IMPLEMENTATION_PLAN.md`).

## 61. Testing

Auth (register, login, logout, reset); verification (submit, approve, reject, restrict
unverified); listings (CRUD, search, filter, sort, favourite); messaging (send, receive, read,
report); transactions (request, accept, decline, cancel, complete); reviews (create, no duplicate,
no unauthorised); reports (submit, review, resolve, dismiss); moderation (suspend, ban, restore).

## 62–63. Accessibility & SEO

Labels, keyboard nav, accessible buttons, validation, contrast, alt text, focus states, semantic
structure. Public pages: titles, meta descriptions, Open Graph, semantic HTML, clean URLs. Never
expose private user info to search engines.

## 64. Env vars

No hard-coded secrets. Env for DB URL, auth secrets, storage credentials, API keys, email
credentials. Provide `.env.example` with placeholders; never commit real secrets.

## 65–66. Deployment & budget

Lowest practical cost: managed Postgres, low-cost hosting, object storage, CDN where appropriate.
Prefer open source and free tiers; avoid paid APIs, AI APIs, premium UI libraries and expensive
maps. Every external service needs a clear reason.

## 67–68. Process & code quality

Inspect → plan → implement incrementally → after each phase run type check, lint, tests and fix.
Don't rewrite working systems. Clean, modular, strongly typed, reusable components (Button, Modal,
Input, Select, SearchBar, ProductCard, RatingStars, StatusBadge, LocationSelector, ImageUploader,
Pagination, EmptyState, LoadingState). No massive components, duplicate code, hard-coded business
logic or locations, client-only security, fake APIs or fake DB functionality.

## 69. Definition of done

User can: register, log in, complete profile, submit ID, become verified, browse, search, filter,
view nearby listings, view details, post an item, upload photos, favourite, message a seller,
request to buy, accept/decline, choose delivery or meet-up, complete the transaction, rate the
other user, report suspicious activity.
Admin can: log in, view dashboard, verify users, manage users and listings, review reports,
suspend, ban, manage categories and delivery providers, monitor orders, view analytics and audit logs.

## 70. Guardrails

No fake integrations. Never expose sensitive info or government IDs. No online payments. No native
apps. Don't assume nationwide. Start in Cagayan → build trust → gain users → validate → expand.
