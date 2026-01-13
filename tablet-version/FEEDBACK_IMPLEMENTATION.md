# Feedback Settings and Feedback Form Implementation

## Overview

The Feedback feature enables service businesses to collect customer feedback after job completion. The system provides two main components: **Feedback Settings** (for configuration) and **Feedback Form** (for collection and viewing). This document explains the complete working of these features from a product feature and logic perspective.

---

## Table of Contents

1. [Feedback Settings](#feedback-settings)
2. [Feedback Form Workflow](#feedback-form-workflow)
3. [Job Dashboard Integration](#job-dashboard-integration)
4. [Feedback Status Management](#feedback-status-management)
5. [User Roles and Permissions](#user-roles-and-permissions)
6. [Data Persistence](#data-persistence)

---

## Feedback Settings

### Location and Access

The Feedback Settings are accessible from the **Settings** page within the mobile application. Users navigate to Settings → Operations → Feedback Settings to configure automatic feedback form delivery.

### Configuration Options

#### Automatic Feedback Form Sending

The primary setting available is a toggle switch for **"Send Feedback Form Automatically"**.

**When Enabled (ON):**
- When a job status changes to "Completed", the system automatically sends a feedback form email to the customer
- No manual intervention is required
- The email is sent in the background without showing any modal or confirmation dialog to the user
- A success notification appears confirming the email was sent

**When Disabled (OFF):**
- When a job status changes to "Completed", a modal appears prompting the user to choose how to send the feedback form
- The user can choose between:
  - **Fill Feedback Form**: Opens the feedback form directly for manual entry
  - **Send Email**: Opens the email composition screen to send the feedback form link to the customer

### Settings Persistence

The feedback settings are saved to local storage and persist across application sessions. When the settings modal is opened, it loads the previously saved preference. If no preference exists, it defaults to **OFF** (disabled).

### Settings Behavior Logic

1. **On Save**: When the user clicks "Save", the setting is stored in local storage
2. **On Job Status Change**: The system checks this setting when a job status changes to "Completed"
3. **Conditional Behavior**: The system behaves differently based on whether automatic sending is enabled or disabled

---

## Feedback Form Workflow

### Form Delivery Methods

The feedback form can be delivered to customers through two primary methods:

#### Method 1: Email Delivery

**Process:**
1. User selects "Send Email" option from the feedback form modal
2. An email composition screen opens with the customer's email address pre-filled
3. User can customize the email message if needed
4. Upon sending, the system marks the feedback form as "sent" (but not yet received)
5. The customer receives an email with a link to the feedback form

**Use Cases:**
- When automatic sending is disabled and user wants to send via email
- When user wants to send feedback form to customer at a later time
- When customer prefers email communication

#### Method 2: Direct Form Entry

**Process:**
1. User selects "Fill Feedback Form" option from the feedback form modal
2. The feedback form opens directly in the application
3. User can manually enter feedback on behalf of the customer
4. Form submission follows the same validation and storage process as customer-submitted feedback

**Use Cases:**
- When customer is present and can provide feedback immediately
- When customer prefers to give feedback verbally and user enters it
- When customer doesn't have email access

### Feedback Form Structure

The feedback form collects the following information:

#### 1. Pre-filled Information (Read-only)
- **Customer Name**: Automatically populated from the job record
- **Employee Name**: Shows the technician assigned to the job
- **Service**: Displays the job title or service description

#### 2. Required Fields
- **Rating**: Star rating system (1-5 stars)
  - User must select at least one star
  - Visual feedback shows selected rating (e.g., "3 out of 5 stars")
- **Feedback Comment**: Text area for detailed feedback
  - Minimum requirement: Non-empty text (after trimming whitespace)
  - Character counter displayed to show input length
  - Placeholder text guides user on what to enter

#### 3. Form Validation

The form enforces the following validation rules:
- **Rating**: Must be between 1 and 5 stars (cannot be 0)
- **Comment**: Must contain at least one non-whitespace character
- **Submit Button**: Disabled until both requirements are met
- **Error Messages**: Clear error messages appear if user tries to submit without meeting requirements

### Form Submission Process

1. **Validation Check**: System validates that rating is selected and comment is provided
2. **Data Collection**: Collects rating, comment, and job ID
3. **Timestamp Generation**: Automatically records submission date and time
4. **Status Update**: Changes job status from "Completed" to "Feedback Received"
5. **Storage**: Saves feedback data to local storage for persistence
6. **Notification**: Shows success message confirming submission
7. **Modal Closure**: Closes the feedback form modal

---

## Job Dashboard Integration

### Feedback Status Indicators

The job dashboard displays visual indicators for feedback status:

#### Jobs Without Feedback
- No special indicator shown
- Status remains as "Completed" (if feedback form not sent) or "Completed" (if form sent but not received)

#### Jobs With Feedback
- Status changes to "Feedback Received"
- Visual badge or indicator shows feedback has been collected
- "View Feedback" action becomes available

### Feedback Actions on Job Cards

Each job card in the dashboard provides feedback-related actions based on the current state:

#### When Job Status is "Completed" and No Feedback Exists

**Available Actions:**
1. **Send Feedback Form**: Opens modal with delivery options
   - Option to send via email
   - Option to fill form directly

#### When Feedback Has Been Received

**Available Actions:**
1. **View Feedback**: Opens modal displaying:
   - Customer information
   - Employee information
   - Service details
   - Star rating (visual stars + numeric display)
   - Feedback comment
   - Submission timestamp
   - Any attached media/images (if applicable)

### Automatic Feedback Form Triggering

When a job status changes to "Completed", the system checks:

1. **Feedback Settings**: Is automatic sending enabled?
2. **Existing Feedback**: Does this job already have feedback?
3. **Customer Email**: Does the customer have a valid email address?

**If Automatic Sending is Enabled:**
- System automatically sends feedback form email in the background
- No modal appears to the user
- Success notification confirms email was sent
- Job status remains "Completed" until feedback is received

**If Automatic Sending is Disabled:**
- Modal appears with delivery options
- User must manually choose how to send the feedback form
- User can choose to send now or later

**If Customer Has No Email:**
- System shows warning message
- User must use "Fill Feedback Form" option to enter feedback manually

---

## Feedback Status Management

### Status Lifecycle

The feedback status follows this lifecycle:

1. **Job Completed** → Status: "Completed"
   - Feedback form can be sent (automatically or manually)
   - No feedback exists yet

2. **Feedback Form Sent** → Status: "Completed" (unchanged)
   - Form marked as "sent" in system
   - Waiting for customer response
   - Feedback not yet received

3. **Feedback Received** → Status: "Feedback Received"
   - Feedback data stored in system
   - Job status automatically updated
   - Feedback can be viewed by users

### Status Tracking

The system tracks feedback status using a structured data format:

- **Job ID**: Unique identifier for the job
- **Exists Flag**: Boolean indicating if feedback has been received
- **Feedback Data** (when exists):
  - Rating (1-5 stars)
  - Comment (text)
  - Submission timestamp

### Status Persistence

Feedback status is stored in local storage to ensure:
- Data persists across application sessions
- Feedback can be viewed from different pages (e.g., Employee dashboard)
- Status updates are maintained even after app restart

---

## User Roles and Permissions

### Merchant/Admin Users

**Full Access:**
- Can configure feedback settings
- Can send feedback forms manually
- Can fill feedback forms directly
- Can view all feedback
- Can see feedback status for all jobs

**Settings Access:**
- Can enable/disable automatic feedback form sending
- Can save and modify feedback settings

### Employee Users

**Limited Access:**
- Cannot access feedback settings (settings page may not show this option)
- Can view feedback for jobs assigned to them
- Cannot send feedback forms (this is typically a merchant/admin function)
- Can see feedback status for their assigned jobs

**View-Only Access:**
- Can view feedback that has been submitted
- Cannot modify or delete feedback
- Cannot configure automatic sending

---

## Data Persistence

### Local Storage Structure

The feedback system uses local storage to persist data:

#### Feedback Status Storage
- **Key**: `jobFeedbackStatus`
- **Format**: JSON object mapping job IDs to feedback status
- **Structure**:
  ```json
  {
    "jobId1": {
      "exists": true,
      "feedback": {
        "rating": 5,
        "comment": "Great service!",
        "submittedAt": "2024-01-15 10:30 AM"
      }
    },
    "jobId2": {
      "exists": false
    }
  }
  ```

#### Settings Storage
- **Key**: `autoSendFeedback`
- **Format**: String ("true" or "false")
- **Default**: "false" (disabled)

### Data Loading

When the application loads:
1. System reads feedback status from local storage
2. System reads feedback settings from local storage
3. If no data exists, system uses default values:
   - Feedback status: Empty object (no feedback)
   - Settings: Automatic sending disabled

### Data Saving

Feedback data is saved:
- Immediately after feedback submission
- When feedback form is sent (marks as sent, not received)
- Settings are saved when user clicks "Save" in settings modal

---

## Workflow Scenarios

### Scenario 1: Automatic Feedback Collection (Enabled)

1. **Job Completion**: Merchant changes job status to "Completed"
2. **Automatic Trigger**: System checks settings → Automatic sending is enabled
3. **Email Sent**: System automatically sends feedback form email to customer
4. **Notification**: Success message appears: "Feedback form sent automatically to [email]"
5. **Status**: Job remains "Completed", feedback form marked as "sent"
6. **Customer Response**: Customer receives email, clicks link, fills form
7. **Status Update**: Job status changes to "Feedback Received"
8. **View Available**: Merchant can now view the feedback

### Scenario 2: Manual Feedback Collection (Disabled)

1. **Job Completion**: Merchant changes job status to "Completed"
2. **Modal Appears**: System checks settings → Automatic sending is disabled
3. **User Choice**: Modal shows two options:
   - Send Email
   - Fill Feedback Form
4. **Option A - Send Email**:
   - User selects "Send Email"
   - Email composition screen opens
   - User sends email with feedback form link
   - Form marked as "sent"
5. **Option B - Fill Form**:
   - User selects "Fill Feedback Form"
   - Feedback form opens directly
   - User enters feedback on behalf of customer
   - Form submitted immediately
   - Status changes to "Feedback Received"

### Scenario 3: Viewing Existing Feedback

1. **Job with Feedback**: Job status is "Feedback Received"
2. **View Action**: User clicks "View Feedback" on job card
3. **Modal Opens**: Feedback view modal displays:
   - All job details (customer, employee, service)
   - Star rating visualization
   - Feedback comment
   - Submission date and time
4. **Read-Only**: All information is displayed in read-only format
5. **Close**: User can close modal to return to job list

---

## Integration Points

### Job Status Management

The feedback system integrates with job status management:
- Status change to "Completed" triggers feedback form workflow
- Feedback submission automatically updates job status to "Feedback Received"
- Status changes are reflected immediately in the job dashboard

### Email System

The feedback system integrates with the email system:
- Uses customer email addresses from job records
- Opens email composition screen with pre-filled customer information
- Tracks email sending status

### Customer Management

The feedback system uses customer data:
- Retrieves customer email addresses
- Displays customer names in feedback forms
- Associates feedback with customer records

### Employee Management

The feedback system tracks employee information:
- Shows assigned technician in feedback forms
- Associates feedback with employee performance
- Allows filtering feedback by employee (potential future feature)

---

## Business Logic Rules

### Rule 1: One Feedback Per Job
- Each job can have only one feedback entry
- Once feedback is submitted, the job status changes to "Feedback Received"
- Additional feedback submissions are not allowed (system prevents duplicate entries)

### Rule 2: Feedback Form Timing
- Feedback forms can only be sent for jobs with "Completed" status
- Feedback cannot be collected for jobs in other statuses (Scheduled, In Progress, Cancel)

### Rule 3: Automatic vs Manual Sending
- Automatic sending only works if:
  - Setting is enabled
  - Job status changes to "Completed"
  - Customer has valid email address
  - No feedback already exists
- Manual sending is always available (when automatic is disabled or when user wants to send again)

### Rule 4: Feedback Validation
- Rating is required (1-5 stars)
- Comment is required (non-empty text)
- Both must be provided before submission is allowed

### Rule 5: Status Progression
- Jobs cannot skip from "Completed" directly to other statuses if feedback is pending
- Once feedback is received, status is locked to "Feedback Received"
- Status can only change from "Feedback Received" through manual status update (if allowed)

---

## User Experience Considerations

### Visual Feedback
- Clear indicators show when feedback has been received
- Star ratings are visually displayed
- Status badges clearly distinguish between "Completed" and "Feedback Received"

### Error Handling
- Clear error messages for validation failures
- Warnings when customer email is missing
- Success confirmations for all actions

### Accessibility
- Form fields are clearly labeled
- Required fields are marked with asterisks
- Disabled states are visually distinct
- Error messages are descriptive

### Performance
- Feedback data loads quickly from local storage
- Form submission is immediate (no waiting for server response in prototype)
- Status updates are reflected instantly

---

## Future Enhancement Opportunities

While not currently implemented, potential enhancements could include:

1. **Feedback Analytics**: Aggregate feedback data to show trends, average ratings, etc.
2. **Feedback Templates**: Pre-defined feedback form templates for different service types
3. **Follow-up Actions**: Automatic follow-up emails if feedback is not received within X days
4. **Feedback Export**: Ability to export feedback data for reporting
5. **Employee Performance**: Link feedback to employee performance metrics
6. **Customer History**: View all feedback from a specific customer
7. **Feedback Response**: Ability to respond to customer feedback
8. **Rating Breakdown**: Detailed rating categories (service quality, timeliness, communication, etc.)

---

## Summary

The Feedback Settings and Feedback Form feature provides a comprehensive system for collecting customer feedback after job completion. The system offers flexibility through automatic or manual feedback form delivery, ensures data persistence, and integrates seamlessly with the job management workflow. The feature supports both merchant/admin users (full access) and employee users (view-only access), with clear status indicators and intuitive user interfaces throughout the process.

