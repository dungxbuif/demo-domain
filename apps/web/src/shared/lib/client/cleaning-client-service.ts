import { cleaningServerService } from '@/shared/lib/server/cleaning-server-service';

class CleaningClientService {
  async getCycles(status?: string) {
    try {
      return await cleaningServerService.getCycles(status);
    } catch (error) {
      console.error('Failed to get cleaning cycles:', error);
      throw error;
    }
  }

  async getCycleById(id: number) {
    try {
      return await cleaningServerService.getCycleById(id);
    } catch (error) {
      console.error('Failed to get cleaning cycle:', error);
      throw error;
    }
  }

  async getEvents(query = {}) {
    try {
      return await cleaningServerService.getEvents(query);
    } catch (error) {
      console.error('Failed to get cleaning events:', error);
      throw error;
    }
  }

  async getEventsByCycle(cycleId: number) {
    try {
      return await cleaningServerService.getEventsByCycle(cycleId);
    } catch (error) {
      console.error('Failed to get cleaning events by cycle:', error);
      throw error;
    }
  }

  async createCycle(data: any) {
    try {
      return await cleaningServerService.createCycle(data);
    } catch (error) {
      console.error('Failed to create cleaning cycle:', error);
      throw error;
    }
  }

  async updateCycle(id: number, data: any) {
    try {
      return await cleaningServerService.updateCycle(id, data);
    } catch (error) {
      console.error('Failed to update cleaning cycle:', error);
      throw error;
    }
  }

  async deleteCycle(id: number) {
    try {
      return await cleaningServerService.deleteCycle(id);
    } catch (error) {
      console.error('Failed to delete cleaning cycle:', error);
      throw error;
    }
  }

  async createEvent(data: any) {
    try {
      return await cleaningServerService.createEvent(data);
    } catch (error) {
      console.error('Failed to create cleaning event:', error);
      throw error;
    }
  }

  async updateEvent(id: number, data: any) {
    try {
      return await cleaningServerService.updateEvent(id, data);
    } catch (error) {
      console.error('Failed to update cleaning event:', error);
      throw error;
    }
  }

  async deleteEvent(id: number) {
    try {
      return await cleaningServerService.deleteEvent(id);
    } catch (error) {
      console.error('Failed to delete cleaning event:', error);
      throw error;
    }
  }

  async bulkAssignParticipants(data: any) {
    try {
      return await cleaningServerService.bulkAssignParticipants(data);
    } catch (error) {
      console.error('Failed to bulk assign cleaning participants:', error);
      throw error;
    }
  }

  async getSpreadsheetData(cycleId?: number) {
    try {
      return await cleaningServerService.getSpreadsheetData(cycleId);
    } catch (error) {
      console.error('Failed to get cleaning spreadsheet data:', error);
      throw error;
    }
  }

  async checkConflicts(cycleId?: number) {
    try {
      return await cleaningServerService.checkConflicts(cycleId);
    } catch (error) {
      console.error('Failed to check cleaning conflicts:', error);
      throw error;
    }
  }
}

export const cleaningClientService = new CleaningClientService();
