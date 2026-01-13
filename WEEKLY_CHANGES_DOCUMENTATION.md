# Service Pro Mobile - Product Feature Documentation
## Feature Updates & Business Logic

**Document Type:** Product Feature Specification  
**Target Audience:** Development Team  
**Purpose:** Document new features, business rules, and product logic implemented this week

---

## 📋 Table of Contents
1. [Sell Product Flow - Invoice Generation](#sell-product-flow)
2. [Agreement Creation - Five-Step Process](#agreement-creation)
3. [Unified Notes System](#unified-notes-system)
4. [Convert to Job Feature](#convert-to-job)
5. [Dashboard Date Range Filter](#dashboard-date-filter)
6. [UI/UX Improvements](#ui-improvements)

---

## 🛒 Sell Product Flow - Invoice Generation

### Feature Overview
The "Sell Product" feature allows users to sell products directly to customers. Upon completion of the sale, the system automatically generates an invoice instead of creating a separate order record.

### Business Logic

#### Flow Sequence
1. **Customer Selection** → User selects a customer from the customer list
2. **Product Selection** → User adds products to cart with quantities
3. **Checkout Summary** → System calculates:
   - Subtotal (sum of all product prices × quantities)
   - Discount (if applicable, percentage or fixed amount)
   - Tax (calculated on discounted amount)
   - Total (subtotal - discount + tax)
4. **Payment Processing** → User selects payment method (Cash, Card, Check, etc.)
5. **Invoice Generation** → System automatically creates an invoice with:
   - Status: "Paid" (since payment is completed during checkout)
   - Type: "single" (indicates single transaction, not recurring)
   - Source: "sell_product" (identifies origin of invoice)
   - All line items from the cart
   - Payment method used
   - Employee information (who processed the sale)
   - Customer information
   - Calculated totals (subtotal, discount, tax, total)

#### Invoice ID Generation
- Uses the same sequential ID generation logic as regular invoices
- Format: `INV-XXX` (e.g., INV-031, INV-032)
- Ensures no duplicate IDs across all invoice types
- New invoice appears at the top of the invoice list (sorted by creation date, newest first)

#### Navigation & Display
- After successful payment, user is redirected to: `/invoices?tab=single`
- The newly created invoice appears in the "Single" tab
- Invoice card displays:
  - Invoice ID (e.g., INV-031)
  - Status badge ("Paid" or "Unpaid") positioned to the right of the ID
  - Customer name
  - Total amount
  - Issue date and due date
- New invoice is temporarily highlighted with a ring border (clears after 5 seconds)

#### Restrictions & Rules
- **No "Convert to Job" Option**: Invoices created from "Sell Product" do not show the "Convert to Job" option in the three-dot menu
  - Reason: These are product sales, not service jobs
  - Only manually created invoices or invoices from estimates/agreements can be converted to jobs
- **Payment Required**: Invoice is automatically marked as "Paid" since payment is collected during checkout
- **No Partial Payment**: Full payment is required at checkout (no partial payment option)

#### Data Persistence
- Invoice is saved to localStorage using the invoice service
- All invoice data (items, totals, customer, employee) is preserved
- Invoice can be viewed, previewed, and managed like any other invoice

---

## 📄 Agreement Creation - Five-Step Process

### Feature Overview
Agreement creation is a multi-step form process that guides users through creating service agreements with customers. The process consists of five distinct steps, with the final step dedicated to Terms and Conditions and Cancellation Policies.

### Business Logic

#### Step-by-Step Flow

**Step 1: Customer & Employee Selection**
- User selects a customer from the customer list
- User assigns an employee to the agreement
- Both selections are required to proceed
- Customer information is loaded and displayed

**Step 2: Job Details**
- User enters job-specific information:
  - Job title/description
  - Service location/address
  - Job type or category
  - Any relevant job details or special instructions
- All fields are validated before proceeding

**Step 3: Pricing/Items**
- User adds services or items to the agreement:
  - Service/item name
  - Quantity
  - Unit price
  - Total for each line item
- System calculates:
  - Subtotal (sum of all line items)
  - Discount (if applicable)
  - Tax (if applicable)
  - Grand total
- User can add multiple line items
- User can remove or edit line items

**Step 4: Attachments**
- User can upload documents, photos, or files related to the agreement
- Multiple files can be attached
- Files are stored and associated with the agreement
- User can preview attached files
- User can remove attachments before finalizing

**Step 5: Terms and Conditions & Cancellation Policies**
- **Terms and Conditions Section:**
  - User can enter custom terms and conditions
  - Text area for detailed terms
  - Terms are saved with the agreement
  - Terms are displayed when viewing/printing the agreement
  
- **Cancellation Policies Section:**
  - User can specify cancellation policies
  - Text area for policy details
  - Policies are saved with the agreement
  - Policies are displayed when viewing/printing the agreement

- Both sections are optional but recommended
- User can review all previous steps before finalizing
- User can go back to previous steps to make changes

#### Validation Rules
- **Step 1**: Customer and employee must be selected
- **Step 2**: Job details must be provided (at minimum, job description)
- **Step 3**: At least one service/item must be added with valid pricing
- **Step 4**: Attachments are optional
- **Step 5**: Terms and policies are optional, but agreement cannot be created without completing steps 1-3

#### Data Structure
When an agreement is created, it includes:
- Customer information (ID, name, contact details)
- Employee assignment (ID, name)
- Job details (title, description, location)
- Line items (services/products with quantities and prices)
- Pricing breakdown (subtotal, discount, tax, total)
- Attachments (file references)
- Terms and Conditions (text)
- Cancellation Policies (text)
- Creation timestamp
- Status (typically "Active" or "Pending")

#### Navigation Logic
- User can navigate forward and backward between steps
- Progress indicator shows current step (1 of 5, 2 of 5, etc.)
- Completed steps show a checkmark (✓)
- Current step is highlighted
- User cannot skip steps (must complete in sequence)
- User can save as draft (if implemented) or finalize agreement

#### Post-Creation Behavior
- Agreement is saved to the system
- Agreement appears in the agreements list
- Agreement can be viewed, edited, or converted to a job (if paid)
- Agreement can be printed or shared with customer
- Terms and policies are included in printed/shared documents

---

## 📝 Unified Notes System

### Feature Overview
A centralized notes system that allows notes to be added to various entities (invoices, estimates, customers, jobs) and ensures notes are visible across all relevant contexts.

### Business Logic

#### Note Data Model
Each note contains:
- **ID**: Unique identifier
- **Entity ID**: The ID of the entity the note belongs to (invoice ID, estimate ID, customer ID, etc.)
- **Entity Type**: Type of entity ("invoice", "estimate", "customer", "job", "equipment")
- **Customer ID**: The customer associated with the note (for cross-referencing)
- **Text**: Note content (optional, can be empty if only attachments)
- **Attachments**: Array of file attachments (images, PDFs, documents)
- **Created By**: User/employee who created the note
- **Created At**: Timestamp of note creation

#### Note Creation Scenarios

**1. Notes During Invoice/Estimate Creation**
- User can add notes in the final step of invoice/estimate creation
- Notes can include:
  - Text description
  - Multiple file attachments (photos, documents)
- When invoice/estimate is saved, note is automatically created with:
  - `entityId` = invoice/estimate ID
  - `entityType` = "invoice" or "estimate"
  - `customerId` = selected customer ID
  - All text and attachments combined into a single note record

**2. Notes from Three-Dot Menu**
- User opens invoice/estimate/agreement
- Clicks three-dot menu → "Add Note"
- Modal opens allowing:
  - Text input
  - File attachment (multiple files)
- Note is saved with same structure as above

**3. Customer Notes**
- User opens customer profile
- Clicks "Memo+" button
- Can add standalone customer notes
- Note is saved with:
  - `entityId` = customer ID
  - `entityType` = "customer"
  - `customerId` = customer ID

#### Note Display Logic

**Grouping & Merging Rules**
Notes are automatically grouped and merged when they:
- Belong to the same entity (same `entityId`)
- Were created at the same time (within the same second)
- Were created by the same person (same `createdBy`)

When grouped, notes are displayed as a single card showing:
- Header: Entity type and ID (e.g., "Invoice INV-032")
- Body: Combined text from all grouped notes
- Attachments: All attachments from grouped notes displayed together
- Footer: Creator name and timestamp

**Display Locations**

1. **Document Note Modal** (from three-dot menu):
   - Shows all notes for that specific invoice/estimate
   - Notes are grouped by the rules above
   - Displays newest notes first

2. **Customer Memo+ View**:
   - Shows ALL notes related to the customer:
     - Notes from invoices (with invoice ID label)
     - Notes from estimates (with estimate ID label)
     - Standalone customer notes (labeled as "Customer")
   - Notes are sorted by creation date (newest first)
   - Each note shows its source (Invoice, Estimate, or Customer)

#### Business Rules
- **Unified Storage**: All notes are stored in a single data structure, regardless of where they were created
- **Cross-Reference**: Notes are linked to both the entity (invoice/estimate) and the customer
- **No Duplication**: Notes created during invoice creation automatically appear in the "Add Note" modal and customer profile
- **Multiple Attachments**: Each note can have multiple file attachments
- **Immutable History**: Notes cannot be edited (only added or deleted) to maintain audit trail
- **Access Control**: Notes are visible to all users who can access the related entity

---

## 🔄 Convert to Job Feature

### Feature Overview
Allows users to convert paid invoices, estimates, or agreements directly into jobs with a single action, eliminating manual data entry.

### Business Logic

#### Eligibility Rules

**For Invoices:**
- Invoice status must be "Paid"
- Invoice source must NOT be "sell_product" (product sales cannot become service jobs)
- Invoice must not already be converted (status must not be "Job Created")

**For Estimates:**
- Estimate status must be "Paid"
- Estimate must not already be converted to a job

**For Agreements:**
- Agreement status must be "Paid"
- Agreement must not already be converted to a job

#### Conversion Process
1. User opens paid invoice/estimate/agreement
2. Clicks three-dot menu
3. Sees "Convert to Job" option (if eligible)
4. Clicks "Convert to Job"
5. System creates a new job with:
   - Customer information (copied from document)
   - Employee assignment (copied from document)
   - Service details (copied from line items)
   - Pricing information (copied from totals)
   - Location/address (if available)
   - Notes (if any notes exist for the document)
6. Original document status is updated to "Job Created"
7. User is redirected to Jobs screen
8. New job appears in the jobs list

#### UI Behavior
- "Convert to Job" option appears in the three-dot menu:
  - Position: After "Preview", before "Add Note"
  - Icon: Briefcase icon
  - Label: "Convert to Job"
- Option disappears after conversion (prevents duplicate jobs)
- Option does not appear for ineligible documents

#### Data Mapping
When converting, the system maps:
- Document customer → Job customer
- Document employee → Job assigned employee
- Document line items → Job services
- Document total → Job amount
- Document notes → Job notes
- Document creation date → Job creation date

---

## 📅 Dashboard Date Range Filter

### Feature Overview
Dashboard now supports date range selection instead of single-date filtering, allowing users to view data across multiple days.

### Business Logic

#### Default Behavior
- On initial load, date range is set to "Today → Today" (single day, current date)
- Dashboard displays data for today only
- Date range button shows "Today" when both dates are today

#### Date Range Selection
- User clicks date range button
- Date range picker modal opens
- User can select:
  - Start date (first click)
  - End date (second click)
- **Range Validation**:
  - If end date is selected before start date, system swaps them (start becomes end, end becomes start)
  - Start date and end date can be the same (single-day range is valid)
  - Selected range is highlighted in the picker

#### Display Logic
- **Single Day (Today)**: Button shows "Today"
- **Single Day (Not Today)**: Button shows "MMM dd" (e.g., "Dec 15")
- **Date Range**: Button shows "MMM dd – MMM dd" (e.g., "Dec 01 – Dec 05")

#### Data Filtering
After date range selection:
- Dashboard refreshes automatically
- All data is filtered to show only records within the selected range:
  - **Appointments**: Filtered by appointment date
  - **Invoices**: Filtered by issue date
  - **Estimates**: Filtered by creation date
  - **Jobs**: Filtered by job date
- Date comparison uses date-only comparison (ignores time):
  - Records are included if their date falls between start date and end date (inclusive)
  - Uses YYYY-MM-DD format for consistent comparison

#### Navigation with Date Range
When navigating from dashboard stats to detail pages:
- Date range parameters are passed as query strings:
  - `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- Detail pages can use these parameters to filter their data
- Maintains date range context across navigation

---

## 🎨 UI/UX Improvements

### Step Indicator Responsiveness

#### Problem
Step indicators in multi-step forms (Invoices, Estimates, Agreements) were getting cut off or overlapping on smaller mobile screens.

#### Solution
- Step indicators now use responsive sizing:
  - Smaller screens: 7×7 units with smaller text
  - Larger screens: 8×8 units with larger text
- Connector lines between steps are responsive:
  - Smaller screens: Minimum 12px, maximum 24px width
  - Larger screens: Minimum 16px, maximum 32px width
- Container uses horizontal scrolling if needed
- Step text is prevented from wrapping

#### Applied To
- Invoice creation (4 steps)
- Estimate creation (4 steps)
- Agreement creation (5 steps)

### Invoice Card Display

#### Status Badge Positioning
- Status badge ("Paid" or "Unpaid") is positioned to the right of the invoice ID
- Badge uses color coding:
  - "Paid": Green background
  - "Unpaid": Orange/red background
- Badge is always visible and does not break layout on mobile

#### New Invoice Highlighting
- Newly created invoices are temporarily highlighted with a ring border
- Highlight automatically clears after 5 seconds
- Helps users identify newly created invoices after navigation

---

## 🔗 Feature Interactions

### Notes + Convert to Job
- When an invoice/estimate is converted to a job, any notes associated with the document are also copied to the new job
- Notes maintain their original timestamps and creator information

### Sell Product + Notes
- Notes cannot be added during the Sell Product flow (checkout process)
- Notes can be added to the generated invoice after creation via the three-dot menu

### Agreement + Convert to Job
- Paid agreements can be converted to jobs
- Terms and conditions and cancellation policies from the agreement are preserved in the job notes or job details

### Dashboard Filter + Navigation
- Date range selection persists when navigating to detail pages
- Detail pages can use the date range to pre-filter their data
- Returning to dashboard maintains the selected date range

---

## 📊 Data Flow Summary

### Sell Product → Invoice
```
Customer Selection → Product Selection → Checkout → Payment → Invoice Created (Paid, Type: single, Source: sell_product) → Redirect to Invoices List
```

### Agreement Creation
```
Step 1 (Customer/Employee) → Step 2 (Job Details) → Step 3 (Pricing) → Step 4 (Attachments) → Step 5 (Terms & Policies) → Agreement Saved
```

### Note Creation
```
User Input (Text + Attachments) → Note Service → Unified Storage → Display in:
  - Document Note Modal
  - Customer Memo+ View
  - Related Entity Views
```

### Convert to Job
```
Paid Document → Convert Action → Job Created (Data Copied) → Document Status Updated → Redirect to Jobs
```

### Date Range Filter
```
User Selects Range → Dashboard Filters Data → Navigation Passes Parameters → Detail Pages Filter → Return Maintains Range
```

---

## 🎯 Key Business Rules Summary

1. **Sell Product invoices are always "Paid"** - Payment is collected during checkout
2. **Sell Product invoices cannot be converted to jobs** - They represent product sales, not service work
3. **Agreement Step 5 is mandatory for terms** - While optional, it's the designated place for terms and policies
4. **Notes are unified across the system** - One note can appear in multiple views
5. **Notes are grouped by entity, time, and creator** - Prevents duplicate displays
6. **Convert to Job only works for paid documents** - Ensures payment before job creation
7. **Date range defaults to today** - Provides immediate relevant data on load
8. **Date range is inclusive** - Both start and end dates are included in filtering

---

**Document Version:** 3.0 (Developer Product Specification)  
**Last Updated:** Current Week  
**Status:** Ready for Development Review
