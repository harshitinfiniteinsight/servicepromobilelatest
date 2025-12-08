# Agreement Creation Flow - Product Feature Documentation

**Document Type:** Product Feature Specification  
**Target Audience:** Development Team  
**Purpose:** Document the Agreement creation flow, five-step process, and business logic

---

## 📋 Table of Contents
1. [Feature Overview](#feature-overview)
2. [Five-Step Process](#five-step-process)
3. [Step-by-Step Details](#step-by-step-details)
4. [Business Logic & Rules](#business-logic--rules)
5. [Data Structure](#data-structure)
6. [Validation Rules](#validation-rules)
7. [Navigation Logic](#navigation-logic)
8. [Post-Creation Behavior](#post-creation-behavior)
9. [User Experience Flow](#user-experience-flow)

---

## 🎯 Feature Overview

### What is Agreement Creation?
Agreement creation is a comprehensive multi-step form process that guides users through creating detailed service agreements with customers. This process captures all necessary information including customer details, job specifications, pricing, attachments, and legal terms.

### Key Characteristics
- **Five-Step Process**: Structured workflow ensuring all required information is captured
- **Progressive Disclosure**: Information collected in logical sequence
- **Comprehensive Documentation**: Includes terms, conditions, and cancellation policies
- **Flexible Navigation**: Users can move forward and backward between steps
- **Validation at Each Step**: Ensures data quality before proceeding

### Purpose
Agreements serve as formal contracts between the service provider and customer, documenting:
- Service scope and details
- Pricing and payment terms
- Legal terms and conditions
- Cancellation policies
- Supporting documentation

---

## 🔄 Five-Step Process

### Process Overview
The agreement creation process consists of five distinct steps that must be completed in sequence:

1. **Customer & Employee Selection** - Identify parties involved
2. **Job Details** - Define the work to be performed
3. **Pricing/Items** - Specify services and costs
4. **Attachments** - Add supporting documents
5. **Terms and Conditions & Cancellation Policies** - Define legal terms

### Step Indicator
- Visual progress indicator shows current step (e.g., "Step 1 of 5")
- Completed steps display checkmark (✓)
- Current step is highlighted
- Responsive design ensures visibility on all screen sizes

---

## 📝 Step-by-Step Details

### Step 1: Customer & Employee Selection

#### Purpose
Identify the customer and assign the employee responsible for the agreement.

#### User Actions
- **Customer Selection**:
  - User browses customer list
  - User selects a customer
  - Customer information is displayed (name, contact, address)
  
- **Employee Selection**:
  - User browses employee list
  - User selects an employee to assign
  - Employee information is displayed (name, role)

#### System Behavior
- Loads customer list from system
- Loads employee list from system
- Validates selections before enabling "Next" button
- Stores selections in agreement draft

#### Data Captured
```typescript
{
  customerId: string,
  customerName: string,
  customerContact: string,
  customerAddress: string,
  employeeId: string,
  employeeName: string
}
```

#### Validation
- ✅ Customer must be selected
- ✅ Employee must be selected
- ✅ Both selections required to proceed

---

### Step 2: Job Details

#### Purpose
Define the specific work to be performed, location, and any special requirements.

#### User Actions
- **Job Title/Description**:
  - User enters job title or description
  - Text field for detailed job description
  
- **Service Location**:
  - User enters service address
  - May auto-populate from customer address
  - User can modify if different location
  
- **Job Type/Category**:
  - User selects job category (if applicable)
  - Examples: Installation, Repair, Maintenance, Inspection
  
- **Special Instructions**:
  - User enters any special requirements
  - Notes about access, timing, or conditions

#### System Behavior
- Validates required fields
- Stores job details in agreement draft
- May suggest job categories based on customer history

#### Data Captured
```typescript
{
  jobTitle: string,
  jobDescription: string,
  serviceLocation: string,
  jobType: string,
  specialInstructions: string
}
```

#### Validation
- ✅ Job description is required (minimum length)
- ✅ Service location is required
- ✅ Other fields may be optional depending on business rules

---

### Step 3: Pricing/Items

#### Purpose
Specify the services or items included in the agreement with quantities and pricing.

#### User Actions
- **Add Line Items**:
  - User adds services or items
  - For each item, user enters:
    - Service/item name
    - Quantity
    - Unit price
  - System calculates line total (quantity × unit price)
  
- **Modify Items**:
  - User can edit item details
  - User can remove items
  - User can reorder items (if applicable)
  
- **Apply Discount** (if applicable):
  - User can apply percentage discount
  - User can apply fixed amount discount
  
- **Review Totals**:
  - User sees subtotal
  - User sees discount (if applied)
  - User sees tax (if applicable)
  - User sees grand total

#### System Behavior
- **Real-time Calculations**:
  - Calculates line totals as user enters data
  - Updates subtotal when items change
  - Calculates discount on subtotal
  - Calculates tax on discounted amount
  - Updates grand total
  
- **Validation**:
  - Ensures at least one item is added
  - Validates quantities are positive numbers
  - Validates prices are positive numbers
  - Validates discount doesn't exceed subtotal

#### Data Captured
```typescript
{
  items: Array<{
    name: string,
    description: string,
    quantity: number,
    unitPrice: number,
    lineTotal: number
  }>,
  subtotal: number,
  discount: number,
  discountType: "percentage" | "fixed" | null,
  tax: number,
  taxRate: number,
  total: number
}
```

#### Validation
- ✅ At least one item must be added
- ✅ Each item must have name, quantity, and price
- ✅ Quantities must be positive numbers
- ✅ Prices must be positive numbers
- ✅ Discount cannot exceed subtotal

---

### Step 4: Attachments

#### Purpose
Attach supporting documents, photos, or files related to the agreement.

#### User Actions
- **Upload Files**:
  - User clicks upload button
  - User selects files from device
  - Multiple files can be selected
  - Supported file types: Images, PDFs, Documents
  
- **Preview Files**:
  - User can preview uploaded files
  - User can view file names and sizes
  
- **Remove Files**:
  - User can remove files before finalizing
  - User can replace files

#### System Behavior
- Validates file types
- Validates file sizes (if limits set)
- Stores file references in agreement
- May generate thumbnails for images

#### Data Captured
```typescript
{
  attachments: Array<{
    fileName: string,
    fileType: string,
    fileSize: number,
    fileUrl: string,
    uploadedAt: string
  }>
}
```

#### Validation
- ⚠️ Attachments are **optional** (no validation required)
- ✅ File types must be supported
- ✅ File sizes must be within limits (if set)

---

### Step 5: Terms and Conditions & Cancellation Policies

#### Purpose
Define the legal terms, conditions, and cancellation policies that govern the agreement.

#### User Actions

**Terms and Conditions Section:**
- User enters terms and conditions in text area
- Can include:
  - Payment terms
  - Service delivery terms
  - Warranty information
  - Liability clauses
  - Other legal terms
- User can use pre-defined templates (if available)
- User can customize terms

**Cancellation Policies Section:**
- User enters cancellation policies in text area
- Can include:
  - Cancellation notice requirements
  - Refund policies
  - Cancellation fees
  - Time limits for cancellation
- User can use pre-defined templates (if available)
- User can customize policies

**Review & Finalize:**
- User can review all previous steps
- User can go back to make changes
- User finalizes agreement

#### System Behavior
- Stores terms and policies with agreement
- Terms and policies are included when:
  - Viewing agreement
  - Printing agreement
  - Sharing agreement with customer
  - Converting to job (if applicable)

#### Data Captured
```typescript
{
  termsAndConditions: string,
  cancellationPolicies: string
}
```

#### Validation
- ⚠️ Terms and policies are **optional** (no validation required)
- ✅ Recommended to include for legal protection
- ✅ Text length may have maximum limit (if set)

---

## 💼 Business Logic & Rules

### Agreement Status
- **Initial Status**: Typically "Active" or "Pending" upon creation
- **Status Progression**: May change based on:
  - Customer acceptance
  - Payment received
  - Work completion
  - Cancellation

### Agreement Numbering
- **Format**: May use sequential numbering (e.g., AGR-001, AGR-002)
- **Uniqueness**: Each agreement has unique identifier
- **Generation**: Similar to invoice ID generation logic

### Pricing Logic
- **Subtotal**: Sum of all line item totals
- **Discount**: Applied to subtotal (percentage or fixed)
- **Tax**: Calculated on (Subtotal - Discount)
- **Total**: (Subtotal - Discount) + Tax

### Terms and Policies Display
- **In Agreement View**: Terms and policies displayed in dedicated sections
- **In Printed Agreement**: Included in print layout
- **In Shared Agreement**: Included when sharing with customer
- **Formatting**: Preserves line breaks and formatting

### Employee Assignment
- **Purpose**: Tracks which employee is responsible for the agreement
- **Usage**: 
  - Assignment tracking
  - Performance metrics
  - Communication routing

### Customer Association
- **Purpose**: Links agreement to customer record
- **Usage**:
  - Customer history
  - Agreement management
  - Billing and invoicing

---

## 📊 Data Structure

### Complete Agreement Object
```typescript
{
  id: string,                      // Unique agreement ID
  agreementNumber: string,         // Display number (e.g., "AGR-001")
  
  // Step 1: Customer & Employee
  customerId: string,
  customerName: string,
  customerContact: string,
  customerAddress: string,
  employeeId: string,
  employeeName: string,
  
  // Step 2: Job Details
  jobTitle: string,
  jobDescription: string,
  serviceLocation: string,
  jobType: string,
  specialInstructions: string,
  
  // Step 3: Pricing/Items
  items: Array<{
    name: string,
    description: string,
    quantity: number,
    unitPrice: number,
    lineTotal: number
  }>,
  subtotal: number,
  discount: number,
  discountType: "percentage" | "fixed" | null,
  tax: number,
  taxRate: number,
  total: number,
  
  // Step 4: Attachments
  attachments: Array<{
    fileName: string,
    fileType: string,
    fileSize: number,
    fileUrl: string,
    uploadedAt: string
  }>,
  
  // Step 5: Terms & Policies
  termsAndConditions: string,
  cancellationPolicies: string,
  
  // Metadata
  status: "Active" | "Pending" | "Completed" | "Cancelled",
  createdAt: string,              // ISO timestamp
  createdBy: string,              // User/employee who created
  updatedAt: string,              // ISO timestamp
  updatedBy: string               // User/employee who last updated
}
```

---

## ✅ Validation Rules

### Step-by-Step Validation

**Step 1 Validation:**
- ✅ Customer ID must be provided
- ✅ Employee ID must be provided
- ✅ Both must exist in system

**Step 2 Validation:**
- ✅ Job description is required (minimum 10 characters)
- ✅ Service location is required
- ⚠️ Job type is optional
- ⚠️ Special instructions are optional

**Step 3 Validation:**
- ✅ At least one item must be added
- ✅ Each item must have:
  - Name (non-empty string)
  - Quantity (positive number > 0)
  - Unit price (positive number > 0)
- ✅ Discount (if applied):
  - Percentage: 0% to 100%
  - Fixed: Cannot exceed subtotal
- ✅ Tax calculation must be valid

**Step 4 Validation:**
- ⚠️ No validation required (attachments are optional)
- ✅ File types must be supported (if files uploaded)
- ✅ File sizes must be within limits (if files uploaded)

**Step 5 Validation:**
- ⚠️ No validation required (terms and policies are optional)
- ✅ Text length may have maximum limit (if set)

### Final Validation (Before Saving)
- ✅ Steps 1-3 must be completed
- ✅ All required fields in steps 1-3 must be valid
- ⚠️ Steps 4-5 are optional but recommended

---

## 🧭 Navigation Logic

### Forward Navigation
- **Next Button**: Appears on each step (except final step)
- **Validation**: Button is disabled until step validation passes
- **Action**: Moves to next step when clicked
- **Behavior**: Validates current step before proceeding

### Backward Navigation
- **Back Button**: Appears on steps 2-5
- **Action**: Returns to previous step
- **Behavior**: Preserves all entered data
- **No Data Loss**: User can navigate back and forth without losing information

### Step Skipping
- **Not Allowed**: Users cannot skip steps
- **Sequential Only**: Must complete steps in order (1 → 2 → 3 → 4 → 5)
- **Reason**: Ensures all required information is captured

### Progress Indicator
- **Visual Feedback**: Shows current step number (e.g., "Step 3 of 5")
- **Completed Steps**: Display checkmark (✓)
- **Current Step**: Highlighted with active state
- **Upcoming Steps**: Shown in inactive state

### Save Draft (If Implemented)
- **Functionality**: User can save progress and return later
- **Behavior**: Saves all entered data
- **Resume**: User can resume from last completed step

---

## 🎯 Post-Creation Behavior

### Agreement Storage
- Agreement is saved to system storage
- All data from all five steps is persisted
- Agreement receives unique ID and number

### Agreement List Display
- New agreement appears in agreements list
- Sorted by creation date (newest first)
- Displays key information:
  - Agreement number
  - Customer name
  - Total amount
  - Status
  - Creation date

### Agreement Management
- **View**: User can view full agreement details
- **Edit**: User can edit agreement (if allowed)
- **Print**: User can print agreement with all details
- **Share**: User can share agreement with customer
- **Convert to Job**: Paid agreements can be converted to jobs

### Terms and Policies Usage
- **Display**: Terms and policies shown in agreement view
- **Print**: Included in printed agreement document
- **Share**: Included when sharing with customer
- **Legal**: Serve as contract terms

### Integration with Other Features
- **Invoice Creation**: Agreement can be converted to invoice
- **Job Creation**: Paid agreement can be converted to job
- **Customer Profile**: Agreement appears in customer history
- **Employee Tracking**: Agreement tracked in employee assignments

---

## 👤 User Experience Flow

### Complete User Journey

1. **User Initiates Agreement Creation**
   - Navigates to Agreements → Create Agreement
   - Sees Step 1: Customer & Employee Selection

2. **Step 1: Customer & Employee Selection**
   - User selects customer
   - User selects employee
   - "Next" button enabled
   - User proceeds to Step 2

3. **Step 2: Job Details**
   - User enters job description
   - User enters service location
   - User selects job type (optional)
   - User enters special instructions (optional)
   - "Next" button enabled after required fields
   - User proceeds to Step 3

4. **Step 3: Pricing/Items**
   - User adds line items
   - System calculates totals in real-time
   - User applies discount (optional)
   - User reviews pricing breakdown
   - "Next" button enabled after at least one item added
   - User proceeds to Step 4

5. **Step 4: Attachments**
   - User uploads files (optional)
   - User previews uploaded files
   - User can remove files
   - "Next" button always enabled (step is optional)
   - User proceeds to Step 5

6. **Step 5: Terms and Conditions & Cancellation Policies**
   - User enters terms and conditions (optional)
   - User enters cancellation policies (optional)
   - User can review all previous steps
   - User can go back to make changes
   - "Create Agreement" button enabled
   - User finalizes agreement

7. **Agreement Created**
   - System creates agreement
   - User sees success message
   - User is redirected to agreements list
   - New agreement appears at top

8. **Agreement Management**
   - User can view agreement
   - User can print agreement
   - User can share with customer
   - User can convert to job (if paid)

### Error Handling

**Validation Errors:**
- Displayed inline on relevant fields
- Prevent progression until resolved
- Clear error messages guide user

**Network Errors:**
- Display error message
- Allow user to retry
- Preserve entered data

**File Upload Errors:**
- Display error for unsupported file types
- Display error for files exceeding size limits
- Allow user to retry with different file

---

## 🔗 Integration Points

### Customer Service
- Retrieves customer data
- Validates customer existence
- Loads customer history

### Employee Service
- Retrieves employee list
- Validates employee assignment
- Tracks employee assignments

### File Storage Service
- Handles file uploads
- Stores file references
- Manages file access

### Agreement Service
- Creates agreement records
- Generates agreement numbers
- Manages agreement lifecycle

### Invoice/Job Services
- Converts agreements to invoices/jobs
- Transfers agreement data
- Maintains relationships

---

## 📝 Key Business Rules Summary

1. **Five-Step Process**: Must complete steps 1-3, steps 4-5 are optional
2. **Sequential Navigation**: Cannot skip steps, must complete in order
3. **Terms and Policies**: Step 5 is dedicated to terms and cancellation policies
4. **Data Persistence**: All entered data preserved during navigation
5. **Validation**: Required fields validated before progression
6. **Flexible Navigation**: Can move forward and backward between steps
7. **Comprehensive Documentation**: Captures all necessary agreement details
8. **Post-Creation Management**: Agreement can be viewed, printed, shared, converted

---

**Document Version:** 1.0  
**Last Updated:** Current Week  
**Status:** Ready for Development Review


