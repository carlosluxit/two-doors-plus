---
name: qa
description: Full QA suite for Two Doors Plus — functional, visual, mobile, business logic, and integration testing
user_invocable: true
---

# Two Doors Plus — QA Test Suite

Run the full QA test suite for the Two Doors Plus hurricane impact doors & windows quote application. This skill verifies functional flows, visual design, mobile responsiveness, business logic, and integration points.

## Instructions

1. Start the dev server using `preview_start` with name "dev"
2. Run each test category below sequentially
3. For each failing test, investigate the source code, fix the issue, and re-verify
4. Report results in a summary table at the end

---

## Test Categories

### 1. Build & Console Check
- [ ] Dev server starts without errors
- [ ] No console errors on page load (`preview_console_logs` level: error)
- [ ] No console warnings related to app code (ignore React DevTools, HMR)

### 2. Visual & Design System
- [ ] No emojis anywhere in the UI — only Lucide-React icons
- [ ] Color palette is Obsidian & Brass: primary #111827, accent #b08d57, surface #fafaf9
- [ ] All labels use uppercase tracking-wide (10px) where applicable
- [ ] Buttons use rounded-lg, proper hover states, cursor-pointer
- [ ] No raw gray-* Tailwind classes — must use theme tokens (primary, accent, muted, border, stone-*, surface)

### 3. Landing Page
- [ ] Header: Shield icon + "Two Doors Plus" branding + phone link
- [ ] Hero: Dark bg-primary section with accent "Transparent pricing" text
- [ ] CTA: "Get Your Free Quote" button with accent background
- [ ] Trust bar: 4 trust badges with Lucide icons (Clock, Lock, BadgeDollarSign, Shield)
- [ ] Steps section: 3 steps with numbered circles
- [ ] Reviews section with star ratings

### 4. Step 1 — Project Type
- [ ] Three options: Windows Only, Doors Only, Windows & Doors
- [ ] Each has Lucide icon (PanelTop, DoorOpen, Home)
- [ ] "POPULAR" badge on Windows & Doors in accent
- [ ] Continue button disabled until selection made
- [ ] Continue button enables after selection (accent radio fill)

### 5. Step 2 — Measure Method
- [ ] Two options: From Inside, From Outside
- [ ] "REQUIRED FOR DOORS" badge on Outside option
- [ ] Selecting Outside triggers tutorial popup with GIF images
- [ ] Popup has "I Understand" button that must be clicked to proceed
- [ ] Confirmation banner shows after acknowledging popup
- [ ] Continue button activates after selection + acknowledgment

### 6. Step 3 — Measurements
- [ ] Banner shows measurement method ("Measuring from outside — border to border")
- [ ] Windows section with "+ Add Window" button
- [ ] Doors section with "+ Add Door" button (if project includes doors)
- [ ] Each item card has: label input, type dropdown, qty input, width/height inputs, fraction picker
- [ ] Fraction picker shows 8 options (0, 1/8, 1/4, 3/8, 1/2, 5/8, 3/4, 7/8)
- [ ] Price breakdown shows: Price (base × 1.30), Installation (install × 1.30), Total
- [ ] Estimated Total at bottom sums all items
- [ ] Continue disabled until at least 1 item added with valid measurements
- [ ] Camera icon opens CameraMeasure modal
- [ ] Delete (trash) icon removes item

### 7. Step 4 — Client Info
- [ ] Fields: First Name, Last Name, Email, Phone, Property Address, City, ZIP
- [ ] Each field has Lucide icon prefix (User, Mail, Phone, MapPin)
- [ ] Privacy notice in success green: "Your information is never sold to third parties."
- [ ] Continue disabled until all required fields filled
- [ ] Back button returns to Step 3

### 8. Step 5 — Verification
- [ ] Two method options: Email, Text Message
- [ ] Masked email/phone displayed (jo***@example.com, ***-***-1234)
- [ ] "Send Verification Code" button
- [ ] After sending: 6-digit code input boxes
- [ ] Auto-focus advances to next box on digit entry
- [ ] Backspace moves to previous box
- [ ] "Verify & Get Quote" button
- [ ] Demo note: "(Demo: Enter any 6 digits to continue)"
- [ ] Success state: green check icon + "Verified" + loading bar

### 9. Step 6 — Quote Display
- [ ] Dark primary header with accent total price
- [ ] Quote number, issue date, expiry date (5 days)
- [ ] Client details: name, email, phone, address, measurement method, price list
- [ ] Bill of Materials table: #, Item, Size, Qty, Price, Installation, Total
- [ ] Price column = base_price × 1.30 (markup baked in)
- [ ] Installation column = install_fee × 1.30 (markup baked in)
- [ ] Total = Price + Installation (per line)
- [ ] Footer total matches sum of all line totals
- [ ] Action buttons: Submit Quote, Print, Start New Quote
- [ ] No visible markup percentage shown to customer

### 10. Business Logic Verification
- [ ] Single Hung 36×48: verify Price + Install = Total matches DB entry × 1.30
- [ ] Single Door 36×80 Traditional: verify pricing with door variant
- [ ] Quantity multiplier: qty=2 should double line total
- [ ] Fraction measurements: 36.5" width should match correct price range
- [ ] "Both" project type shows Windows AND Doors sections
- [ ] "Windows Only" hides Doors section
- [ ] "Doors Only" hides Windows section

### 11. Mobile Responsiveness (375×812)
- [ ] Landing: hero text wraps, CTA visible, trust badges stack
- [ ] Progress bar: compact with numbers only (no labels overflow)
- [ ] Step 1: cards stack vertically
- [ ] Step 3: measurement cards full width, fraction picker wraps
- [ ] Step 4: form inputs full width, City/ZIP stack on small screens
- [ ] Step 6: quote table scrollable horizontally if needed
- [ ] No horizontal overflow on any step

### 12. Admin Panel (/admin)
- [ ] Login page: dark background, centered card, Shield icon in accent
- [ ] Uppercase "ADMIN PORTAL" subtitle
- [ ] Form inputs with border-border, focus:border-accent
- [ ] After login: sidebar with primary bg, accent active tab
- [ ] Quotes tab: search, expandable rows, status badges with themed colors
- [ ] Price Lists tab: create new list, category tabs, inline price editing
- [ ] Save button (accent Save icon) per price entry row
- [ ] Activate button for non-active price lists

### 13. Integration
- [ ] Quote submission writes to Supabase `quotes` table
- [ ] Quote items written to `quote_items` table
- [ ] Price lookup matches against active `price_lists` + `price_entries`
- [ ] Edge Function (submit-quote) sends branded email via Resend

---

## Running the Tests

Use the preview tools to navigate through each step:

```
1. preview_start (name: "dev")
2. preview_console_logs (level: error) — check for errors
3. preview_screenshot — visual check each step
4. preview_click / preview_fill — interact with forms
5. preview_eval — click buttons, navigate
6. preview_resize (preset: mobile) — mobile checks
7. preview_snapshot — verify text content and structure
```

## Reporting

After all tests, output a summary table:

| Category | Tests | Pass | Fail | Notes |
|----------|-------|------|------|-------|
| Build | 3 | | | |
| Visual | 5 | | | |
| Landing | 5 | | | |
| Step 1 | 5 | | | |
| Step 2 | 6 | | | |
| Step 3 | 10 | | | |
| Step 4 | 5 | | | |
| Step 5 | 9 | | | |
| Step 6 | 9 | | | |
| Business Logic | 7 | | | |
| Mobile | 7 | | | |
| Admin | 8 | | | |
| Integration | 4 | | | |

For any failures, include the fix applied and re-test result.
