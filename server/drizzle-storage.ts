import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and } from "drizzle-orm"; // Import 'and' for multiple conditions
import {
  events,
  participants,
  assignments,
  type Event,
  type InsertEvent,
  type Participant,
  type InsertParticipant,
  type Assignment,
  type InsertAssignment,
} from "@shared/schema";
import { IStorage } from "./storage";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

export class DrizzleStorage implements IStorage {
  async createEvent(insertEvent: InsertEvent & { anonymousMode?: number }): Promise<Event> {
    const [newEvent] = await db
      .insert(events)
      .values({
        ...insertEvent,
        anonymousMode: insertEvent.anonymousMode === 0 ? 0 : 1,
      })
      .returning();
    if (!newEvent) {
      throw new Error("Failed to create event");
    }
    return newEvent;
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const event = await db.select().from(events).where(eq(events.id, id)).limit(1);
    return event[0];
  }

  async updateEventStatus(id: string, status: "waiting" | "drawn" | "completed"): Promise<void> {
    await db.update(events).set({ status }).where(eq(events.id, id));
  }

  async createParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    const [newParticipant] = await db
      .insert(participants)
      .values(insertParticipant)
      .returning();
    if (!newParticipant) {
      throw new Error("Failed to create participant");
    }
    return newParticipant;
  }

  async getParticipantsByEvent(eventId: string): Promise<Participant[]> {
    return db.select().from(participants).where(eq(participants.eventId, eventId));
  }

  async getParticipant(id: string): Promise<Participant | undefined> {
    const participant = await db.select().from(participants).where(eq(participants.id, id)).limit(1);
    return participant[0];
  }

  async getParticipantByEventAndName(eventId: string, name: string): Promise<Participant | undefined> {
    const participant = await db
      .select()
      .from(participants)
      .where(and(eq(participants.eventId, eventId), eq(participants.name, name))) // Use 'and' for multiple conditions
      .limit(1);
    return participant[0];
  }

  async createAssignments(insertAssignments: InsertAssignment[]): Promise<Assignment[]> {
    const newAssignments = await db
      .insert(assignments)
      .values(insertAssignments)
      .returning();
    return newAssignments;
  }

  async getAssignmentsByEvent(eventId: string): Promise<Assignment[]> {
    return db.select().from(assignments).where(eq(assignments.eventId, eventId));
  }

  async getAssignmentForGiver(eventId: string, giverId: string): Promise<Assignment | undefined> {
    const assignment = await db
      .select()
      .from(assignments)
      .where(and(eq(assignments.eventId, eventId), eq(assignments.giverId, giverId))) // Use 'and' for multiple conditions
      .limit(1);
    return assignment[0];
  }
}
