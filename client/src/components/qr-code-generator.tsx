import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
  eventId: string;
  eventName: string;
}

export function QRCodeGenerator({ eventId, eventName }: QRCodeGeneratorProps) {
  const { toast } = useToast();
  const inviteUrl = `${window.location.origin}/join/${eventId}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast({
        title: "Link copied!",
        description: "Invite link has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${eventName} - Secret Santa`,
          text: `You're invited to join the Secret Santa event: ${eventName}`,
          url: inviteUrl,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      copyLink();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Share Event</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="w-48 h-48 mx-auto mb-4 bg-white p-4 rounded-xl border">
          <QRCodeSVG
            value={inviteUrl}
            size={176}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
            includeMargin={false}
          />
        </div>
        
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Invite Link</p>
            <p className="text-xs text-gray-500 font-mono break-all">{inviteUrl}</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={copyLink}
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy Link
            </Button>
            <Button 
              size="sm" 
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={shareLink}
            >
              <Share className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
