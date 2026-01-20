import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import {
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isPushNotificationSupported,
  getNotificationPermission,
  showLocalNotification,
} from "@/lib/pushNotifications";

export function NotificationSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsSupported(isPushNotificationSupported());
    setPermission(getNotificationPermission());
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('[Notifications] Failed to check subscription:', error);
    }
  };

  const handleEnable = async () => {
    setLoading(true);
    try {
      const perm = await requestNotificationPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        toast.error('Notification permission denied');
        setLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await subscribeToPushNotifications(registration);

      if (subscription) {
        setIsSubscribed(true);
        toast.success('Notifications enabled successfully');
        
        // Show a test notification
        await showLocalNotification('Porn Star League', {
          body: 'You will now receive tournament updates and new performer alerts',
          icon: '/pwa-icon-192.png',
        });
      } else {
        toast.error('Failed to enable notifications');
      }
    } catch (error) {
      console.error('[Notifications] Failed to enable:', error);
      toast.error('Failed to enable notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const success = await unsubscribeFromPushNotifications(registration);

      if (success) {
        setIsSubscribed(false);
        toast.success('Notifications disabled');
      } else {
        toast.error('Failed to disable notifications');
      }
    } catch (error) {
      console.error('[Notifications] Failed to disable:', error);
      toast.error('Failed to disable notifications');
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are not supported in your browser
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isSubscribed ? (
            <Bell className="h-5 w-5 text-primary" />
          ) : (
            <BellOff className="h-5 w-5" />
          )}
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get notified about tournament updates, new performers, and more
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                Status: {isSubscribed ? 'Enabled' : 'Disabled'}
              </p>
              <p className="text-xs text-muted-foreground">
                Permission: {permission}
              </p>
            </div>
            {isSubscribed ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisable}
                disabled={loading}
              >
                <BellOff className="h-4 w-4 mr-2" />
                Disable
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleEnable}
                disabled={loading || permission === 'denied'}
              >
                <Bell className="h-4 w-4 mr-2" />
                Enable
              </Button>
            )}
          </div>

          {permission === 'denied' && (
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
              <p className="font-medium mb-1">Notifications are blocked</p>
              <p>
                To enable notifications, please allow them in your browser settings
              </p>
            </div>
          )}

          {isSubscribed && (
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">You'll receive notifications for:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>New tournament announcements</li>
                <li>Tournament start/end reminders</li>
                <li>New performer releases</li>
                <li>Leaderboard position changes</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
