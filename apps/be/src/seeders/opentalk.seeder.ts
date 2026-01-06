import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import ScheduleCycleEntity from '@src/modules/schedule/schedule-cycle.entity';
import ScheduleEventParticipantEntity from '@src/modules/schedule/schedule-event-participant.entity';
import ScheduleEventEntity, {
  EventStatus,
} from '@src/modules/schedule/schedule-event.entity';
import StaffEntity from '@src/modules/staff/staff.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OpentalkSeeder {
  constructor(
    @InjectRepository(ScheduleCycleEntity)
    private readonly cycleRepository: Repository<ScheduleCycleEntity>,

    @InjectRepository(ScheduleEventEntity)
    private readonly eventRepository: Repository<ScheduleEventEntity>,

    @InjectRepository(ScheduleEventParticipantEntity)
    private readonly participantRepository: Repository<ScheduleEventParticipantEntity>,

    @InjectRepository(StaffEntity)
    private readonly staffRepository: Repository<StaffEntity>,
  ) {}

  async seed() {
    console.log('Starting OpenTalk seeding...');

    // Define event interface for better typing
    interface EventData {
      title: string;
      type: string;
      notes: string;
      eventDate: Date;
      status: EventStatus;
      cycleId: number;
      assignedStaff: StaffEntity | null | undefined;
    }

    // Get all active staff members
    const staff = await this.staffRepository.find({
      where: { status: 0 }, // StaffStatus.ACTIVE = 0
      relations: ['user'],
    });

    if (staff.length === 0) {
      console.log('No active staff found. Skipping OpenTalk seeding.');
      return;
    }

    // Create realistic cycles - current and next month
    const cycles = [
      {
        name: 'OpenTalk January 2026',
        type: 'OPENTALK',
        description: 'Weekly OpenTalk sessions for January 2026',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-31'),
        status: 'ACTIVE' as any,
      },
      {
        name: 'OpenTalk February 2026',
        type: 'OPENTALK',
        description: 'Weekly OpenTalk sessions for February 2026',
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-02-28'),
        status: 'DRAFT' as any,
      },
    ];

    const createdCycles: ScheduleCycleEntity[] = [];
    for (const cycleData of cycles) {
      // Check if cycle already exists
      const existingCycle = await this.cycleRepository.findOne({
        where: { name: cycleData.name },
      });

      if (!existingCycle) {
        const cycle = this.cycleRepository.create(cycleData);
        const savedCycle = await this.cycleRepository.save(cycle);
        createdCycles.push(savedCycle);
        console.log(`Created cycle: ${cycleData.name}`);
      } else {
        createdCycles.push(existingCycle);
        console.log(`Cycle already exists: ${cycleData.name}`);
      }
    }

    // Find specific staff members for the real scenario
    const tienNguyen = staff.find(
      (s) =>
        s.user?.email?.includes('tien.nguyenvan') ||
        s.email?.includes('tien.nguyenvan'),
    );
    const hoNguyen = staff.find(
      (s) =>
        s.user?.email?.includes('ho.nguyenphi') ||
        s.email?.includes('ho.nguyenphi'),
    );
    const thangThieu = staff.find(
      (s) =>
        s.user?.email?.includes('thang.thieuquang') ||
        s.email?.includes('thang.thieuquang'),
    );

    console.log('Found staff members:', {
      tien: tienNguyen
        ? `${tienNguyen.email} (ID: ${tienNguyen.id})`
        : 'Not found',
      ho: hoNguyen ? `${hoNguyen.email} (ID: ${hoNguyen.id})` : 'Not found',
      thang: thangThieu
        ? `${thangThieu.email} (ID: ${thangThieu.id})`
        : 'Not found',
    });

    // Create events for January 2026 cycle (current)
    const currentCycle = createdCycles[0];
    if (currentCycle) {
      const januaryEvents: EventData[] = [
        {
          title: 'Weekly OpenTalk Session #1',
          type: 'OPENTALK',
          notes:
            'Weekly team discussion and knowledge sharing - Presenter: tien.nguyenvan',
          eventDate: new Date('2026-01-10T14:00:00'),
          status: EventStatus.COMPLETED,
          cycleId: currentCycle.id,
          assignedStaff: tienNguyen,
        },
        {
          title: 'Weekly OpenTalk Session #2',
          type: 'OPENTALK',
          notes:
            'Weekly team discussion and knowledge sharing - Presenter: ho.nguyenphi',
          eventDate: new Date('2026-01-17T14:00:00'),
          status: EventStatus.COMPLETED,
          cycleId: currentCycle.id,
          assignedStaff: hoNguyen,
        },
        {
          title: 'Weekly OpenTalk Session #3',
          type: 'OPENTALK',
          notes:
            'Weekly team discussion and knowledge sharing - Presenter: thang.thieuquang',
          eventDate: new Date('2026-01-24T14:00:00'),
          status: EventStatus.COMPLETED,
          cycleId: currentCycle.id,
          assignedStaff: thangThieu,
        },
        {
          title: 'Weekly OpenTalk Session #4',
          type: 'OPENTALK',
          notes:
            'Weekly team discussion and knowledge sharing - No presenter assigned yet',
          eventDate: new Date('2026-01-31T14:00:00'),
          status: EventStatus.PENDING,
          cycleId: currentCycle.id,
          assignedStaff: null,
        },
      ];

      for (const eventData of januaryEvents) {
        // Check if event already exists
        const existingEvent = await this.eventRepository.findOne({
          where: {
            title: eventData.title,
            cycleId: currentCycle.id,
          },
        });

        if (!existingEvent) {
          const event = this.eventRepository.create({
            title: eventData.title,
            type: eventData.type,
            notes: eventData.notes,
            eventDate: eventData.eventDate,
            status: eventData.status,
            cycleId: eventData.cycleId,
          });
          const savedEvent = await this.eventRepository.save(event);

          // Create participant relationship if staff is assigned
          if (eventData.assignedStaff) {
            const participant = this.participantRepository.create({
              eventId: savedEvent.id,
              staffId: eventData.assignedStaff!.id,
            });
            await this.participantRepository.save(participant);
          }

          console.log(
            `Created event: ${eventData.title} for ${eventData.eventDate}`,
          );
        } else {
          console.log(`Event already exists: ${eventData.title}`);
        }
      }
    }

    // Create events for February 2026 cycle (next)
    const nextCycle = createdCycles[1];
    if (nextCycle) {
      const februaryEvents: EventData[] = [
        {
          title: 'Weekly OpenTalk Session #1',
          type: 'OPENTALK',
          notes: 'Weekly team discussion and knowledge sharing',
          eventDate: new Date('2026-02-07T14:00:00'),
          status: EventStatus.PENDING,
          cycleId: nextCycle.id,
          assignedStaff: null, // To be assigned
        },
        {
          title: 'Weekly OpenTalk Session #2',
          type: 'OPENTALK',
          notes: 'Weekly team discussion and knowledge sharing',
          eventDate: new Date('2026-02-14T14:00:00'),
          status: EventStatus.PENDING,
          cycleId: nextCycle.id,
          assignedStaff: null, // To be assigned
        },
        {
          title: 'Weekly OpenTalk Session #3',
          type: 'OPENTALK',
          notes: 'Weekly team discussion and knowledge sharing',
          eventDate: new Date('2026-02-21T14:00:00'),
          status: EventStatus.PENDING,
          cycleId: nextCycle.id,
          assignedStaff: null, // To be assigned
        },
        {
          title: 'Weekly OpenTalk Session #4',
          type: 'OPENTALK',
          notes: 'Weekly team discussion and knowledge sharing',
          eventDate: new Date('2026-02-28T14:00:00'),
          status: EventStatus.PENDING,
          cycleId: nextCycle.id,
          assignedStaff: null, // To be assigned
        },
      ];

      for (const eventData of februaryEvents) {
        // Check if event already exists
        const existingEvent = await this.eventRepository.findOne({
          where: {
            title: eventData.title,
            cycleId: nextCycle.id,
          },
        });

        if (!existingEvent) {
          const event = this.eventRepository.create({
            title: eventData.title,
            type: eventData.type,
            notes: eventData.notes,
            eventDate: eventData.eventDate,
            status: eventData.status,
            cycleId: eventData.cycleId,
          });
          const savedEvent = await this.eventRepository.save(event);

          // Create participant relationship if staff is assigned
          if (eventData.assignedStaff) {
            const participant = this.participantRepository.create({
              eventId: savedEvent.id,
              staffId: eventData.assignedStaff!.id,
            });
            await this.participantRepository.save(participant);
          }

          console.log(
            `Created event: ${eventData.title} for ${eventData.eventDate}`,
          );
        } else {
          console.log(`Event already exists: ${eventData.title}`);
        }
      }
    }

    console.log('OpenTalk seeding completed successfully!');
  }
}
