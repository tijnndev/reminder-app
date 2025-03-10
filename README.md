# Notification App

A reminder and notification application built with **Quasar Framework**, **Vue 3**, **TypeScript**, and **Capacitor**. This app allows users to create, manage, and receive notifications for reminders stored locally using **Capacitor Storage**.

## Features

✅ Create, update, and delete reminders  
✅ Store reminders using **Capacitor Storage**  
✅ Local notifications on **mobile (Android)**  
✅ Desktop notifications using **Notification API**  
✅ Recurring reminders (**hourly, daily, weekly, monthly**)  
✅ Cross-platform support (Android, Web, Desktop)  

## Tech Stack

- **Quasar Framework** (UI & PWA capabilities)
- **Vue 3** (Reactivity & Composition API)
- **TypeScript** (Type safety)
- **Capacitor** (Accessing native device APIs)
- **Local Notifications** (Reminder alerts)
- **Capacitor Storage** (Persist reminders locally)

## Installation

### Prerequisites
Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Quasar CLI](https://quasar.dev/start/quasar-cli)
- [Capacitor](https://capacitorjs.com/docs/getting-started/) (for mobile builds)

### Clone Repository
```sh
git clone https://github.com/tijnndev/reminder-app.git
cd reminder-app
```

### Install Dependencies
```sh
npm install
```

### Run the App (Development Mode)
#### Web
```sh
quasar dev
```
#### Mobile (Android)
```sh
quasar dev -m capacitor -T android
```

## Building the App

### Web Build
```sh
quasar build
```

### Mobile Build (Capacitor)
```sh
quasar build -m capacitor -T android
cd src-capacitor
npx cap sync
npx cap open android
```

## Handling Notifications

### Requesting Permissions
At app startup, the app checks if it's running on a native device. If so, it requests **Capacitor Local Notification** permissions. Otherwise, it requests **browser notification permissions**.

```ts
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

async function requestNotificationPermission() {
  if (Capacitor.isNativePlatform()) {
    await LocalNotifications.requestPermissions();
  } else {
    Notification.requestPermission();
  }
}
```

### Scheduling a Reminder
```ts
import { LocalNotifications } from '@capacitor/local-notifications';

async function scheduleReminder(title: string, message: string) {
  await LocalNotifications.schedule({
    notifications: [
      {
        id: Date.now(),
        title,
        body: message,
        schedule: { at: new Date() },
      },
    ],
  });
}
```

## Contribution
Feel free to fork, submit PRs, or suggest improvements.

## License
This project is licensed under the **MIT License**.

