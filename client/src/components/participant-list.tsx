import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { CheckCircle, Clock, User } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  joinedAt: string;
}

interface ParticipantListProps {
  participants: Participant[];
  maxParticipants: number;
  status: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getGradientColor(index: number): string {
  const colors = [
    'from-red-500 to-green-500',
    'from-blue-500 to-purple-500',
    'from-yellow-500 to-orange-500',
    'from-green-500 to-teal-500',
    'from-pink-500 to-rose-500',
    'from-indigo-500 to-blue-500',
    'from-purple-500 to-pink-500',
    'from-orange-500 to-red-500',
  ];
  return colors[index % colors.length];
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
}

export function ParticipantList({ participants, maxParticipants, status }: ParticipantListProps) {
  const progressPercentage = (participants.length / maxParticipants) * 100;
  const emptySlots = Math.max(0, maxParticipants - participants.length);

  return (
    <Card>
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Participants</CardTitle>
          <span className="text-sm text-gray-500">{participants.length} enrolled</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Enrollment Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        {/* Participants Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {participants.map((participant, index) => (
            <div
              key={participant.id}
              className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className={`w-10 h-10 bg-gradient-to-r ${getGradientColor(index)} rounded-full flex items-center justify-center`}>
                <span className="text-white text-sm font-medium">
                  {getInitials(participant.name)}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{participant.name}</p>
                <p className="text-sm text-gray-500">
                  Joined {formatTimeAgo(participant.joinedAt)}
                </p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          ))}
          
          {/* Empty slots */}
          {Array.from({ length: emptySlots }, (_, index) => (
            <div
              key={`empty-${index}`}
              className="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-xl"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-gray-400 font-medium">Waiting for participant</p>
                <p className="text-sm text-gray-300">Share the invite link</p>
              </div>
              <Clock className="w-5 h-5 text-gray-300" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
