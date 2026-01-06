# Unified Schedule Module

## Overview

This module implements a **dynamic, unified schedule system** that handles multiple schedule types (cleaning, open talk, etc.) using a single database table and entity.

## Design Pattern

### Single Table Inheritance (STI) with JSONB

- **One table (`schedules`)** for all schedule types
- **Type discriminator** (`type` column) to distinguish schedule types
- **JSONB metadata** column for type-specific fields
- **Many-to-Many relationship** with Staff (flexible for different staff count requirements)

## Benefits

1. **Dynamic & Extensible**: Add new schedule types without schema changes
2. **Consistent Querying**: Single API for all schedule types
3. **Type Safety**: TypeScript interfaces ensure type-specific metadata is correct
4. **Performance**: Indexed columns for fast queries
5. **Flexibility**: Application layer handles business logic differences

## Schedule Types

### Cleaning Schedule

- **Staff Count**: 2 required
- **Metadata**: `{ cycleNumber: number }`
- **Example**:

```typescript
{
  type: ScheduleType.CLEANING,
  date: '2026-01-15',
  staff: [staff1, staff2],
  metadata: { cycleNumber: 5 }
}
```

### Open Talk Schedule

- **Staff Count**: 1 required
- **Metadata**: `{ topic?: string, slideUrl?: string, slideStatus: string }`
- **Example**:

```typescript
{
  type: ScheduleType.OPEN_TALK,
  date: '2026-01-18',
  staff: [staff1],
  metadata: {
    topic: 'NestJS Best Practices',
    slideUrl: 'https://...',
    slideStatus: 'approved'
  }
}
```

## Usage Examples

### Create a Cleaning Schedule

```typescript
const cleaningSchedule = await scheduleService.create({
  type: ScheduleType.CLEANING,
  date: '2026-01-15',
  staffIds: [1, 2],
  metadata: { cycleNumber: 5 },
});
```

### Create an Open Talk Schedule

```typescript
const openTalkSchedule = await scheduleService.create({
  type: ScheduleType.OPEN_TALK,
  date: '2026-01-18',
  staffIds: [3],
  metadata: {
    topic: 'GraphQL in 2026',
    slideStatus: 'pending',
  },
});
```

### Query Schedules

```typescript
// Get all cleaning schedules for January
const cleaningSchedules = await scheduleService.findByType(ScheduleType.CLEANING, '2026-01-01', '2026-01-31');

// Get all schedules for a specific staff member
const mySchedules = await scheduleService.findByStaff(staffId);

// Advanced filtering
const schedules = await scheduleService.findAll({
  type: ScheduleType.CLEANING,
  status: ScheduleStatus.SCHEDULED,
  dateFrom: '2026-01-01',
  dateTo: '2026-01-31',
  branchId: 1,
  page: 1,
  limit: 20,
});
```

### Update Schedule Metadata

```typescript
// Update open talk slide status
await scheduleService.update(scheduleId, {
  metadata: {
    ...schedule.metadata,
    slideStatus: 'approved',
    slideUrl: 'https://slides.com/...',
  },
});
```

## Database Schema

```sql
CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  type VARCHAR NOT NULL,  -- 'cleaning' | 'open_talk'
  date DATE NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'scheduled',
  metadata JSONB,
  notes TEXT,
  branch_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE schedule_staff (
  schedule_id INTEGER REFERENCES schedules(id),
  staff_id INTEGER REFERENCES staff(id),
  PRIMARY KEY (schedule_id, staff_id)
);

CREATE INDEX idx_schedules_type_date ON schedules(type, date);
CREATE INDEX idx_schedules_type_status ON schedules(type, status);
```

## Application Layer Patterns

### Factory Pattern for Schedule Creation

Create type-specific service classes that use the base ScheduleService:

```typescript
@Injectable()
class CleaningScheduleService {
  constructor(private scheduleService: ScheduleService) {}

  async createCleaning(date: string, staffIds: [number, number], cycleNumber: number) {
    return this.scheduleService.create({
      type: ScheduleType.CLEANING,
      date,
      staffIds,
      metadata: { cycleNumber },
    });
  }
}
```

### Strategy Pattern for Schedule Logic

Different business logic for each type:

```typescript
interface ScheduleStrategy {
  validateStaff(staffCount: number): boolean;
  generateNextSchedule(): Promise<Schedule>;
}

class CleaningScheduleStrategy implements ScheduleStrategy {
  validateStaff(count: number) {
    return count === 2;
  }
  // ...
}
```

## Migration from Old Design

The old separate tables (`cleaning_schedules`, `open_talk_schedules`) can be migrated using:

```sql
-- Migrate cleaning schedules
INSERT INTO schedules (type, date, status, metadata, created_at, updated_at)
SELECT
  'cleaning',
  date,
  CASE status
    WHEN 0 THEN 'scheduled'
    WHEN 1 THEN 'completed'
    WHEN 2 THEN 'swapped'
  END,
  jsonb_build_object('cycleNumber', cycle_number),
  created_at,
  updated_at
FROM cleaning_schedules;

-- Migrate staff relationships
INSERT INTO schedule_staff (schedule_id, staff_id)
SELECT s.id, cs.staff_id_1 FROM schedules s
JOIN cleaning_schedules cs ON s.date = cs.date AND s.type = 'cleaning'
UNION ALL
SELECT s.id, cs.staff_id_2 FROM schedules s
JOIN cleaning_schedules cs ON s.date = cs.date AND s.type = 'cleaning';
```

## Adding New Schedule Types

To add a new schedule type (e.g., "maintenance"):

1. Add to enum:

```typescript
export enum ScheduleType {
  CLEANING = 'cleaning',
  OPEN_TALK = 'open_talk',
  MAINTENANCE = 'maintenance', // New type
}
```

2. Define metadata interface:

```typescript
export interface MaintenanceMetadata {
  area: string;
  equipment: string[];
}
```

3. Update union type:

```typescript
export type ScheduleMetadata = CleaningMetadata | OpenTalkMetadata | MaintenanceMetadata;
```

4. Add validation in service:

```typescript
if (type === ScheduleType.MAINTENANCE && count < 1) {
  throw new Error('Maintenance requires at least 1 staff member');
}
```

No database migration needed! ✨
