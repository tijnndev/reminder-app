import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export async function sendNotification(title: string, message: string) {
    if (Capacitor.isNativePlatform()) {
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display === 'granted') {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Date.now(),
              title,
              body: message,
              schedule: { at: new Date() },
              sound: "",
              attachments: [],
              actionTypeId: '',
              extra: null,
            },
          ],
        });
      }
    } else {
      if (Notification.permission === 'granted') {
        new Notification(title, { body: message });
      } else if (Notification.permission !== 'denied') {
        await Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification(title, { body: message });
          }
        });
      }
    }
  }