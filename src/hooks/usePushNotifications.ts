import { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function usePushNotifications() {
  const navigate = useNavigate();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      registerPush();
    }
  }, []);

  const registerPush = async () => {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      return;
    }

    // Request permissions for Local Notifications as well
    let localPermStatus = await LocalNotifications.checkPermissions();
    if (localPermStatus.display === 'prompt') {
      await LocalNotifications.requestPermissions();
    }

    // Create a high importance notification channel for Android 8+
    await PushNotifications.createChannel({
      id: 'high_importance_channel',
      name: 'Important Alerts',
      description: 'High priority notifications for important updates',
      importance: 5,
      visibility: 1,
      vibration: true,
    });

    // Create a standard channel for general notifications
    await PushNotifications.createChannel({
      id: 'default_channel',
      name: 'General Updates',
      description: 'Standard notifications',
      importance: 3,
      visibility: 1,
      vibration: true,
    });

    await PushNotifications.register();

    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token: ' + token.value);
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.log('Error on registration: ' + JSON.stringify(error));
    });

    // When a push notification is received while the app is in the foreground
    PushNotifications.addListener(
      'pushNotificationReceived',
      async (notification) => {
        // Display as a rich local notification to support BigTextStyle and Grouping
        await LocalNotifications.schedule({
          notifications: [
            {
              title: notification.title || 'New Notification',
              body: notification.body || '',
              largeBody: notification.body, // Enables BigTextStyle for long messages
              id: new Date().getTime(),
              schedule: { at: new Date(Date.now() + 100) },
              channelId: 'high_importance_channel',
              group: 'mahimock_alerts', // Android grouping
              extra: notification.data,
            }
          ]
        });
      },
    );

    // When the user taps the push notification
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notificationAction) => {
        const data = notificationAction.notification.data;
        console.log('Push action performed: ' + JSON.stringify(notificationAction));
        
        // Navigate based on route or url in the notification payload
        if (data && (data.route || data.url)) {
          navigate(data.route || data.url);
        } else {
          // Default fallback
          navigate('/updates');
        }
      },
    );

    // When the user taps the local notification (foreground scheduled)
    LocalNotifications.addListener(
      'localNotificationActionPerformed',
      (notificationAction) => {
        const data = notificationAction.notification.extra;
        console.log('Local action performed: ' + JSON.stringify(notificationAction));
        
        if (data && (data.route || data.url)) {
          navigate(data.route || data.url);
        } else {
          navigate('/updates');
        }
      },
    );
  };
}
