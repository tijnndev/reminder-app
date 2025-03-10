import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { storage } from './storage';
import logger from './logger';

const deduplicationSet = new Set<number>();

export async function sendNotification(title: string, message: string, id: number) {
  if (deduplicationSet.has(id)) return logger.info("Found notification already");
  deduplicationSet.add(id);


  if (Capacitor.isNativePlatform()) {
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display === 'granted') {
      await LocalNotifications.schedule({
        notifications: [
          {
            id,
            title,
            body: message,
            schedule: { at: new Date(Date.now() + 1000) },
            sound: '',
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
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, { body: message });
      }
    }
  }
  storage.getReminders().filter(reminder => reminder.frequency === "once" && reminder.id == id).forEach(reminder => storage.markCompleted(reminder.id));
}
