# Generic Schedule System - API Documentation

## Overview

This is a **fully generic scheduling system** where all schedule types (Cleaning, Open Talk, Happy Hour, etc.) are configured dynamically by HR through the dashboard. The system uses a flexible architecture with JSONB metadata to support unlimited schedule types without database schema changes.

## Architecture

### Core Entities

1. **ScheduleDefinition** - Configuration for schedule types (what HR configures)
2. **ScheduleEvent** - Actual occurrences of schedules (specific dates)
3. **ScheduleAssignment** - Staff assignments to events
4. **ScheduleSwapRequest** - Swap request workflow

### Key Features

- ✅ Dynamic schedule types configured via UI
- ✅ JSONB metadata for type-specific fields
- ✅ Flexible staff assignment (1-N people per event)
- ✅ Generic swap request workflow
- ✅ Cycle tracking for rotation-based schedules
- ✅ Holiday integration
- ✅ Date-only storage with UTC+7 timezone

---

## API Endpoints

### Schedule Definitions (HR Configuration)

#### `GET /schedule-definitions`

Get all schedule definitions

**Query Parameters:**

- `isActive` (boolean, optional) - Filter by active status
- `code` (string, optional) - Filter by code

**Response:**

```json
[
  {
    "id": 1,
    "name": "Dọn vệ sinh",
    "code": "CLEANING",
    "description": "Cleaning schedule rotation",
    "isActive": true,
    "requiredPeoplePerSlot": 2,
    "strategy": "round_robin",
    "config": {
      "skipHolidays": true,
      "minGapDays": 7,
      "maxPerWeek": 1
    },
    "createdAt": "2026-01-06T10:00:00Z"
  }
]
```

#### `GET /schedule-definitions/:id`

Get a single schedule definition by ID

#### `GET /schedule-definitions/code/:code`

Get schedule definition by code (e.g., "CLEANING", "OPEN_TALK")

#### `POST /schedule-definitions`

Create a new schedule type (HR only)

**Request Body:**

```json
{
  "name": "Open Talk",
  "code": "OPEN_TALK",
  "description": "Weekly open talk sessions",
  "requiredPeoplePerSlot": 1,
  "strategy": "round_robin",
  "config": {
    "skipHolidays": true,
    "dayOfWeek": 6,
    "requireSlide": true,
    "reminderDays": [7, 3, 1]
  }
}
```

#### `PUT /schedule-definitions/:id`

Update schedule definition

#### `PATCH /schedule-definitions/:id/toggle-active`

Toggle active/inactive status

#### `DELETE /schedule-definitions/:id`

Delete a schedule definition

---

### Schedule Events

#### `GET /schedule-events`

Get all schedule events with filtering

**Query Parameters:**

- `definitionId` (number, optional) - Filter by schedule type
- `dateFrom` (string YYYY-MM-DD, optional) - Start date
- `dateTo` (string YYYY-MM-DD, optional) - End date
- `status` (enum, optional) - scheduled | completed | cancelled | skipped
- `cycleNumber` (number, optional) - Filter by cycle
- `staffId` (number, optional) - Filter by assigned staff
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20)

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "definitionId": 1,
      "date": "2026-01-15",
      "cycleNumber": 1,
      "status": "scheduled",
      "isHolidaySkipped": false,
      "metadata": {},
      "definition": {
        "id": 1,
        "name": "Dọn vệ sinh",
        "code": "CLEANING"
      },
      "assignments": [
        {
          "id": 1,
          "staffId": 5,
          "assignmentOrder": 1,
          "metadata": {},
          "staff": {
            "id": 5,
            "email": "staff1@example.com"
          }
        }
      ]
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

#### `GET /schedule-events/:id`

Get a single event by ID

#### `GET /schedule-events/staff/:staffId/upcoming`

Get upcoming events for a specific staff member

**Query Parameters:**

- `limit` (number, optional) - Number of events (default: 10)

#### `GET /schedule-events/definition/:code`

Get events by definition code

**Query Parameters:**

- `dateFrom` (string, optional)
- `dateTo` (string, optional)

**Example:** `GET /schedule-events/definition/CLEANING?dateFrom=2026-01-01&dateTo=2026-01-31`

#### `POST /schedule-events`

Create a new schedule event

**Request Body:**

```json
{
  "definitionId": 1,
  "date": "2026-01-15",
  "cycleNumber": 1,
  "metadata": {}
}
```

#### `PUT /schedule-events/:id`

Update a schedule event

#### `DELETE /schedule-events/:id`

Delete a schedule event

---

### Schedule Assignments

#### `GET /schedule-assignments/event/:eventId`

Get all assignments for a specific event

#### `GET /schedule-assignments/staff/:staffId`

Get all assignments for a specific staff member

**Query Parameters:**

- `dateFrom` (string YYYY-MM-DD, optional)
- `dateTo` (string YYYY-MM-DD, optional)

**Example:** Get my cleaning schedules for January

```
GET /schedule-assignments/staff/5?dateFrom=2026-01-01&dateTo=2026-01-31
```

#### `GET /schedule-assignments/:id`

Get a single assignment by ID

#### `POST /schedule-assignments`

Create a new assignment

**Request Body:**

```json
{
  "eventId": 1,
  "staffId": 5,
  "assignmentOrder": 1,
  "metadata": {},
  "notes": "First assignment"
}
```

#### `POST /schedule-assignments/bulk`

Create multiple assignments for an event

**Request Body:**

```json
{
  "eventId": 1,
  "staffIds": [5, 6]
}
```

#### `PUT /schedule-assignments/:id`

Update an assignment

#### `PATCH /schedule-assignments/:id/metadata`

Update assignment metadata (for slide submission, etc.)

**Request Body:**

```json
{
  "topic": "NestJS Best Practices",
  "slideUrl": "https://slides.com/my-presentation",
  "slideStatus": "submitted"
}
```

**Example Use Cases:**

- Submit slide for Open Talk: `PATCH /schedule-assignments/123/metadata`
- Update cleaning area: `PATCH /schedule-assignments/456/metadata`

#### `PATCH /schedule-assignments/:id/complete`

Mark assignment as completed

#### `DELETE /schedule-assignments/:id`

Delete an assignment

---

### Schedule Swap Requests

#### `GET /schedule-swaps`

Get all swap requests with filtering

**Query Parameters:**

- `status` (enum, optional) - pending | approved | rejected | cancelled
- `requesterStaffId` (number, optional)
- `definitionId` (number, optional)

#### `GET /schedule-swaps/:id`

Get a single swap request by ID

#### `GET /schedule-swaps/definition/:definitionId/pending`

Get pending swap requests for a schedule type (for HR review)

#### `GET /schedule-swaps/staff/:staffId/history`

Get swap request history for a staff member

#### `POST /schedule-swaps`

Create a new swap request

**Request Body:**

```json
{
  "fromAssignmentId": 123,
  "requesterStaffId": 5,
  "targetStaffId": 6,
  "reason": "Have a doctor appointment"
}
```

**Note:** `targetStaffId` can be null for "swap with anyone" requests.

#### `PUT /schedule-swaps/:id/review`

Review (approve/reject) a swap request (HR/GDVP only)

**Request Body:**

```json
{
  "status": "approved",
  "reviewedByStaffId": 1,
  "reviewNotes": "Approved",
  "newAssignmentId": 124
}
```

#### `PATCH /schedule-swaps/:id/cancel`

Cancel a swap request (requester only)

**Request Body:**

```json
{
  "staffId": 5
}
```

---

## Usage Examples

### Example 1: HR Creates "Cleaning" Schedule Type

```bash
POST /schedule-definitions
{
  "name": "Dọn vệ sinh",
  "code": "CLEANING",
  "description": "Office cleaning rotation",
  "requiredPeoplePerSlot": 2,
  "strategy": "round_robin",
  "config": {
    "skipHolidays": true,
    "minGapDays": 7,
    "maxPerWeek": 1,
    "notificationTimes": ["08:00", "17:00"]
  }
}
```

### Example 2: Create Cleaning Events for January

```bash
# Event 1: Jan 13
POST /schedule-events
{
  "definitionId": 1,
  "date": "2026-01-13",
  "cycleNumber": 1
}

# Assign 2 staff members
POST /schedule-assignments/bulk
{
  "eventId": 1,
  "staffIds": [5, 6]
}

# Event 2: Jan 20
POST /schedule-events
{
  "definitionId": 1,
  "date": "2026-01-20",
  "cycleNumber": 1
}

POST /schedule-assignments/bulk
{
  "eventId": 2,
  "staffIds": [7, 8]
}
```

### Example 3: HR Creates "Open Talk" Schedule Type

```bash
POST /schedule-definitions
{
  "name": "Open Talk",
  "code": "OPEN_TALK",
  "description": "Weekly Saturday presentations",
  "requiredPeoplePerSlot": 1,
  "strategy": "round_robin",
  "config": {
    "skipHolidays": true,
    "dayOfWeek": 6,
    "requireSlide": true,
    "reminderDays": [7, 3, 1],
    "slideDeadlineDays": 7
  }
}
```

### Example 4: Create Open Talk Event with Slide Metadata

```bash
# Create event
POST /schedule-events
{
  "definitionId": 2,
  "date": "2026-01-18"
}

# Assign presenter
POST /schedule-assignments
{
  "eventId": 3,
  "staffId": 5,
  "metadata": {
    "topic": null,
    "slideUrl": null,
    "slideStatus": "pending"
  }
}

# Later: Staff submits slide
PATCH /schedule-assignments/3/metadata
{
  "topic": "Advanced TypeScript Patterns",
  "slideUrl": "https://slides.com/presentation-123",
  "slideStatus": "submitted",
  "submittedAt": "2026-01-11T14:30:00Z"
}

# HR approves slide
PATCH /schedule-assignments/3/metadata
{
  "slideStatus": "approved"
}
```

### Example 5: Staff Requests Swap

```bash
# Staff 5 wants to swap their cleaning assignment
POST /schedule-swaps
{
  "fromAssignmentId": 1,
  "requesterStaffId": 5,
  "targetStaffId": 9,
  "reason": "Have a family emergency"
}

# HR reviews and approves
PUT /schedule-swaps/1/review
{
  "status": "approved",
  "reviewedByStaffId": 1,
  "reviewNotes": "Approved - Staff 9 will replace Staff 5",
  "newAssignmentId": 10
}
```

### Example 6: Get All My Schedules

```bash
# Get all assignments for staff ID 5 in January
GET /schedule-assignments/staff/5?dateFrom=2026-01-01&dateTo=2026-01-31
```

### Example 7: Frontend Calendar View

```bash
# Get all events for January (all types)
GET /schedule-events?dateFrom=2026-01-01&dateTo=2026-01-31

# Get only cleaning events for January
GET /schedule-events?definitionId=1&dateFrom=2026-01-01&dateTo=2026-01-31

# Alternative: Get by code
GET /schedule-events/definition/CLEANING?dateFrom=2026-01-01&dateTo=2026-01-31
```

---

## Metadata Schema Examples

### Cleaning Schedule Metadata

**Definition Config:**

```json
{
  "skipHolidays": true,
  "minGapDays": 7,
  "maxPerWeek": 1,
  "notificationTimes": ["08:00", "17:00"]
}
```

**Assignment Metadata:**

```json
{
  "area": "Kitchen",
  "checkedOut": false
}
```

### Open Talk Schedule Metadata

**Definition Config:**

```json
{
  "skipHolidays": true,
  "dayOfWeek": 6,
  "requireSlide": true,
  "reminderDays": [7, 3, 1],
  "slideDeadlineDays": 7,
  "notificationChannelId": "channel-123"
}
```

**Assignment Metadata:**

```json
{
  "topic": "Advanced TypeScript",
  "slideUrl": "https://slides.com/presentation",
  "slideStatus": "approved",
  "submittedAt": "2026-01-10T14:30:00Z",
  "approvedAt": "2026-01-11T09:00:00Z",
  "approvedBy": 1
}
```

### Future Schedule Type: Happy Hour

**Definition Config:**

```json
{
  "dayOfWeek": 5,
  "startTime": "18:00",
  "budget": 500000,
  "location": "Office"
}
```

**Assignment Metadata:**

```json
{
  "role": "organizer",
  "theme": "80s Party",
  "guestCount": 25
}
```

---

## Frontend Integration Guide

### 1. Configure Schedule Types (HR Dashboard)

```typescript
// Create new schedule type
const createScheduleType = async (data) => {
  const response = await fetch('/api/schedule-definitions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

// Get all schedule types
const getScheduleTypes = async () => {
  const response = await fetch('/api/schedule-definitions?isActive=true');
  return response.json();
};
```

### 2. Calendar View

```typescript
// Get all events for calendar month
const getMonthEvents = async (year, month) => {
  const dateFrom = `${year}-${month.toString().padStart(2, '0')}-01`;
  const dateTo = `${year}-${month.toString().padStart(2, '0')}-31`;

  const response = await fetch(`/api/schedule-events?dateFrom=${dateFrom}&dateTo=${dateTo}`);
  return response.json();
};

// Transform for calendar display
events.data.map((event) => ({
  id: event.id,
  title: event.definition.name,
  date: event.date,
  type: event.definition.code,
  participants: event.assignments.map((a) => a.staff.email),
  color: getColorByType(event.definition.code),
}));
```

### 3. My Schedules Page

```typescript
const getMySchedules = async (staffId) => {
  const today = new Date().toISOString().split('T')[0];
  const response = await fetch(`/api/schedule-assignments/staff/${staffId}?dateFrom=${today}`);
  return response.json();
};
```

### 4. Slide Submission (Open Talk)

```typescript
const submitSlide = async (assignmentId, topic, slideUrl) => {
  const response = await fetch(`/api/schedule-assignments/${assignmentId}/metadata`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic,
      slideUrl,
      slideStatus: 'submitted',
      submittedAt: new Date().toISOString(),
    }),
  });
  return response.json();
};
```

### 5. Swap Request Workflow

```typescript
// Request swap
const requestSwap = async (assignmentId, staffId, reason) => {
  const response = await fetch('/api/schedule-swaps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fromAssignmentId: assignmentId,
      requesterStaffId: staffId,
      reason,
    }),
  });
  return response.json();
};

// HR approves swap
const approveSwap = async (swapId, reviewerId, newAssignmentId) => {
  const response = await fetch(`/api/schedule-swaps/${swapId}/review`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'approved',
      reviewedByStaffId: reviewerId,
      newAssignmentId,
    }),
  });
  return response.json();
};
```

---

## Benefits of This Design

1. **No More Hardcoding** - Add new schedule types (Training, Happy Hour, etc.) without touching backend code
2. **HR Self-Service** - HR configures everything via UI dashboard
3. **Flexible Metadata** - Each schedule type can have unique fields via JSONB
4. **Unified API** - One consistent API for all schedule types
5. **Easy Maintenance** - Single codebase handles all schedule logic
6. **Future-Proof** - Supports unlimited schedule types without DB migrations
7. **Type-Safe** - TypeScript interfaces ensure metadata correctness at compile time

---

## Next Steps

1. **Create seeder** to populate initial schedule definitions (Cleaning, Open Talk)
2. **Build generation service** to auto-generate events based on strategy (round-robin, etc.)
3. **Implement holiday checking** in event creation
4. **Add notification service** for reminders
5. **Build frontend dashboard** for HR configuration
6. **Create calendar component** for visualizing events

---

**Last Updated**: January 6, 2026
