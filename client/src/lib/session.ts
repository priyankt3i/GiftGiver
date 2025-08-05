interface ParticipantSession {
  participantId: string;
  eventId: string;
  name: string;
}

interface OrganizerSession {
  organizerId: string;
  name: string;
}

export function saveParticipantSession(session: ParticipantSession): void {
  localStorage.setItem('secret-santa-participant', JSON.stringify(session));
}

export function getParticipantSession(): ParticipantSession | null {
  const stored = localStorage.getItem('secret-santa-participant');
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearParticipantSession(): void {
  localStorage.removeItem('secret-santa-participant');
}

export function saveOrganizerSession(session: OrganizerSession): void {
  localStorage.setItem('secret-santa-organizer', JSON.stringify(session));
}

export function getOrganizerSession(): OrganizerSession | null {
  const stored = localStorage.getItem('secret-santa-organizer');
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearOrganizerSession(): void {
  localStorage.removeItem('secret-santa-organizer');
}

export function generateUserId(): string {
  return Math.random().toString(36).substr(2, 9);
}
