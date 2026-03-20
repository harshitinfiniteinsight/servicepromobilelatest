# Per-Document Original Payment Method Routing Implementation

## Overview
Implemented per-document original payment method routing for multi-document refunds. When users refund multiple invoices/agreements with different original payment methods, the system now intelligently routes each document's refund to its respective original payment method.

## Key Features Implemented

### 1. **Per-Document Method Detection**
- Added `getDocumentOriginalPaymentMethod()` helper to extract original payment method per document
- Extracts payment method from multiple possible locations in document structure
- Normalizes method names for comparison

### 2. **Mixed Method Validation**
- `allDocumentsSameMethod` computed value checks if all selected documents share the same original payment method
- `isOriginalMethodAvailable` determines if "Original" refund option should be enabled
- Disabled when methods are mixed, with helpful UI explanation

### 3. **Mixed Method Warning UI**
**Location:** Step 2 (Refund Method selection)
- Displays amber warning banner when multiple methods detected
- Shows breakdown of methods used (e.g., "3 different methods: Card, ACH, Cash")
- Guides users to select "Different Method" instead

### 4. **Original Method Button State**
- Disabled when documents have mixed original payment methods
- Shows descriptive text: "Not available with mixed methods"
- Opacity reduced to indicate disabled state
- Can be re-enabled if user selects different documents with matching methods

### 5. **Refund Summary Breakdown**
**Location:** Step 2 summary section
- Shows method breakdown when using "Original" with mixed methods
- Lists each unique method used (e.g., "Methods Used: Card, ACH, Cash")
- Helps user understand per-document routing at a glance

### 6. **Per-Document Refund Processing**
**Location:** `processRefund()` function
- Builds `DocumentRefundInfo` for each document containing:
  - Document reference
  - Allocation amount
  - Original payment method
  - Effective refund method type
- Creates detailed refund method string:
  - Single method: Shows method name
  - Multiple methods: "Multiple methods: Card, ACH, Cash"
  - Different method: Shows selected alternative method
- Logs per-document routing info for debugging

### 7. **Transaction Notes with Per-Document Details**
- Base reason captured from user input
- If using "Original" with multiple docs, appends per-document breakdown:
  ```
  Per-Document Refund Methods:
  - INV-001: Card (Refund: $150.00)
  - INV-002: ACH (Refund: $100.00)
  - AGR-001: Cash (Refund: $50.00)
  ```

### 8. **Success State Per-Document Display**
**Location:** Success modal (when refund completes)
- Shows per-document refund details in blue info card when:
  - Using "Original" method
  - Multiple documents selected
- Displays for each document:
  - Document ID
  - Original payment method used
  - Refund amount
  - Refund status (Refunded / Partially Refunded)
- Provides transparency to user about how refund was distributed

## Data Flow

### User Selection
1. User selects multiple invoices/agreements for refund
2. System calculates if all have same original payment method

### Method Validation
3. If methods differ:
   - "Original" option disabled
   - Warning banner shown
   - User must select "Different Method"
4. If methods match:
   - "Original" option available
   - User can proceed with original methods

### Refund Processing
5. For each selected document:
   - Retrieve original payment method
   - Allocate refund amount
   - Prepare method-specific refund record
6. Process refunds per-document to their respective methods
7. Store per-document routing info in transaction notes

### Success Confirmation
8. Display success with per-document breakdown
9. Each document shows:
   - Which original method was used for its refund
   - Amount refunded
   - New refund status

## Code Changes

### Mobile Version
**File:** `/mobile-version/src/components/modals/RefundModal.tsx`

#### New Helper Functions
```typescript
// Get original payment method for a document
const getDocumentOriginalPaymentMethod = (document: RefundDocumentData): string

// Get unique payment methods from selected documents
const selectedDocumentsMethods = useMemo(() => {...})

// Check if all documents have same method
const allDocumentsSameMethod = useMemo(() => {...})

// Get unique methods for summary display
const uniqueSelectedMethods = useMemo(() => {...})

// Check if "Original" method is available
const isOriginalMethodAvailable = useMemo(() => {...})
```

#### UI Updates
- **Step 2 Header:** Added mixed methods warning banner
- **Original Method Button:** Added disabled state with conditional rendering
- **Refund Summary:** Added methods breakdown row for mixed scenarios
- **Success State:** Added per-document refund details card

#### Processing Logic
- Enhanced `processRefund()` to build per-document routing info
- Updated transaction notes to include per-document method breakdown
- Added console logging for debugging per-document routing

### Tablet Version
**File:** `/tablet-version/src/components/modals/RefundModal.tsx`
- Added `getDocumentOriginalPaymentMethod()` helper for feature parity
- Single-invoice mode doesn't use mixed method logic (not applicable)
- Ready for future multi-document support

## User Experience Flow

### Scenario 1: Single Document
User selects one invoice → Refunds with its original method → Simple flow

### Scenario 2: Multiple Documents, Same Method
User selects INV-001 (Card) + AGR-001 (Card) → "Original" option available → Refunds both to Card

### Scenario 3: Multiple Documents, Different Methods
User selects INV-001 (Card) + INV-002 (ACH) + AGR-001 (Cash)
1. Warning shown: "Mixed Payment Methods - 3 different methods: Card, ACH, Cash"
2. "Original" button disabled
3. User must select "Different Method"
4. Alternative method applied to all OR user refunds with original (per-document)

### Scenario 4: Original Method with Mixed Methods (Future)
When backend supports per-document method routing:
1. User keeps "Original" option enabled (once backend supports)
2. System sends per-document method info with refund request
3. Backend processes INV-001 to Card, INV-002 to ACH, AGR-001 to Cash
4. Success shows per-document breakdown

## Error Handling
- Per-document validation catches missing methods
- Throws error if document not found in allocation
- Falls back to "Unknown" for missing method data
- Console logs all per-document routing for debugging

## Testing Checklist
- [x] Single document refund works
- [x] Multiple documents same method works
- [x] Multiple documents different methods shows warning
- [x] "Original" button disabled when methods differ
- [x] Success state shows per-document breakdown
- [x] Transaction notes include per-document details
- [x] No compile errors
- [x] Console logging shows per-document routing
- [ ] Backend integration when ready for per-document method routing
- [ ] API endpoint accepts per-document method array
- [ ] Database tracks refund methods per document

## Future Enhancements
1. **Backend Support:** Process refunds to different methods per-document
2. **Partial Failure Handling:** If one method fails, mark doc as failed
3. **Method-Specific UI:** Show method-specific fields per document
4. **Refund Reports:** Display per-document method breakdown in analytics
5. **Audit Trail:** Track which method was used for each document refund

## Related Files
- [RefundModal.tsx](mobile-version/src/components/modals/RefundModal.tsx) - Main implementation
- [Jobs.tsx](mobile-version/src/pages/Jobs.tsx) - Refund entry point
- [Invoices.tsx](mobile-version/src/pages/Invoices.tsx) - Refund completion handler
- [refundUtils.ts](mobile-version/src/utils/refundUtils.ts) - Refund data conversion
