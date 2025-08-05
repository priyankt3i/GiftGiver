import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getEvent, getAssignment, type EventResponse, type AssignmentResponse } from '@/lib/api';
import { getParticipantSession } from '@/lib/session';
import { Gift, Clock, CheckCircle, Users, Calendar, DollarSign } from 'lucide-react';

export default function ParticipantDashboard() {
  const { eventId } = useParams();
  const participantSession = getParticipantSession();

  const { data: event, isLoading: eventLoading } = useQuery<EventResponse>({
    queryKey: ['/api/events', eventId],
    enabled: !!eventId,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  const { data: assignment, isLoading: assignmentLoading } = useQuery<AssignmentResponse>({
    queryKey: ['/api/events', eventId, 'participants', participantSession?.participantId, 'assignment'],
    enabled: !!eventId && !!participantSession?.participantId,
    refetchInterval: 5000,
  });

  if (eventLoading || assignmentLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50">
        <header className="bg-white shadow-sm border-b border-red-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Gift className="text-red-500 text-2xl" />
                <h1 className="text-xl font-bold text-gray-900">Secret Santa</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!event || !participantSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50">
        <header className="bg-white shadow-sm border-b border-red-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Gift className="text-red-500 text-2xl" />
                <h1 className="text-xl font-bold text-gray-900">Secret Santa</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Session Not Found</h2>
                <p className="text-gray-600">
                  Please join the event again to access your participant dashboard.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const getStatusContent = () => {
    if (!assignment) {
      return {
        icon: <Clock className="w-8 h-8 text-yellow-500" />,
        title: "Waiting for Draw",
        description: "The organizer hasn't run the draw yet. You'll be notified when your Secret Santa assignment is ready!",
        badge: (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-2" />
            Waiting
          </Badge>
        )
      };
    }

    if (assignment.status === 'waiting') {
      return {
        icon: <Clock className="w-8 h-8 text-yellow-500" />,
        title: "Waiting for Draw",
        description: assignment.message || "The draw hasn't been performed yet.",
        badge: (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-2" />
            Waiting
          </Badge>
        )
      };
    }

    return {
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      title: "Assignment Ready!",
      description: "Your Secret Santa assignment is ready. Time to start shopping!",
      badge: (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <CheckCircle className="w-4 h-4 mr-2" />
          Assigned
        </Badge>
      )
    };
  };

  const statusContent = getStatusContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-red-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Gift className="text-red-500 text-2xl" />
              <h1 className="text-xl font-bold text-gray-900">Secret Santa</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {participantSession.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">{participantSession.name}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to {event.name}</h2>
          <p className="text-gray-600">
            {event.description || "You're participating in this Secret Santa event!"}
          </p>
        </div>

        {/* Status Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="text-center">
              {statusContent.icon}
              <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
                {statusContent.title}
              </h3>
              <p className="text-gray-600 mb-4">{statusContent.description}</p>
              {statusContent.badge}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium">Participants</p>
                  <p className="text-sm text-gray-600">
                    {event.participantCount} of {event.maxParticipants} joined
                  </p>
                </div>
              </div>

              {event.budget && (
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Budget</p>
                    <p className="text-sm text-gray-600">{event.budget}</p>
                  </div>
                </div>
              )}

              {event.exchangeDate && (
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Exchange Date</p>
                    <p className="text-sm text-gray-600">
                      {new Date(event.exchangeDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Gift className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium">Organizer</p>
                  <p className="text-sm text-gray-600">{event.organizerName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Secret Santa Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              {assignment?.status === 'assigned' && assignment.receiver ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-center">
                      <h4 className="font-semibold text-green-900 mb-2">
                        You're Secret Santa for:
                      </h4>
                      <p className="text-2xl font-bold text-green-800">
                        {assignment.receiver.name}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Their Wishlist:</h5>
                    <div className="space-y-2">
                      {assignment.receiver.wishlist.map((item: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <span className="text-gray-900">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Remember:</strong> Keep it a secret! The fun is in the surprise. 
                      Happy shopping! 🎁
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Your assignment will appear here once the organizer runs the draw.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
