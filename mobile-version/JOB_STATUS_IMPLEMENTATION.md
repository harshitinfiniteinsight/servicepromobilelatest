# Job Status Implementation - Product Feature Documentation

## Purpose
This document explains the complete implementation of the Job Status feature in the Job Dashboard from a product feature and business logic perspective. This is a prototype implementation that demonstrates the workflow, user interactions, and system behaviors.

---

## 1. Overview

The Job Status feature is a core functionality in the Job Dashboard that enables users to track and manage the lifecycle of service jobs. Jobs are created from three types of business documents: **Invoices**, **Estimates**, and **Agreements**. Each job has a status that indicates its current state in the workflow.

### Key Capabilities
- Visual tracking of job progress through different stages
- Filtering and searching jobs by status
- Automated workflows triggered by status changes
- Document lifecycle management (activation/deactivation)
- Real-time metrics and reporting
- Role-based access control

---

## 2. Job Status Types

The system supports five primary job statuses, each representing a distinct stage in the job lifecycle:

### 2.1 Scheduled
**Visual Identity:** Orange/Blue color scheme  
**Business Meaning:** The job has been planned and assigned to a technician, but work has not yet begun.  
**When Used:**
- Initial status for newly created jobs
- Status when reactivating a previously cancelled job
- Default status for jobs created from open invoices, estimates, or agreements

**Business Logic:**
- Jobs in this status are ready to begin
- Technicians can see these jobs in their assigned list
- Merchants can reassign employees to jobs in this status
- Jobs can transition to "In Progress" when work begins

### 2.2 In Progress
**Visual Identity:** Yellow/Warning color scheme  
**Business Meaning:** Work on the job has begun and is currently being performed by the assigned technician.  
**When Used:**
- When a technician starts working on a scheduled job
- Automatically set for jobs created from overdue invoices
- Automatically set for jobs created from open agreements

**Business Logic:**
- Indicates active work is happening
- Job is no longer available for reassignment
- Technicians are actively engaged with this job
- Can transition to "Completed" when work is finished

### 2.3 Completed
**Visual Identity:** Green/Success color scheme  
**Business Meaning:** All work on the job has been finished, but customer feedback may not yet be received.  
**When Used:**
- When a technician finishes all work on a job
- Automatically set for jobs created from paid invoices, estimates, or agreements
- Triggers the feedback collection workflow

**Business Logic:**
- Work is done, but customer satisfaction is pending
- Automatically triggers feedback form workflow
- Can transition to "Feedback Received" when customer submits feedback
- Represents a milestone in the job lifecycle

### 2.4 Cancel
**Visual Identity:** Red/Destructive color scheme  
**Business Meaning:** The job has been cancelled and the underlying business document (invoice/estimate/agreement) is deactivated.  
**When Used:**
- When a job needs to be cancelled at any stage
- Can be set from any other status
- Results in document deactivation

**Business Logic:**
- Stops the job workflow
- Deactivates the underlying document (invoice, estimate, or agreement)
- Document becomes inactive and cannot be edited
- Can be reactivated by merchants (changes status back to "Scheduled")
- Only merchants can reactivate cancelled jobs

### 2.5 Feedback Received
**Visual Identity:** Teal/Success variant color scheme  
**Business Meaning:** The job is completed and customer feedback has been submitted.  
**When Used:**
- Automatically set when customer submits feedback for a completed job
- Only appears after a job has been marked as "Completed"
- Represents the final stage of the job lifecycle

**Business Logic:**
- Indicates customer has provided satisfaction feedback
- Feedback includes rating, comment, and timestamp
- Represents successful job completion with customer engagement
- Final state in the normal job workflow

---

## 3. Status Lifecycle & Transitions

### 3.1 Standard Job Flow

The typical job progresses through these stages:

**Scheduled → In Progress → Completed → Feedback Received**

#### Stage 1: Scheduled
- Job is created and assigned to a technician
- Customer information and job details are confirmed
- Job appears in technician's job list
- Ready to begin work

#### Stage 2: In Progress
- Technician begins work on the job
- Job status is updated to reflect active work
- Job is no longer available for reassignment
- Work is actively being performed

#### Stage 3: Completed
- All work is finished
- Job completion triggers feedback workflow
- System checks if feedback form should be sent automatically
- If auto-send is enabled: Feedback form is automatically emailed to customer
- If auto-send is disabled: Modal appears with options to send feedback form via email/SMS or fill form directly

#### Stage 4: Feedback Received
- Customer submits feedback (rating and comment)
- Status automatically changes from "Completed" to "Feedback Received"
- Feedback data is stored with timestamp
- Job lifecycle is complete

### 3.2 Cancellation Flow

Jobs can be cancelled at any point in their lifecycle:

**Any Status → Cancel**

**When Cancelled:**
- Job status changes to "Cancel"
- Underlying document (Invoice/Estimate/Agreement) is automatically deactivated
- Document becomes inactive and cannot be edited
- System stores deactivation information
- User receives confirmation notification

**Reactivation (Merchant Only):**
- Cancelled jobs can be reactivated by merchants
- Status changes from "Cancel" to "Scheduled"
- Underlying document is reactivated
- Document becomes editable again
- Job returns to workflow

### 3.3 Status Transition Rules

The system allows flexible status transitions:

- **Any status can transition to any other status** - Provides flexibility for real-world scenarios
- **Scheduled → In Progress** - Normal workflow progression when work begins
- **In Progress → Completed** - Normal workflow completion when work finishes
- **Completed → Feedback Received** - Automatic transition when customer submits feedback
- **Any Status → Cancel** - Can cancel at any point in the workflow
- **Cancel → Scheduled** - Reactivation (merchant only)

---

## 4. Visual Representation & User Interface

### 4.1 Status Badge Display

Each job card displays the current status as a colored badge:

- **Scheduled:** Orange/Blue badge with light background
- **In Progress:** Yellow badge with light background
- **Completed:** Green badge with light background
- **Cancel:** Red badge with light background
- **Feedback Received:** Teal badge with light background

### 4.2 Status Dropdown Control

Each job card includes an interactive status dropdown:

- Located in the top-right corner of the job card
- Displays current status as a colored badge
- Clicking opens a dropdown menu with all available status options
- Users can select a new status to change the job's state
- Change is applied immediately upon selection
- System handles all associated workflows automatically

### 4.3 Status Filter

Users can filter the job list by status:

- **All Statuses** - Shows all jobs regardless of status
- **Scheduled** - Shows only scheduled jobs
- **In Progress** - Shows only in-progress jobs
- **Completed** - Shows only completed jobs
- **Cancel** - Shows only cancelled jobs
- **Feedback Received** - Shows only jobs with feedback

Filtering is applied in real-time as the user selects different status options.

---

## 5. Status Change Mechanism

### 5.1 User Interaction Methods

Users can change job status through two primary methods:

**Method 1: Status Dropdown on Job Card**
- Direct status change from the job card
- Immediate visual feedback
- All status options available
- Works for both merchants and employees

**Method 2: Reactivate from Menu (Cancelled Jobs Only)**
- Three-dot menu on job card
- "Reactivate" option appears when status is "Cancel"
- Only visible to merchants (not employees)
- Changes status from "Cancel" to "Scheduled"
- Reactivates underlying document

### 5.2 Status Change Processing

When a status change occurs, the system:

1. **Updates Job Status** - Changes the status in the job record
2. **Checks for Special Conditions:**
   - If changing to "Cancel": Deactivates underlying document
   - If changing from "Cancel": Reactivates underlying document
   - If changing to "Completed": Triggers feedback workflow
3. **Executes Associated Workflows:**
   - Document activation/deactivation
   - Feedback form sending
   - Status-dependent menu options
4. **Updates User Interface:**
   - Refreshes job card display
   - Updates metrics dashboard
   - Applies filters if active
5. **Provides User Feedback:**
   - Shows success notification
   - Confirms the status change

---

## 6. Integration with Feedback System

### 6.1 Automatic Feedback Workflow

When a job status changes to "Completed", the system automatically initiates the feedback collection process:

**Step 1: Status Change Detection**
- System detects status change to "Completed"
- Checks if feedback already exists for this job
- If feedback exists, workflow is skipped

**Step 2: Auto-Send Setting Check**
- System checks global "auto-send feedback" setting
- This is a user-configurable preference

**Step 3A: Auto-Send Enabled**
- Feedback form is automatically sent via email to customer
- No modal appears to the user
- System tracks that feedback form was sent
- User receives notification that email was sent

**Step 3B: Auto-Send Disabled**
- Modal appears with feedback form options
- User can choose to:
  - Send feedback form via email
  - Send feedback form via SMS
  - Fill feedback form directly (for testing/demo)
- User selects preferred method
- System sends feedback form accordingly

**Step 4: Feedback Submission**
- Customer receives feedback form
- Customer submits feedback (rating and comment)
- System automatically changes status from "Completed" to "Feedback Received"
- Feedback data is stored with timestamp
- Job lifecycle is complete

### 6.2 Feedback Status Tracking

The system maintains feedback information for each job:

- **Feedback Existence Check:** System tracks whether feedback exists for each job
- **Feedback Data Storage:** Stores rating, comment, and submission timestamp
- **Feedback Display:** "View Feedback" option appears in menu when feedback exists
- **Data Persistence:** Feedback data persists across page reloads

### 6.3 Feedback Menu Options

The job card menu shows different options based on feedback status:

**When Auto-Send is Enabled:**
- "View Feedback" appears if feedback exists
- "Send Feedback Form" does not appear (handled automatically)

**When Auto-Send is Disabled:**
- "View Feedback" appears if feedback exists
- "Send Feedback Form" appears for completed jobs without feedback
- User has manual control over feedback form sending

---

## 7. Document Lifecycle Management

### 7.1 Document Deactivation (Cancel Status)

When a job status changes to "Cancel", the system automatically manages the underlying document:

**For Invoices (INV-XXX):**
- Invoice is marked as deactivated
- Invoice becomes non-editable
- Deactivation is tracked in the system
- Invoice remains visible but inactive

**For Estimates (EST-XXX):**
- Estimate is marked as deactivated
- Estimate becomes non-editable
- Deactivation is tracked in the system
- Estimate remains visible but inactive

**For Agreements (AGR-XXX):**
- Agreement is marked as deactivated
- Agreement becomes non-editable
- Deactivation is tracked in the system
- Agreement remains visible but inactive

**Business Impact:**
- Prevents accidental editing of cancelled documents
- Maintains audit trail of cancelled work
- Documents can be reactivated if needed

### 7.2 Document Reactivation

When a cancelled job is reactivated (status changes from "Cancel" to "Scheduled"):

- Document ID is removed from deactivation list
- Document becomes active and editable again
- Job returns to "Scheduled" status
- Job is available for reassignment
- User receives confirmation notification

**Access Control:**
- Only merchants can reactivate cancelled jobs
- Employees cannot reactivate jobs
- Reactivation option is hidden from employee view

---

## 8. Status Filtering & Metrics

### 8.1 Status-Based Filtering

Users can filter the job list by status to focus on specific job states:

**Filter Options:**
- All Statuses - Comprehensive view of all jobs
- Scheduled - View upcoming work
- In Progress - View active work
- Completed - View finished work awaiting feedback
- Cancel - View cancelled jobs
- Feedback Received - View jobs with customer feedback

**Filter Behavior:**
- Filter is applied immediately upon selection
- Job list updates in real-time
- Metrics dashboard reflects filtered results
- Filter can be combined with other filters (date, employee, job type, payment status)

### 8.2 Status Metrics Dashboard

The dashboard displays real-time metrics for each status:

**Group 1 (Primary View):**
- **Scheduled Count:** Number of jobs ready to begin (Orange card)
- **In Progress Count:** Number of active jobs (Yellow card)
- **Completed Count:** Number of finished jobs (Green card)

**Group 2 (Secondary View - Swipe to Access):**
- **Cancel Count:** Number of cancelled jobs (Red card)
- **Feedback Received Count:** Number of jobs with feedback (Teal card)

**Metrics Calculation:**
- Metrics are calculated in real-time based on current filter settings
- Counts update automatically when statuses change
- Metrics reflect only jobs visible in current filter view
- Provides quick overview of job distribution

**User Experience:**
- Metrics displayed in carousel format
- Users can swipe between metric groups
- Visual color coding matches status colors
- Large numbers for easy reading

---

## 9. User Roles & Permissions

### 9.1 Merchant (Admin) Role

Merchants have full access to all job status features:

**Status Management:**
- Can change job status to any status
- Can reactivate cancelled jobs
- Can view all jobs (not filtered by employee)

**Job Management:**
- Can reassign employees to scheduled jobs
- Can edit jobs (if payment status is "Open")
- Can view all jobs across all employees

**Feedback Management:**
- Can send feedback forms manually
- Can view all feedback
- Can configure auto-send feedback setting

**Document Management:**
- Can reactivate cancelled documents
- Full access to all document operations

### 9.2 Employee (Technician) Role

Employees have limited access focused on their assigned work:

**Status Management:**
- Can change job status to any status
- Cannot reactivate cancelled jobs
- Can only view their own assigned jobs

**Job Management:**
- Cannot reassign employees
- Cannot edit jobs
- Can view only jobs assigned to them

**Feedback Management:**
- Can send feedback forms manually
- Can view feedback for their jobs
- Cannot configure auto-send setting

**Document Management:**
- Cannot reactivate cancelled documents
- Limited access to document operations

---

## 10. Status Initialization

### 10.1 Job Creation from Documents

When jobs are created from invoices, estimates, or agreements, the initial status is automatically determined based on the source document's payment status:

**From Invoices:**
- **Paid Invoice → Completed Status:** Job starts as completed since payment is received
- **Overdue Invoice → In Progress Status:** Job starts as in-progress since payment is overdue
- **Open Invoice → Scheduled Status:** Job starts as scheduled since payment is pending

**From Estimates:**
- **Paid Estimate → Completed Status:** Job starts as completed since estimate is paid
- **Open Estimate → Scheduled Status:** Job starts as scheduled since estimate is pending

**From Agreements:**
- **Paid Agreement → Completed Status:** Job starts as completed since agreement is paid
- **Open Agreement → In Progress Status:** Job starts as in-progress since agreement is active

**Business Logic:**
- Initial status reflects the business state of the source document
- Paid documents create completed jobs (work already done)
- Open documents create scheduled or in-progress jobs (work pending)
- Overdue invoices create in-progress jobs (work in progress, payment delayed)

---

## 11. Business Logic & Workflows

### 11.1 Status Change Workflow

When a user changes a job status, the system executes a comprehensive workflow:

**Workflow Steps:**

1. **Status Update**
   - Job status is updated in the system
   - UI is refreshed to show new status

2. **Conditional Processing**
   - System checks if status changed to "Cancel"
   - System checks if status changed from "Cancel"
   - System checks if status changed to "Completed"

3. **Document Management (If Cancelled)**
   - Identifies document type (Invoice/Estimate/Agreement)
   - Deactivates the document
   - Stores deactivation information
   - Prevents document editing

4. **Document Management (If Reactivated)**
   - Identifies document type
   - Reactivates the document
   - Removes from deactivation list
   - Enables document editing

5. **Feedback Workflow (If Completed)**
   - Checks if feedback already exists
   - Checks auto-send setting
   - Sends feedback form or shows modal
   - Tracks feedback form status

6. **User Notification**
   - Shows success message
   - Confirms status change
   - Provides feedback on actions taken

### 11.2 Feedback Collection Workflow

The feedback collection process is triggered automatically when jobs are completed:

**Workflow Steps:**

1. **Trigger Point**
   - Job status changes to "Completed"
   - System detects status change

2. **Feedback Check**
   - System checks if feedback already exists
   - If feedback exists, workflow stops
   - If no feedback, workflow continues

3. **Auto-Send Evaluation**
   - System checks global auto-send setting
   - Determines next action based on setting

4. **Feedback Form Delivery**
   - **Auto-Send Enabled:** Email sent automatically
   - **Auto-Send Disabled:** Modal shown for manual selection

5. **Feedback Submission**
   - Customer receives and completes feedback form
   - Customer submits rating and comment

6. **Status Update**
   - System automatically changes status to "Feedback Received"
   - Feedback data is stored
   - Job lifecycle is complete

### 11.3 Document Lifecycle Workflow

The document lifecycle is managed automatically based on job status:

**Cancellation Workflow:**
1. Job status changes to "Cancel"
2. System identifies document type
3. Document is deactivated
4. Document becomes non-editable
5. Deactivation is tracked

**Reactivation Workflow:**
1. Merchant changes status from "Cancel" to "Scheduled"
2. System identifies document type
3. Document is reactivated
4. Document becomes editable
5. Job returns to workflow

---

## 12. User Experience Features

### 12.1 Visual Feedback

**Status Badge Colors:**
- Each status has a distinct color for quick visual identification
- Colors are consistent across the application
- Badges are easily readable and accessible

**Status Dropdown:**
- Interactive dropdown for easy status changes
- Shows current status prominently
- All options clearly visible
- Immediate visual update upon selection

### 12.2 Real-Time Updates

**Immediate UI Updates:**
- Status changes reflect immediately in the UI
- Job cards update without page refresh
- Metrics dashboard updates automatically
- Filter results update in real-time

**Automatic Calculations:**
- Status counts recalculate automatically
- Metrics reflect current filter settings
- No manual refresh required

### 12.3 User Notifications

**Success Messages:**
- Confirmation when status changes successfully
- Notification when feedback form is sent
- Confirmation when documents are deactivated/reactivated

**Error Handling:**
- Clear error messages if actions fail
- Guidance on how to resolve issues
- User-friendly error communication

---

## 13. Business Rules & Constraints

### 13.1 Status Transition Rules

**Flexible Transitions:**
- Any status can transition to any other status
- Provides flexibility for real-world scenarios
- No hard restrictions on status changes

**Special Transitions:**
- "Completed" → "Feedback Received" is automatic (triggered by feedback submission)
- "Cancel" → "Scheduled" requires merchant role (employees cannot reactivate)

### 13.2 Access Control Rules

**Merchant Permissions:**
- Full access to all status operations
- Can reactivate cancelled jobs
- Can view all jobs
- Can reassign employees

**Employee Permissions:**
- Can change status but cannot reactivate
- Can only view assigned jobs
- Cannot reassign employees
- Cannot edit jobs

### 13.3 Document Management Rules

**Deactivation Rules:**
- Cancelled jobs automatically deactivate documents
- Deactivated documents cannot be edited
- Deactivation is tracked in the system

**Reactivation Rules:**
- Only merchants can reactivate
- Reactivation changes status to "Scheduled"
- Reactivated documents become editable
- Job returns to workflow

---

## 14. Integration Points

### 14.1 Feedback System Integration

**Automatic Triggering:**
- Status change to "Completed" triggers feedback workflow
- System handles feedback form delivery automatically
- Feedback submission updates job status automatically

**Feedback Data:**
- Rating (numeric score)
- Comment (text feedback)
- Timestamp (submission time)
- Job association (which job the feedback is for)

### 14.2 Document System Integration

**Document Types:**
- Invoices (INV-XXX)
- Estimates (EST-XXX)
- Agreements (AGR-XXX)

**Document Status:**
- Documents have payment status (Paid/Open/Overdue)
- Payment status influences initial job status
- Job status changes affect document lifecycle

### 14.3 User Management Integration

**Role-Based Access:**
- Merchant role has full access
- Employee role has limited access
- Permissions enforced throughout the system

**Employee Assignment:**
- Jobs are assigned to specific employees
- Employees see only their assigned jobs
- Merchants can reassign employees

---

## 15. Prototype Considerations

### 15.1 Current Implementation

This is a prototype implementation that demonstrates:

- Complete job status workflow
- User interactions and UI behavior
- Business logic and rules
- Integration with other systems
- Role-based access control

### 15.2 Data Persistence

**Prototype Approach:**
- Uses browser localStorage for data persistence
- Data persists across page reloads
- Suitable for demonstration and testing

**Production Considerations:**
- Would use backend API for data persistence
- Database storage for job status history
- Server-side validation and business rules
- Audit logging for status changes

### 15.3 Future Enhancements

**Potential Improvements:**
- Status change history/audit log
- Status change notifications
- Automated status transitions based on time/conditions
- Bulk status updates
- Status-based reporting and analytics
- Integration with scheduling systems
- Mobile app push notifications

---

## 16. Summary

The Job Status feature is a comprehensive system that enables users to track, manage, and interact with service jobs throughout their lifecycle. It integrates seamlessly with the feedback system, document management, and user role permissions to provide a complete job management solution.

### Key Features:
- **Five Status Types:** Scheduled, In Progress, Completed, Cancel, Feedback Received
- **Flexible Transitions:** Any status can transition to any other status
- **Automatic Workflows:** Feedback collection triggered on completion
- **Document Management:** Automatic activation/deactivation based on status
- **Role-Based Access:** Different permissions for merchants and employees
- **Real-Time Metrics:** Live status counts and filtering
- **Visual Feedback:** Color-coded status badges for quick identification

### Business Value:
- Provides clear visibility into job progress
- Enables efficient job management
- Automates feedback collection process
- Maintains document lifecycle integrity
- Supports role-based workflows
- Delivers actionable insights through metrics

This prototype demonstrates the complete product feature and business logic for job status management, providing a foundation for production implementation.

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Status:** Prototype Documentation  
**Related Components:** Job Dashboard, Job Cards, Feedback System, Document Management
