import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto"; // Import randomUUID
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

const sqlite = new Database("./sqlite.db");
const db = drizzle(sqlite);

export class DrizzleStorage implements IStorage {
  async createEvent(insertEvent: InsertEvent & { anonymousMode?: number }): Promise<Event> {
    const [newEvent] = await db
      .insert(events)
      .values({
        ...insertEvent,
        id: randomUUID(), // Generate UUID in application
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
      .values({
        ...insertParticipant,
        id: randomUUID(), // Generate UUID in application
        wishlist: JSON.stringify(insertParticipant.wishlist), // Stringify wishlist for text column
      })
      .returning();
    if (!newParticipant) {
      throw new Error("Failed to create participant");
    }
    return newParticipant;
  }

  async getParticipantsByEvent(eventId: string): Promise<Participant[]> {
    const result = await db.select().from(participants).where(eq(participants.eventId, eventId));
    return result.map(p => ({
      ...p,
      wishlist: JSON.parse(p.wishlist as string) // Parse wishlist back to array
    }));
  }

  async getParticipant(id: string): Promise<Participant | undefined> {
    const participant = await db.select().from(participants).where(eq(participants.id, id)).limit(1);
    if (participant[0]) {
      return {
        ...participant[0],
        wishlist: JSON.parse(participant[0].wishlist as string)
      };
    }
    return undefined;
  }

  async getParticipantByEventAndName(eventId: string, name: string): Promise<Participant | undefined> {
    const participant = await db
      .select()
      .from(participants)
      .where(and(eq(participants.eventId, eventId), eq(participants.name, name)))
      .limit(1);
    if (participant[0]) {
      return {
        ...participant[0],
        wishlist: JSON.parse(participant[0].wishlist as string)
      };
    }
    return undefined;
  }

  async createAssignments(insertAssignments: InsertAssignment[]): Promise<Assignment[]> {
    const assignmentsToInsert = insertAssignments.map(a => ({
      ...a,
      id: randomUUID(), // Generate UUID in application
    }));
    const newAssignments = await db
      .insert(assignments)
      .values(assignmentsToInsert)
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
      .where(and(eq(assignments.eventId, eventId), eq(assignments.giverId, giverId)))
      .limit(1);
    return assignment[0];
  }
}
