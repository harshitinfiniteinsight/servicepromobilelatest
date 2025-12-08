# Sell Product Flow - Product Feature Documentation

**Document Type:** Product Feature Specification  
**Target Audience:** Development Team  
**Purpose:** Document the Sell Product flow, business logic, and invoice generation process

---

## 📋 Table of Contents
1. [Feature Overview](#feature-overview)
2. [Flow Sequence](#flow-sequence)
3. [Business Logic & Rules](#business-logic--rules)
4. [Invoice Generation](#invoice-generation)
5. [Navigation & Display](#navigation--display)
6. [Data Structure](#data-structure)
7. [Restrictions & Edge Cases](#restrictions--edge-cases)
8. [User Experience Flow](#user-experience-flow)

---

## 🎯 Feature Overview

### What is Sell Product?
The "Sell Product" feature enables users to sell products directly to customers through a streamlined checkout process. Unlike traditional invoice creation, this flow is optimized for point-of-sale scenarios where payment is collected immediately.

### Key Characteristics
- **Immediate Payment**: Payment is collected during checkout (no deferred payment option)
- **Automatic Invoice Generation**: System automatically creates an invoice upon payment completion
- **Product-Focused**: Designed for product sales, not service work
- **Single Transaction**: Creates one-time invoices (not recurring)

---

## 🔄 Flow Sequence

### Step 1: Customer Selection
**User Action:**
- User navigates to "Sell Product" feature
- User selects a customer from the customer list
- Customer information is loaded and displayed

**System Behavior:**
- Validates customer selection
- Loads customer details (name, contact, address, payment history)
- Enables product selection step

**Validation:**
- Customer must be selected to proceed
- Customer must exist in the system

---

### Step 2: Product Selection
**User Action:**
- User browses available products
- User adds products to cart with quantities
- User can modify quantities or remove items
- User can apply discounts (if applicable)

**System Behavior:**
- Displays product catalog with prices
- Maintains shopping cart state
- Calculates line item totals (price × quantity)
- Updates cart total in real-time

**Data Captured:**
- Product ID
- Product name
- Unit price
- Quantity
- Line item total

---

### Step 3: Checkout Summary
**User Action:**
- User reviews cart contents
- User can still modify quantities or remove items
- User can apply discount (percentage or fixed amount)
- User reviews calculated totals

**System Calculations:**
1. **Subtotal** = Sum of all (product price × quantity)
2. **Discount Calculation**:
   - If percentage: Discount = Subtotal × (discount percentage / 100)
   - If fixed amount: Discount = fixed amount
3. **Tax Calculation** = (Subtotal - Discount) × (tax rate / 100)
4. **Total** = (Subtotal - Discount) + Tax

**Display:**
- Itemized list of products
- Subtotal
- Discount (if applied)
- Tax
- Grand total

---

### Step 4: Payment Processing
**User Action:**
- User selects payment method:
  - Cash
  - Credit/Debit Card
  - Check
  - Other payment methods
- User confirms payment

**System Behavior:**
- Validates payment method selection
- Processes payment (if integrated with payment gateway)
- Records payment details
- Triggers invoice generation

**Validation:**
- Payment method must be selected
- Full payment is required (no partial payment option)
- Payment amount must equal total amount

---

### Step 5: Invoice Generation
**User Action:**
- System automatically creates invoice (no user action required)

**System Behavior:**
- Generates unique invoice ID using sequential numbering
- Creates invoice record with all transaction data
- Marks invoice as "Paid" (since payment collected)
- Sets invoice type and source identifiers
- Saves invoice to system storage
- Redirects user to invoice list

---

## 💼 Business Logic & Rules

### Invoice Status
- **Always "Paid"**: Invoices created from Sell Product are automatically marked as "Paid"
  - **Reason**: Payment is collected during checkout, so invoice is paid upon creation
  - **Implication**: No need for separate payment processing later

### Invoice Type
- **Type: "single"**: Indicates this is a single transaction invoice
  - **Reason**: Product sales are one-time transactions, not recurring
  - **Distinction**: Different from recurring invoices or subscription-based invoices

### Invoice Source
- **Source: "sell_product"**: Identifies the origin of the invoice
  - **Purpose**: Allows system to differentiate between:
    - Invoices from Sell Product flow
    - Manually created invoices
    - Invoices converted from estimates
    - Invoices converted from agreements
  - **Usage**: Used to apply different business rules (e.g., hiding "Convert to Job" option)

### Invoice ID Generation
- **Format**: `INV-XXX` where XXX is a zero-padded 3-digit number (e.g., INV-001, INV-031, INV-132)
- **Generation Logic**:
  1. System retrieves all existing invoice IDs (from storage and mock data)
  2. Extracts numeric portion from each ID matching pattern `INV-(\d+)`
  3. Finds the highest number
  4. Increments by 1
  5. Formats with zero-padding to 3 digits
  6. Prefixes with "INV-"
- **Uniqueness**: Ensures no duplicate IDs across all invoice types
- **Sequential**: Maintains sequential numbering regardless of invoice source

### Payment Rules
- **Full Payment Required**: Partial payments are not supported in Sell Product flow
  - **Reason**: This is a point-of-sale transaction, not a credit sale
  - **Business Rule**: Customer must pay full amount to complete transaction
- **Payment Method Required**: User must select a payment method
- **Payment Amount Validation**: Payment amount must exactly equal calculated total

### Discount Application
- **Discount Types Supported**:
  - Percentage discount (e.g., 10% off)
  - Fixed amount discount (e.g., $50 off)
- **Discount Calculation**:
  - Applied to subtotal
  - Tax is calculated on discounted amount
- **Discount Validation**:
  - Percentage: Must be between 0% and 100%
  - Fixed amount: Cannot exceed subtotal

### Tax Calculation
- **Tax Base**: Calculated on (Subtotal - Discount)
- **Tax Rate**: System-defined or user-configurable
- **Tax Display**: Shown separately in breakdown

---

## 📄 Invoice Generation

### Invoice Data Structure
When an invoice is created from Sell Product, it includes:

```typescript
{
  id: string,                    // Generated invoice ID (e.g., "INV-031")
  customerId: string,            // Selected customer ID
  customerName: string,          // Customer name
  issueDate: string,             // Date invoice was created (YYYY-MM-DD)
  dueDate: string,               // Same as issueDate (since already paid)
  status: "Paid",                // Always "Paid"
  type: "single",                // Always "single"
  source: "sell_product",        // Identifies origin
  paymentMethod: string,         // Selected payment method
  items: Array<{                 // Product line items
    name: string,
    quantity: number,
    price: number,
    total: number
  }>,
  subtotal: number,              // Sum of all line items
  discount: number,              // Applied discount amount
  discountType: string,          // "percentage" or "fixed"
  tax: number,                   // Calculated tax
  total: number,                 // Final total amount
  employeeId: string,            // Employee who processed sale
  employeeName: string,          // Employee name
  createdAt: string,             // ISO timestamp
  notes: string                  // Optional notes (if any)
}
```

### Invoice Creation Process
1. **Validate Data**: Ensure all required fields are present
2. **Generate ID**: Create unique invoice ID using sequential logic
3. **Set Defaults**: 
   - Status = "Paid"
   - Type = "single"
   - Source = "sell_product"
   - Issue date = Current date
   - Due date = Current date (since already paid)
4. **Create Invoice Object**: Assemble all data into invoice structure
5. **Save to Storage**: Persist invoice to localStorage/system storage
6. **Return Invoice**: Return created invoice object with generated ID

---

## 🧭 Navigation & Display

### Post-Payment Navigation
**Destination**: `/invoices?tab=single`

**Navigation Behavior:**
- User is redirected immediately after invoice creation
- Navigation uses `replace: true` to prevent back button returning to checkout
- New invoice ID is passed in navigation state (for highlighting)

### Invoice List Display
**Tab**: "Single" tab is automatically selected

**Invoice Card Display:**
- **Invoice ID**: Displayed prominently (e.g., "INV-031")
- **Status Badge**: 
  - Position: To the right of invoice ID
  - Color: Green (for "Paid" status)
  - Text: "Paid"
- **Customer Name**: Displayed below ID
- **Total Amount**: Formatted currency display
- **Dates**: Issue date and due date (same date for Sell Product invoices)
- **Layout**: Responsive, no layout breaking on mobile devices

### New Invoice Highlighting
**Visual Indicator:**
- Newly created invoice is highlighted with a ring border
- Border color: Primary brand color
- Border style: Ring/outline (not full border)

**Timing:**
- Highlight appears immediately when invoice list loads
- Highlight automatically clears after 5 seconds
- User can still interact with invoice during highlight period

**Implementation Logic:**
- System checks navigation state for `newInvoiceId`
- If present, applies highlight class to matching invoice card
- Sets timeout to remove highlight after 5 seconds

### Sorting
- Invoices are sorted by creation date (newest first)
- New invoice appears at the top of the list
- Sorting is consistent across all invoice types

---

## 📊 Data Structure

### Cart Item Structure
```typescript
{
  productId: string,
  productName: string,
  price: number,
  quantity: number,
  lineTotal: number  // price × quantity
}
```

### Checkout State
```typescript
{
  customer: Customer,
  items: CartItem[],
  subtotal: number,
  discount: number,
  discountType: "percentage" | "fixed" | null,
  tax: number,
  total: number,
  paymentMethod: string | null,
  employeeId: string,
  employeeName: string
}
```

### Invoice Line Item
```typescript
{
  name: string,        // Product name
  quantity: number,    // Quantity purchased
  price: number,       // Unit price
  total: number        // Line total (price × quantity)
}
```

---

## 🚫 Restrictions & Edge Cases

### Convert to Job Restriction
**Rule**: Invoices created from Sell Product do NOT show "Convert to Job" option

**Reason:**
- Sell Product invoices represent product sales, not service work
- Jobs are for service delivery, not product delivery
- Converting product sales to jobs would create incorrect job records

**Implementation:**
- System checks `invoice.source === "sell_product"`
- If true, "Convert to Job" option is hidden in three-dot menu
- Option remains available for manually created invoices and invoices from estimates/agreements

### Payment Restrictions
- **No Partial Payment**: Full payment required at checkout
- **No Payment Plans**: Installment payments not supported
- **No Credit Terms**: All sales are cash-on-delivery equivalent

### Product Restrictions
- **Inventory Check**: System may validate product availability (if inventory tracking enabled)
- **Quantity Validation**: Quantity must be positive integer
- **Price Validation**: Price must be positive number

### Customer Restrictions
- **Active Customer Required**: Customer must be active in system
- **No Guest Checkout**: Customer selection is mandatory

### Navigation Restrictions
- **No Back Navigation After Payment**: Once payment is processed, user cannot return to checkout
- **Invoice Creation is Final**: Invoice cannot be cancelled or deleted from Sell Product flow (must use invoice management)

---

## 👤 User Experience Flow

### Complete User Journey

1. **User initiates Sell Product**
   - Navigates to Sales → Sell Product
   - Sees customer selection screen

2. **Customer Selection**
   - User selects customer from list
   - Customer details displayed
   - "Continue" button enabled

3. **Product Selection**
   - User browses products
   - Adds products to cart
   - Sees cart total update
   - Can modify quantities
   - Proceeds to checkout

4. **Checkout Summary**
   - User reviews items
   - Applies discount (optional)
   - Reviews totals breakdown
   - Proceeds to payment

5. **Payment Selection**
   - User selects payment method
   - Confirms payment
   - System processes payment

6. **Invoice Creation (Automatic)**
   - System creates invoice
   - User sees loading/processing indicator
   - Invoice is saved

7. **Redirect to Invoices**
   - User is taken to invoice list
   - "Single" tab is selected
   - New invoice appears at top
   - Invoice is highlighted (ring border)
   - Highlight clears after 5 seconds

8. **Invoice Management**
   - User can view invoice details
   - User can preview invoice
   - User can add notes (via three-dot menu)
   - User cannot convert to job (option hidden)

### Error Handling

**Customer Not Selected:**
- User cannot proceed to product selection
- Error message: "Please select a customer"

**Cart Empty:**
- User cannot proceed to checkout
- Error message: "Please add at least one product"

**Payment Method Not Selected:**
- User cannot complete transaction
- Error message: "Please select a payment method"

**Payment Processing Failure:**
- Transaction is cancelled
- User remains on payment screen
- Error message: "Payment processing failed. Please try again."

**Invoice Creation Failure:**
- Transaction data is preserved
- User can retry invoice creation
- Error message: "Failed to create invoice. Please contact support."

---

## 🔗 Integration Points

### Invoice Service
- Uses same invoice service as manual invoice creation
- Shares invoice ID generation logic
- Uses same storage mechanism

### Customer Service
- Retrieves customer data
- Validates customer existence
- Loads customer payment history

### Product/Inventory Service
- Retrieves product catalog
- Validates product availability (if enabled)
- Updates inventory (if enabled)

### Payment Service
- Processes payment transactions
- Records payment details
- Handles payment gateway integration (if applicable)

### Employee Service
- Tracks which employee processed sale
- Records employee assignment

---

## 📝 Key Business Rules Summary

1. **Payment is Immediate**: All Sell Product transactions require immediate full payment
2. **Invoice is Always Paid**: Status is automatically set to "Paid" upon creation
3. **No Job Conversion**: Sell Product invoices cannot be converted to jobs
4. **Sequential ID Generation**: Uses same ID format and logic as all invoices
5. **Single Transaction Type**: Always creates "single" type invoices
6. **Source Identification**: All invoices tagged with "sell_product" source
7. **Automatic Navigation**: Redirects to invoice list after creation
8. **New Invoice Highlighting**: Visual feedback for newly created invoices

---

**Document Version:** 1.0  
**Last Updated:** Current Week  
**Status:** Ready for Development Review


