import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  organizerId: text("organizer_id").notNull(),
  organizerName: text("organizer_name").notNull(),
  maxParticipants: integer("max_participants").notNull().default(10),
  status: text("status", { enum: ["waiting", "drawn", "completed"] }).notNull().default("waiting"),
  budget: text("budget"),
  exchangeDate: text("exchange_date"),
  anonymousMode: integer("anonymous_mode", { mode: "boolean" }).notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const participants = pgTable("participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: text("event_id").notNull(),
  name: text("name").notNull(),
  wishlist: jsonb("wishlist").$type<string[]>().notNull().default([]),
  assignedTo: text("assigned_to"),
  joinedAt: timestamp("joined_at").notNull().default(sql`now()`),
});

export const assignments = pgTable("assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: text("event_id").notNull(),
  giverId: text("giver_id").notNull(),
  receiverId: text("receiver_id").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
}).extend({
  organizerId: z.string().min(1),
  organizerName: z.string().min(1),
  name: z.string().min(1),
  maxParticipants: z.number().min(2).max(100),
});

export const insertParticipantSchema = createInsertSchema(participants).omit({
  id: true,
  joinedAt: true,
  assignedTo: true,
}).extend({
  eventId: z.string().min(1),
  name: z.string().min(1),
  wishlist: z.array(z.string()).min(1).max(5),
});

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  createdAt: true,
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type Participant = typeof participants.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type Assignment = typeof assignments.$inferSelect;
