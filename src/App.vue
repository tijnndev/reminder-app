<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

async function requestNotificationPermissions() {
  if (Capacitor.isNativePlatform()) {
    const { display } = await LocalNotifications.requestPermissions();
    if (display !== 'granted') {
      console.warn('Local Notification permissions denied');
    } else {
      console.log("Info granted")
    }
  } else if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Browser Notification permissions denied');
    }
  }
}

onMounted(requestNotificationPermissions);
</script>
