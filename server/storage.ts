import { type Event, type InsertEvent, type Participant, type InsertParticipant, type Assignment, type InsertAssignment } from "@shared/schema";
import { DrizzleStorage } from "./drizzle-storage"; // Import DrizzleStorage

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

// Export an instance of DrizzleStorage
export const storage = new DrizzleStorage();
