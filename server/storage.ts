import { type Event, type InsertEvent, type Participant, type InsertParticipant, type Assignment, type InsertAssignment } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Events
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: string): Promise<Event | undefined>;
  updateEventStatus(id: string, status: "waiting" | "drawn" | "completed"): Promise<void>;
  
  // Participants
  createParticipant(participant: InsertParticipant): Promise<Participant>;
  getParticipantsByEvent(eventId: string): Promise<Participant[]>;
  getParticipant(id: string): Promise<Participant | undefined>;
  getParticipantByEventAndName(eventId: string, name: string): Promise<Participant | undefined>;
  
  // Assignments
  createAssignments(assignments: InsertAssignment[]): Promise<Assignment[]>;
  getAssignmentsByEvent(eventId: string): Promise<Assignment[]>;
  getAssignmentForGiver(eventId: string, giverId: string): Promise<Assignment | undefined>;
}

export class MemStorage implements IStorage {
  private events: Map<string, Event>;
  private participants: Map<string, Participant>;
  private assignments: Map<string, Assignment>;

  constructor() {
    this.events = new Map();
    this.participants = new Map();
    this.assignments = new Map();
  }

  async createEvent(insertEvent: InsertEvent & { anonymousMode?: number }): Promise<Event> {
    const id = randomUUID();
    const event: Event = {
      ...insertEvent,
      id,
      status: "waiting",
      description: insertEvent.description || null,
      budget: insertEvent.budget || null,
      exchangeDate: insertEvent.exchangeDate || null,
      anonymousMode: insertEvent.anonymousMode || 1,
      createdAt: new Date(),
    };
    this.events.set(id, event);
    return event;
  }

  async getEvent(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async updateEventStatus(id: string, status: "waiting" | "drawn" | "completed"): Promise<void> {
    const event = this.events.get(id);
    if (event) {
      event.status = status;
      this.events.set(id, event);
    }
  }

  async createParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    const id = randomUUID();
    const participant: Participant = {
      ...insertParticipant,
      id,
      assignedTo: null,
      joinedAt: new Date(),
    };
    this.participants.set(id, participant);
    return participant;
  }

  async getParticipantsByEvent(eventId: string): Promise<Participant[]> {
    return Array.from(this.participants.values()).filter(
      (participant) => participant.eventId === eventId
    );
  }

  async getParticipant(id: string): Promise<Participant | undefined> {
    return this.participants.get(id);
  }

  async getParticipantByEventAndName(eventId: string, name: string): Promise<Participant | undefined> {
    return Array.from(this.participants.values()).find(
      (participant) => participant.eventId === eventId && participant.name.toLowerCase() === name.toLowerCase()
    );
  }

  async createAssignments(insertAssignments: InsertAssignment[]): Promise<Assignment[]> {
    const assignments: Assignment[] = [];
    
    for (const insertAssignment of insertAssignments) {
      const id = randomUUID();
      const assignment: Assignment = {
        ...insertAssignment,
        id,
        createdAt: new Date(),
      };
      this.assignments.set(id, assignment);
      assignments.push(assignment);
    }
    
    return assignments;
  }

  async getAssignmentsByEvent(eventId: string): Promise<Assignment[]> {
    return Array.from(this.assignments.values()).filter(
      (assignment) => assignment.eventId === eventId
    );
  }

  async getAssignmentForGiver(eventId: string, giverId: string): Promise<Assignment | undefined> {
    return Array.from(this.assignments.values()).find(
      (assignment) => assignment.eventId === eventId && assignment.giverId === giverId
    );
  }
}

export const storage = new MemStorage();
