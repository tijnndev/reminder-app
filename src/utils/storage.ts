import { Storage } from '@capacitor/storage';
import schedule, { RecurrenceRule } from 'node-schedule';
import { sendNotification } from './notify';

export interface Reminder {
    id: number;
    title: string;
    description?: string;
    dueDate: string;
    frequency: 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly';
    completed: boolean;
}

export interface IStorage {
    createReminder(reminder: Omit<Reminder, 'id' | 'completed'>): Reminder;
    getReminders(): Reminder[];
    markCompleted(id: number): Reminder;
    deleteReminder(id: number): void;
}

export class MemStorage implements IStorage {
  private reminders: Map<number, Reminder>;
  private currentId: number;

  constructor() {
    this.reminders = new Map();
    this.currentId = 1;
    this.loadReminders().catch(console.error);

  }

  private async saveReminders() {
    const data = JSON.stringify(Array.from(this.reminders.values()));
    await Storage.set({ key: 'reminders', value: data });
  }

  public async loadReminders() {
    const storedReminders = await Storage.get({ key: 'reminders' });
    if (storedReminders.value) {
      const parsedReminders: Reminder[] = JSON.parse(storedReminders.value);
      parsedReminders.forEach(reminder => {
        this.reminders.set(reminder.id, reminder);
        scheduleReminder(reminder);
      });
      this.currentId = parsedReminders.length > 0 ? Math.max(...parsedReminders.map(r => r.id)) + 1 : 1;
    }
  }

  createReminder(insertReminder: Omit<Reminder, 'id' | 'completed'>): Reminder {
    const id = this.currentId++;
    const reminder: Reminder = {
      ...insertReminder,
      id,
      completed: false,
    };
    this.reminders.set(id, reminder);
    this.saveReminders().catch(console.error);
    scheduleReminder(reminder);
    return reminder;
  }

  getReminders(): Reminder[] {
    return Array.from(this.reminders.values());
  }

  markCompleted(id: number): Reminder {
    const reminder = this.reminders.get(id);
    if (!reminder) {
      throw new Error("Reminder not found");
    }
    const updated = { ...reminder, completed: true };
    this.reminders.set(id, updated);
    this.saveReminders().catch(console.error);
    cancelScheduledReminder(id);
    return updated;
  }

  deleteReminder(id: number): void {
    if (!this.reminders.delete(id)) {
      throw new Error("Reminder not found");
    }
    this.saveReminders().catch(console.error);
    cancelScheduledReminder(id);
  }
}

const jobs = new Map<number, schedule.Job>();

function scheduleReminder(reminder: Reminder) {
  const rule: RecurrenceRule = new RecurrenceRule();
  
  if (reminder.frequency !== "once") {
    const date = new Date(reminder.dueDate);
    switch (reminder.frequency) {
      case "hourly":
        rule.minute = date.getMinutes();
        break;
      case "daily":
        rule.hour = date.getHours();
        rule.minute = date.getMinutes();
        break;
      case "weekly":
        rule.dayOfWeek = date.getDay();
        rule.hour = date.getHours();
        rule.minute = date.getMinutes();
        break;
      case "monthly":
        rule.date = date.getDate();
        rule.hour = date.getHours();
        rule.minute = date.getMinutes();
        break;
    }
  }

  const job = schedule.scheduleJob(rule, async () => {
    console.log(`[${new Date().toISOString()}] Reminder triggered: ${reminder.title}`);
    await sendNotification(reminder.title, reminder.description || 'Reminder due!');
  });
  if (job) {
    jobs.set(reminder.id, job);
  }
}

function cancelScheduledReminder(reminderId: number) {
  const job = jobs.get(reminderId);
  if (job) {
    job.cancel();
    jobs.delete(reminderId);
  }
}

export async function fetchReminders() {
  try {
    await storage.loadReminders();
    return storage.getReminders();
  } catch (error) {
    console.error('[Error]', error);
    return { message: "Error fetching reminders" };
  }
}

export function createReminder(newReminder: Omit<Reminder, 'id' | 'completed'>) {
  try {
    return storage.createReminder(newReminder);
  } catch (error) {
    console.error('[Error]', error);
    return { message: "Invalid reminder data" };
  }
}

export function markCompleted(reminderId: number) {
  try {
    return storage.markCompleted(reminderId);
  } catch (error) {
    console.error('[Error]', error);
    return { message: "Reminder not found" };
  }
}

export function deleteReminder(reminderId: number) {
  try {
    storage.deleteReminder(reminderId);
    return { message: "Reminder deleted", ok: true };
  } catch (error) {
    console.error('[Error]', error);
    return { message: "Reminder not found", ok: false };
  }
}

export const storage = new MemStorage();
