import { apiRequest } from "@/lib/queryClient";

export interface CreateEventRequest {
  name: string;
  description?: string;
  organizerId: string;
  organizerName: string;
  maxParticipants: number;
  budget?: string;
  exchangeDate?: string;
  anonymousMode?: boolean;
}

export interface JoinEventRequest {
  name: string;
  wishlist: string[];
}

export interface EventResponse {
  id: string;
  name: string;
  description?: string | null;
  organizerId: string;
  organizerName: string;
  maxParticipants: number;
  status: "waiting" | "drawn" | "completed";
  budget?: string | null;
  exchangeDate?: string | null;
  anonymousMode: boolean;
  createdAt: string;
  participantCount: number;
  participants: Array<{
    id: string;
    name: string;
    joinedAt: string;
  }>;
}

export interface ParticipantResponse {
  id: string;
  name: string;
  eventId: string;
}

export interface AssignmentResponse {
  status: "waiting" | "assigned";
  message?: string;
  receiver?: {
    name: string;
    wishlist: string[];
  };
}

export async function createEvent(data: CreateEventRequest): Promise<EventResponse> {
  const response = await apiRequest("POST", "/api/events", data);
  return response.json();
}

export async function getEvent(eventId: string): Promise<EventResponse> {
  const response = await apiRequest("GET", `/api/events/${eventId}`);
  return response.json();
}

export async function joinEvent(eventId: string, data: JoinEventRequest): Promise<{
  participant: ParticipantResponse;
  event: { id: string; name: string; status: string };
}> {
  const response = await apiRequest("POST", `/api/events/${eventId}/join`, data);
  return response.json();
}

export async function runDraw(eventId: string): Promise<{ message: string; assignmentCount: number }> {
  const response = await apiRequest("POST", `/api/events/${eventId}/draw`);
  return response.json();
}

export async function getAssignment(eventId: string, participantId: string): Promise<AssignmentResponse> {
  const response = await apiRequest("GET", `/api/events/${eventId}/participants/${participantId}/assignment`);
  return response.json();
}
