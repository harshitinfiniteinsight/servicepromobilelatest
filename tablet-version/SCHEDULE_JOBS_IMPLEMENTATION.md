# Schedule Jobs Implementation - Product Feature Documentation

## Purpose
This document explains the complete implementation of the Schedule Jobs feature in the Job Route Screen from a product feature and business logic perspective. This is a prototype implementation that demonstrates the workflow, user interactions, and system behaviors for scheduling and optimizing job routes.

---

## 1. Overview

The Schedule Jobs feature is a route optimization and scheduling system that allows merchants and employees to view, organize, and manage scheduled jobs for a specific employee on a specific date. The feature provides a visual map interface with drag-and-drop route ordering capabilities, enabling users to optimize job routes for efficiency.

### Key Capabilities
- Visual route planning on an interactive map
- Drag-and-drop job reordering for route optimization
- Employee and date-based job filtering
- Real-time route visualization with numbered markers
- Job status management within the route context
- Route persistence and recall
- Employee reassignment capabilities
- Job editing integration

---

## 2. Feature Access & User Roles

### 2.1 Access Points

The Schedule Jobs feature is accessible through the **Schedule Route Modal**, which can be opened from:
- The Jobs dashboard page
- Employee-specific views
- Direct navigation for route planning

### 2.2 User Roles

**Merchant (Admin) Role:**
- Can schedule routes for any employee
- Can view all employees in the employee selector
- Can edit routes for any employee
- Can reassign jobs to different employees
- Can edit jobs (if payment status is "Open")
- Full access to all route management features

**Employee (Technician) Role:**
- Can only view and edit routes for themselves
- Employee selector is pre-selected and disabled
- Cannot change employee selection
- Can reorder their own jobs
- Can change job status (Scheduled/Cancel)
- Can edit their own jobs (if payment status is "Open")
- Limited to their assigned jobs only

---

## 3. Core Components

### 3.1 Employee Selection

**Purpose:** Select which employee's jobs to schedule and optimize.

**Functionality:**
- Dropdown selector showing all available employees
- Each employee displayed with a color-coded indicator
- Shows number of stops (jobs) for each employee on the selected date
- Employee color is used throughout the interface for visual consistency
- Disabled in edit mode or when employee is viewing their own route

**Business Logic:**
- Employees are listed with their assigned job count for the selected date
- If an employee has no jobs on the selected date, they still appear in the list
- Employee selection determines which jobs are displayed
- Changing employee refreshes the route stops list

### 3.2 Date Selection

**Purpose:** Select the date for which to schedule and optimize the route.

**Functionality:**
- Calendar date picker interface
- Defaults to current date
- Allows selection of any date (past, present, or future)
- Date format displayed as "MMM dd, yyyy" (e.g., "Jan 15, 2024")

**Business Logic:**
- Only jobs scheduled for the selected date are displayed
- Changing the date refreshes the route stops list
- If selected employee has no jobs on the new date, employee selection may reset
- Date is part of the route storage key for persistence

### 3.3 Route Stops List

**Purpose:** Display all scheduled jobs for the selected employee on the selected date in an ordered list.

**Functionality:**
- Shows jobs as draggable cards
- Each card displays:
  - Stop number (matches map marker number)
  - Customer name
  - Job title
  - Job location/address
  - Scheduled time
  - Current status (Scheduled or Cancel)
  - Drag handle for reordering
- Cards are sortable via drag-and-drop
- Order determines route sequence

**Business Logic:**
- Jobs are initially ordered by scheduled time (earliest first)
- If a saved route order exists, it loads that order instead
- New jobs added to the date are appended to the end
- Order can be changed by dragging cards up or down
- Order is saved when route is saved

### 3.4 Interactive Map

**Purpose:** Visualize the route on a map with numbered markers and connecting lines.

**Functionality:**
- Displays all job locations as numbered markers
- Marker numbers correspond to route stop order
- Markers are color-coded by employee
- Polyline connects markers in route order
- Map automatically adjusts to show all stops
- Clicking a marker shows job details in a popup

**Visual Elements:**
- **Numbered Markers:** Circular markers with route sequence numbers (1, 2, 3...)
- **Employee Color:** Each marker uses the employee's assigned color
- **Route Line:** Orange polyline connecting markers in order
- **Current Job Indicator:** Pulsing animation for job with "In Progress" status
- **Completed Job Indicator:** Green checkmark badge for completed jobs

**Business Logic:**
- Marker positions are calculated based on route order
- Map center and zoom automatically adjust to show all stops
- Route line updates automatically when jobs are reordered
- Marker numbers update when route order changes

---

## 4. Route Ordering & Optimization

### 4.1 Drag-and-Drop Reordering

**Purpose:** Allow users to optimize the route by reordering job stops.

**Functionality:**
- Jobs are displayed as draggable cards
- Users can drag any card to a new position
- Cards show visual feedback during dragging (opacity change)
- Drop target is highlighted
- Order updates immediately upon drop

**Business Logic:**
- Reordering updates the route sequence
- Stop numbers update automatically (1, 2, 3...)
- Map markers renumber to match new order
- Route line redraws to connect stops in new order
- Changes are saved when user clicks "Save Route"

### 4.2 Default Ordering

**Initial Order:**
- If no saved route exists, jobs are ordered by scheduled time
- Earliest scheduled time appears first
- Latest scheduled time appears last

**Saved Order:**
- If a saved route exists for the employee/date combination, it loads that order
- Saved order takes precedence over time-based ordering
- New jobs added to the date are appended to the end of saved route

### 4.3 Route Persistence

**Storage:**
- Route order is saved per employee per date
- Storage key format: `route_order_{employeeId}_{date}`
- Order is stored as an array of job IDs in sequence
- Persists across sessions and page reloads

**Business Logic:**
- Each employee can have a different route order for each date
- Routes are independent per date (changing date loads different route)
- Saved routes can be edited and updated
- Deleting a job removes it from the saved route order

---

## 5. Job Status Management in Route Context

### 5.1 Available Statuses

Within the route scheduling interface, jobs can have two statuses:

**Scheduled:**
- Default status for jobs in the route
- Indicates job is planned and ready to be performed
- Displayed with orange/blue color scheme

**Cancel:**
- Indicates job has been cancelled
- Job remains in route but is marked as cancelled
- Displayed with red color scheme
- Can be changed back to "Scheduled" to reactivate

### 5.2 Status Change Workflow

**Changing Status:**
- Each route stop card has a status dropdown
- Users can change status between "Scheduled" and "Cancel"
- Status change is immediate and visual
- Status is saved with the route

**Business Logic:**
- Status changes are saved per employee per date
- Storage key format: `route_statuses_{employeeId}_{date}`
- Status persists across sessions
- Cancelled jobs remain in route but are visually distinct
- Status can be changed multiple times

### 5.3 Status Persistence

**Storage:**
- Job statuses are saved separately from route order
- Each job's status is stored in a status object
- Status is loaded when route is opened
- If no saved status exists, defaults to job's current status or "Scheduled"

---

## 6. Route Stop Card Features

### 6.1 Card Information

Each route stop card displays:

**Stop Number:**
- Circular badge showing route sequence (1, 2, 3...)
- Color-coded by employee
- Updates automatically when route is reordered

**Customer Name:**
- Primary identifier for the job
- Displayed prominently at the top

**Job Title:**
- Description of the work to be performed
- Provides context for the job

**Location:**
- Full address of the job site
- Displayed with map pin icon
- Used for map marker placement

**Scheduled Time:**
- Time the job is scheduled to be performed
- Displayed with clock icon
- Used for initial route ordering

**Status Badge:**
- Current status (Scheduled or Cancel)
- Color-coded for quick identification
- Interactive dropdown for status changes

### 6.2 Card Actions

**Drag Handle:**
- Grip icon on the left side of card
- Allows dragging to reorder route
- Visual feedback during drag operation

**Status Dropdown:**
- Located in top-right corner
- Allows changing job status
- Options: Scheduled or Cancel
- Visual indicators (circle for Scheduled, X for Cancel)

**Three-Dot Menu:**
- Additional actions menu
- Options vary based on context:
  - **Reassign Employee:** Change which employee is assigned to the job
  - **Edit Job:** Navigate to job edit page (only if payment status is "Open")

---

## 7. Map Visualization

### 7.1 Map Features

**Interactive Map:**
- Full-screen map section showing route visualization
- Uses OpenStreetMap tiles for map data
- Zoom and pan controls available
- Automatically fits to show all route stops

**Marker System:**
- Each job location is marked with a numbered circle
- Numbers correspond to route stop order (1, 2, 3...)
- Markers are color-coded by employee
- Markers update automatically when route is reordered

**Route Line:**
- Orange polyline connecting markers in route order
- Visual representation of the route path
- Updates automatically when jobs are reordered
- Only displays when there are 2 or more stops

### 7.2 Marker Details

**Marker Appearance:**
- Circular marker with route number
- Employee color as background
- White border for visibility
- Shadow for depth

**Special Markers:**
- **Current Job:** Pulsing animation for job with "In Progress" status
- **Completed Job:** Green checkmark badge overlay

**Marker Popup:**
- Clicking a marker shows job details:
  - Stop number
  - Customer name
  - Job title
  - Location address
  - Current status badge

### 7.3 Map Behavior

**Auto-Fitting:**
- Map automatically adjusts to show all stops
- Calculates bounds from all job locations
- Adds padding around edges for better visibility
- Maintains appropriate zoom level

**Coordinate Calculation:**
- Job coordinates are calculated based on route position
- Positions are distributed around a center point
- Maintains visual separation between stops
- Updates when route order changes

---

## 8. Route Saving & Persistence

### 8.1 Save Requirements

**Minimum Requirements:**
- At least 2 route stops (jobs) must be present
- Employee must be selected
- Date must be selected

**Save Button:**
- Appears at bottom of modal when requirements are met
- Fixed position for easy access
- Disabled if requirements not met
- Shows loading state during save operation

### 8.2 Save Process

**When User Clicks Save:**
1. System validates minimum requirements (2+ stops)
2. Route order is extracted (array of job IDs)
3. Job statuses are collected
4. Data is saved to persistent storage
5. Success notification is shown
6. Modal closes

**Storage Structure:**
- **Route Order:** `route_order_{employeeId}_{date}` → Array of job IDs
- **Job Statuses:** `route_statuses_{employeeId}_{date}` → Object with job statuses

### 8.3 Route Loading

**On Modal Open:**
1. System checks for saved route order for employee/date
2. If saved order exists, loads that order
3. If no saved order, uses time-based default order
4. System checks for saved job statuses
5. If saved statuses exist, loads those statuses
6. If no saved statuses, uses job's current status or defaults to "Scheduled"

**Business Logic:**
- Saved routes take precedence over default ordering
- New jobs added to date are appended to existing route
- Status changes persist across sessions
- Each employee/date combination has independent route data

---

## 9. Employee Reassignment

### 9.1 Reassignment Feature

**Purpose:** Allow changing which employee is assigned to a specific job.

**Access:**
- Available through three-dot menu on route stop card
- Option: "Reassign Employee"
- Opens reassignment modal

**Functionality:**
- Modal shows list of all available employees
- Current employee is pre-selected
- User selects new employee
- Confirmation updates job assignment

**Business Logic:**
- Reassignment updates the job's technician
- Job may disappear from current route if reassigned to different employee
- Reassigned job appears in new employee's route for that date
- Reassignment is saved immediately

### 9.2 Reassignment Impact

**On Current Route:**
- Reassigned job may be removed from current route
- Route order may need adjustment
- Map markers update to reflect changes

**On New Employee's Route:**
- Job appears in new employee's route for that date
- Job maintains its scheduled time and details
- Job can be reordered in new employee's route

---

## 10. Job Editing Integration

### 10.1 Edit Job Feature

**Purpose:** Allow editing job details directly from the route interface.

**Access:**
- Available through three-dot menu on route stop card
- Option: "Edit Job"
- Only visible if job's payment status is "Open"

**Functionality:**
- Navigates to appropriate edit page based on job type:
  - Invoice jobs → Invoice edit page
  - Estimate jobs → Estimate edit page
  - Agreement jobs → Agreement edit page
  - Generic jobs → Job edit page
- Modal closes when navigating to edit

**Business Logic:**
- Only jobs with "Open" payment status can be edited
- Paid jobs cannot be edited (option hidden)
- Job type determines which edit page to navigate to
- Changes made in edit page reflect in route when returning

---

## 11. Demo Jobs Generation

### 11.1 Demo Job Creation

**Purpose:** Provide sample jobs when no real jobs exist for an employee/date combination.

**Trigger:**
- When selected employee has no jobs on selected date
- System automatically generates demo jobs

**Demo Job Templates:**
- HVAC Service Call (09:00 AM)
- Plumbing Inspection (11:00 AM)
- AC Maintenance (02:00 PM)
- Electrical Repair (04:00 PM)

**Business Logic:**
- Demo jobs are created with realistic data
- Assigned to selected employee
- Scheduled for selected date
- Status defaults to "Scheduled"
- Locations are in Chicago area (demo location)
- Demo jobs can be reordered and managed like real jobs

### 11.2 Demo Job Characteristics

**Job Properties:**
- Unique demo IDs (format: `DEMO-{employeeId}-{date}-{index}`)
- Realistic job titles
- Demo customer names
- Default scheduled times
- Demo locations
- "Scheduled" status by default

**Usage:**
- Helps demonstrate route functionality
- Allows testing without real job data
- Provides visual examples for users
- Can be saved and managed like real jobs

---

## 12. Modal Modes

### 12.1 Create Mode

**Purpose:** Create a new route for an employee/date combination.

**Characteristics:**
- Modal title: "Schedule Route"
- Save button text: "Save Route"
- Employee selector is enabled (unless employee mode)
- Can select any employee
- Can select any date
- Creates new route or updates existing route

**Business Logic:**
- If route exists for employee/date, loads that route
- If no route exists, creates new route with default ordering
- Saving creates or updates route data

### 12.2 Edit Mode

**Purpose:** Edit an existing route for an employee/date combination.

**Characteristics:**
- Modal title: "Edit Route"
- Save button text: "Update Route"
- Employee selector is disabled (locked to specific employee)
- Date selector is enabled
- Pre-loaded with existing route data

**Business Logic:**
- Employee is pre-selected and cannot be changed
- Route order and statuses are loaded from storage
- Changes update existing route data
- Saving updates route data

---

## 13. User Experience Features

### 13.1 Visual Feedback

**Drag Operation:**
- Card opacity reduces during drag
- Drop target is highlighted
- Smooth animations during reordering

**Status Changes:**
- Immediate visual update
- Color-coded badges
- Clear status indicators

**Save Operation:**
- Button shows loading state
- Disabled during save
- Success notification on completion

### 13.2 Responsive Design

**Mobile Optimization:**
- Full-screen modal on mobile devices
- Touch-friendly drag-and-drop
- Optimized map display
- Fixed save button at bottom

**Desktop Optimization:**
- Centered modal with max width
- Mouse-friendly interactions
- Larger map display
- Better spacing and layout

### 13.3 Empty States

**No Employee Selected:**
- Message: "Please select an employee to schedule their route"
- Guidance for next action

**No Jobs Available:**
- Message: "No stops available for this employee"
- Map pin icon
- Indicates no jobs to schedule

**Insufficient Stops:**
- Save button disabled if less than 2 stops
- Error message if attempting to save with insufficient stops

---

## 14. Business Logic & Workflows

### 14.1 Route Creation Workflow

**Step 1: Open Modal**
- User opens Schedule Route modal
- System initializes with current date
- Employee list is loaded

**Step 2: Select Employee**
- User selects employee from dropdown
- System loads jobs for that employee on selected date
- If no jobs exist, demo jobs are generated
- Route stops list is populated

**Step 3: Select Date (if needed)**
- User selects date from calendar
- System loads jobs for selected employee/date
- Route stops list updates

**Step 4: Optimize Route**
- User drags jobs to reorder
- Map markers update automatically
- Route line redraws

**Step 5: Manage Statuses**
- User changes job statuses as needed
- Statuses are tracked and saved

**Step 6: Save Route**
- User clicks "Save Route"
- System validates (2+ stops required)
- Route order and statuses are saved
- Success notification shown
- Modal closes

### 14.2 Route Editing Workflow

**Step 1: Open Edit Modal**
- User opens edit modal for specific employee/date
- Employee is pre-selected and locked
- Date is pre-selected

**Step 2: Load Existing Route**
- System loads saved route order
- System loads saved job statuses
- Route stops list displays in saved order
- Map shows route with saved order

**Step 3: Make Changes**
- User reorders jobs as needed
- User changes statuses as needed
- Changes are tracked

**Step 4: Update Route**
- User clicks "Update Route"
- System validates (2+ stops required)
- Route data is updated
- Success notification shown
- Modal closes

### 14.3 Status Change Workflow

**Step 1: User Changes Status**
- User clicks status dropdown on route stop card
- Selects new status (Scheduled or Cancel)

**Step 2: Status Update**
- Status updates immediately in UI
- Status is tracked in job statuses object
- Visual badge updates

**Step 3: Status Persistence**
- Status is saved when route is saved
- Status persists across sessions
- Status loads when route is reopened

---

## 15. Integration Points

### 15.1 Jobs Dashboard Integration

**Connection:**
- Schedule Route modal can be opened from Jobs dashboard
- Jobs displayed in route are the same jobs from dashboard
- Status changes in route reflect in dashboard
- Route order is independent of dashboard view

### 15.2 Employee Management Integration

**Connection:**
- Employee list comes from employee management system
- Employee colors are assigned per employee
- Employee reassignment updates employee assignments
- Employee-specific routes are maintained

### 15.3 Job Management Integration

**Connection:**
- Jobs come from invoices, estimates, and agreements
- Job details are synchronized
- Job editing navigates to appropriate edit pages
- Job status changes affect job records

### 15.4 Map Service Integration

**Connection:**
- Uses OpenStreetMap for map tiles
- Map markers positioned based on job locations
- Route visualization uses map polyline
- Map auto-fits to show all stops

---

## 16. Data Persistence

### 16.1 Storage Structure

**Route Order Storage:**
- Key: `route_order_{employeeId}_{date}`
- Value: JSON array of job IDs in route order
- Example: `["job1", "job2", "job3"]`

**Job Status Storage:**
- Key: `route_statuses_{employeeId}_{date}`
- Value: JSON object mapping job IDs to statuses
- Example: `{"job1": "Scheduled", "job2": "Cancel"}`

### 16.2 Persistence Behavior

**Save Timing:**
- Route data is saved when user clicks "Save Route"
- Data persists immediately upon save
- No auto-save (requires explicit save action)

**Load Timing:**
- Route data loads when modal opens
- Data loads for selected employee/date combination
- If no saved data exists, uses default ordering

**Data Scope:**
- Each employee has independent routes
- Each date has independent routes
- Routes are not shared between employees
- Routes are not shared between dates

---

## 17. Prototype Considerations

### 17.1 Current Implementation

This is a prototype implementation that demonstrates:

- Complete route scheduling workflow
- Drag-and-drop route optimization
- Visual map-based route planning
- Status management within route context
- Employee and date-based filtering
- Route persistence and recall

### 17.2 Data Persistence

**Prototype Approach:**
- Uses browser localStorage for data persistence
- Data persists across page reloads
- Suitable for demonstration and testing

**Production Considerations:**
- Would use backend API for data persistence
- Database storage for route history
- Server-side validation and business rules
- Multi-device synchronization
- Route optimization algorithms
- Integration with GPS/navigation systems

### 17.3 Future Enhancements

**Potential Improvements:**
- Automatic route optimization using distance/time algorithms
- Integration with GPS navigation apps
- Real-time location tracking
- Estimated travel time between stops
- Route sharing with employees
- Route templates and presets
- Bulk route operations
- Route analytics and reporting
- Multi-day route planning
- Route conflict detection
- Integration with traffic data

---

## 18. Summary

The Schedule Jobs feature is a comprehensive route optimization and scheduling system that enables users to visually plan, organize, and manage job routes for employees. It provides an intuitive drag-and-drop interface combined with map visualization to help optimize job sequences for efficiency.

### Key Features:
- **Employee & Date Selection:** Filter jobs by employee and date
- **Drag-and-Drop Reordering:** Optimize route sequence visually
- **Map Visualization:** See route on interactive map with numbered markers
- **Status Management:** Change job statuses within route context
- **Route Persistence:** Save and recall routes per employee/date
- **Employee Reassignment:** Change job assignments from route interface
- **Job Editing Integration:** Navigate to job edit pages
- **Demo Jobs:** Automatic demo job generation for testing

### Business Value:
- Improves route efficiency through visual optimization
- Reduces travel time and fuel costs
- Enhances employee scheduling and planning
- Provides clear visual representation of daily routes
- Enables quick status updates during route planning
- Supports both merchant and employee workflows
- Maintains route history and preferences

This prototype demonstrates the complete product feature and business logic for schedule jobs management, providing a foundation for production implementation with route optimization algorithms and GPS integration.

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Status:** Prototype Documentation  
**Related Components:** Schedule Route Modal, Jobs Dashboard, Employee Management, Map Visualization

