import { cleaningApi } from '@/shared/lib/api/cleaning.api';

class CleaningServerService {
  async getCycles(status?: string) {
    const params = status ? { status } : {};
    return cleaningApi.getCycles(params);
  }

  async getCycleById(id: number) {
    return cleaningApi.getCycleById(id);
  }

  async getEvents(query: any = {}) {
    return cleaningApi.getEvents(query);
  }

  async getEventsByCycle(cycleId: number) {
    return cleaningApi.getEventsByCycle(cycleId);
  }

  async createCycle(data: any) {
    return cleaningApi.createCycle(data);
  }

  async updateCycle(id: number, data: any) {
    return cleaningApi.updateCycle(id, data);
  }

  async deleteCycle(id: number) {
    return cleaningApi.deleteCycle(id);
  }

  async createEvent(data: any) {
    return cleaningApi.createEvent(data);
  }

  async updateEvent(id: number, data: any) {
    return cleaningApi.updateEvent(id, data);
  }

  async deleteEvent(id: number) {
    return cleaningApi.deleteEvent(id);
  }

  async bulkAssignParticipants(data: any) {
    return cleaningApi.bulkAssignParticipants(data);
  }

  async getSpreadsheetData(cycleId?: number) {
    const params = cycleId ? { cycleId } : {};
    return cleaningApi.getSpreadsheetData(params);
  }

  async checkConflicts(cycleId?: number) {
    const params = cycleId ? { cycleId } : {};
    return cleaningApi.checkConflicts(params);
  }
}

export const cleaningServerService = new CleaningServerService();
