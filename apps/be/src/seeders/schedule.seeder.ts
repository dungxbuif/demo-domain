import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ScheduleAssignmentEntity } from '@src/modules/schedule/entities/schedule-assignment.entity';
import {
  ScheduleDefinitionEntity,
  ScheduleStrategy,
} from '@src/modules/schedule/entities/schedule-definition.entity';
import { ScheduleEventEntity } from '@src/modules/schedule/entities/schedule-event.entity';
import StaffEntity from '@src/modules/staff/staff.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ScheduleSeeder {
  constructor(
    @InjectRepository(ScheduleDefinitionEntity)
    private readonly scheduleDefinitionRepository: Repository<ScheduleDefinitionEntity>,
    @InjectRepository(ScheduleEventEntity)
    private readonly scheduleEventRepository: Repository<ScheduleEventEntity>,
    @InjectRepository(ScheduleAssignmentEntity)
    private readonly scheduleAssignmentRepository: Repository<ScheduleAssignmentEntity>,
    @InjectRepository(StaffEntity)
    private readonly staffRepository: Repository<StaffEntity>,
  ) {}

  async seed() {
    console.log('🌱 Seeding schedules...');

    // Clear existing schedule data
    await this.scheduleAssignmentRepository.delete({});
    await this.scheduleEventRepository.delete({});
    await this.scheduleDefinitionRepository.delete({});

    // Get all active staff
    const activeStaff = await this.staffRepository.find({
      where: { status: 'active' },
    });

    if (activeStaff.length === 0) {
      console.log('⚠️  No active staff found. Please seed staff first.');
      return;
    }

    console.log(`✓ Found ${activeStaff.length} active staff members`);

    // Create schedule definitions
    const cleaningSchedule = await this.scheduleDefinitionRepository.save({
      name: 'Cleaning Schedule',
      code: 'cleaning',
      description: 'Daily office cleaning rotation',
      isActive: true,
      requiredPeoplePerSlot: 2,
      strategy: ScheduleStrategy.ROUND_ROBIN,
      config: {
        reminderTime: '17:00',
        notificationChannels: ['general', 'cleaning'],
      },
    });

    const openTalkSchedule = await this.scheduleDefinitionRepository.save({
      name: 'Open Talk Schedule',
      code: 'open-talk',
      description: 'Weekly Open Talk presentations',
      isActive: true,
      requiredPeoplePerSlot: 1,
      strategy: ScheduleStrategy.ROUND_ROBIN,
      config: {
        dayOfWeek: 6, // Saturday
        reminderDays: [7, 3, 1],
        requireSlideSubmission: true,
      },
    });

    console.log('✓ Created schedule definitions');

    const today = new Date();
    const events: any[] = [];

    let cycleNumber = 1;
    let staffIndex = 0;

    for (let monthOffset = 0; monthOffset < 2; monthOffset++) {
      const currentMonth = new Date(
        today.getFullYear(),
        today.getMonth() + monthOffset,
        1,
      );
      const daysInMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0,
      ).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth(),
          day,
        );
        const dayOfWeek = date.getDay();

        // Skip weekends for cleaning
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        // Skip dates before today
        if (date < new Date(today.setHours(0, 0, 0, 0))) continue;

        const dateStr = date.toISOString().split('T')[0];

        const event = await this.scheduleEventRepository.save({
          definition: cleaningSchedule,
          date: dateStr,
          cycleNumber: Math.floor(staffIndex / activeStaff.length) + 1,
          status: date < today ? 'completed' : 'scheduled',
          isHolidaySkipped: false,
          metadata: {},
        });

        // Assign 2 staff members
        for (let i = 0; i < 2; i++) {
          const staff = activeStaff[staffIndex % activeStaff.length];
          await this.scheduleAssignmentRepository.save({
            event,
            staff,
            assignmentOrder: i + 1,
            metadata: {},
            isCompleted: date < today,
          });
          staffIndex++;
        }

        events.push(event);
      }
    }

    console.log(`✓ Created ${events.length} cleaning events`);

    // Generate Open Talk events (Saturdays only)
    let otStaffIndex = 0;
    const otEvents: any[] = [];

    for (let monthOffset = 0; monthOffset < 2; monthOffset++) {
      const currentMonth = new Date(
        today.getFullYear(),
        today.getMonth() + monthOffset,
        1,
      );
      const daysInMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0,
      ).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth(),
          day,
        );
        const dayOfWeek = date.getDay();

        // Only Saturdays for Open Talk
        if (dayOfWeek !== 6) continue;

        // Skip dates before today
        if (date < new Date(today.setHours(0, 0, 0, 0))) continue;

        const dateStr = date.toISOString().split('T')[0];

        const event = await this.scheduleEventRepository.save({
          definition: openTalkSchedule,
          date: dateStr,
          cycleNumber: otStaffIndex + 1,
          status: date < today ? 'completed' : 'scheduled',
          isHolidaySkipped: false,
          metadata: {},
        });

        // Assign 1 staff member
        const staff = activeStaff[otStaffIndex % activeStaff.length];
        const isPastEvent = date < today;
        await this.scheduleAssignmentRepository.save({
          event,
          staff,
          assignmentOrder: 1,
          metadata: isPastEvent
            ? {
                topic: `Tech Talk #${otStaffIndex + 1}`,
                slideUrl: 'https://example.com/slides',
                slideStatus: 'approved',
              }
            : {},
          isCompleted: isPastEvent,
        });
        otStaffIndex++;

        otEvents.push(event);
      }
    }

    console.log(`✓ Created ${otEvents.length} Open Talk events`);
    console.log('✅ Schedule seeding completed!');
  }
}
