import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertParticipantSchema } from "@shared/schema";
import { randomUUID } from "crypto";

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateSecretSantaAssignments(participantIds: string[]) {
  if (participantIds.length < 2) {
    throw new Error("Need at least 2 participants for Secret Santa");
  }

  let assignments: Array<{giverId: string, receiverId: string}> = [];
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const shuffled = shuffle(participantIds);
    const valid = !shuffled.some((receiverId, i) => receiverId === participantIds[i]);
    
    if (valid) {
      assignments = participantIds.map((giverId, i) => ({
        giverId,
        receiverId: shuffled[i]
      }));
      break;
    }
    attempts++;
  }

  if (assignments.length === 0) {
    throw new Error("Could not generate valid Secret Santa assignments");
  }

  return assignments;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create new event
  app.post("/api/events", async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid event data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Get event details
  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const participants = await storage.getParticipantsByEvent(event.id);
      
      res.json({
        ...event,
        participantCount: participants.length,
        participants: participants.map(p => ({
          id: p.id,
          name: p.name,
          joinedAt: p.joinedAt
        }))
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get event", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Join event
  app.post("/api/events/:id/join", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (event.status !== "waiting") {
        return res.status(400).json({ message: "Event is no longer accepting participants" });
      }

      const currentParticipants = await storage.getParticipantsByEvent(event.id);
      if (currentParticipants.length >= event.maxParticipants) {
        return res.status(400).json({ message: "Event is full" });
      }

      const participantData = insertParticipantSchema.parse({
        ...req.body,
        eventId: event.id
      });

      // Check if participant already exists
      const existingParticipant = await storage.getParticipantByEventAndName(event.id, participantData.name);
      if (existingParticipant) {
        return res.status(400).json({ message: "A participant with this name already exists" });
      }

      const participant = await storage.createParticipant(participantData);
      
      // Store participant ID in session/response for frontend
      res.json({
        participant: {
          id: participant.id,
          name: participant.name,
          eventId: participant.eventId
        },
        event: {
          id: event.id,
          name: event.name,
          status: event.status
        }
      });
    } catch (error) {
      res.status(400).json({ message: "Failed to join event", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Get participants for event
  app.get("/api/events/:id/participants", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const participants = await storage.getParticipantsByEvent(event.id);
      res.json(participants.map(p => ({
        id: p.id,
        name: p.name,
        joinedAt: p.joinedAt
      })));
    } catch (error) {
      res.status(500).json({ message: "Failed to get participants", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Run draw
  app.post("/api/events/:id/draw", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (event.status !== "waiting") {
        return res.status(400).json({ message: "Draw has already been performed" });
      }

      const participants = await storage.getParticipantsByEvent(event.id);
      if (participants.length < 2) {
        return res.status(400).json({ message: "Need at least 2 participants to run draw" });
      }

      if (participants.length < event.maxParticipants) {
        return res.status(400).json({ message: "Waiting for all participants to join" });
      }

      const participantIds = participants.map(p => p.id);
      const assignmentPairs = generateSecretSantaAssignments(participantIds);
      
      const assignments = await storage.createAssignments(
        assignmentPairs.map(pair => ({
          eventId: event.id,
          giverId: pair.giverId,
          receiverId: pair.receiverId
        }))
      );

      await storage.updateEventStatus(event.id, "drawn");

      res.json({ 
        message: "Draw completed successfully",
        assignmentCount: assignments.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to run draw", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Get participant's assignment
  app.get("/api/events/:eventId/participants/:participantId/assignment", async (req, res) => {
    try {
      const { eventId, participantId } = req.params;
      
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const participant = await storage.getParticipant(participantId);
      if (!participant || participant.eventId !== eventId) {
        return res.status(404).json({ message: "Participant not found" });
      }

      if (event.status === "waiting") {
        return res.json({
          status: "waiting",
          message: "Draw has not been performed yet"
        });
      }

      const assignment = await storage.getAssignmentForGiver(eventId, participantId);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      const receiver = await storage.getParticipant(assignment.receiverId);
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
      }

      res.json({
        status: "assigned",
        receiver: {
          name: receiver.name,
          wishlist: receiver.wishlist
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get assignment", error: error instanceof Error ? error.message : String(error) });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
