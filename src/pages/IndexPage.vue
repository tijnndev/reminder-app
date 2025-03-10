<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">Upcoming Reminders</div>
          </q-card-section>

          <q-card-section>
            <q-list v-if="reminders.length" bordered separator>
              <q-item v-for="reminder in reminders" :key="reminder.id">
                <q-item-section>
                  <q-item-label :class="{ 'text-strike': reminder.completed }">
                    {{ reminder.title }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ reminder.description }}
                  </q-item-label>
                  <q-item-label caption>
                    Due: {{ new Date(reminder.dueDate).toLocaleString() }} |
                    Frequency: {{ reminder.frequency }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="row items-center q-gutter-x-sm">
                    <q-btn
                      v-if="!reminder.completed"
                      flat
                      round
                      color="positive"
                      icon="check"
                      @click="markCompletedFront(reminder.id)"
                    />
                    <q-btn
                      flat
                      round
                      color="negative"
                      icon="delete"
                      @click="deleteReminderFront(reminder.id)"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-grey text-center q-pa-md">
              No reminders yet
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section style="padding-bottom: 0;">
            <div class="text-h6">Create Reminder</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="onSubmit">
              <q-input
                v-model="form.title"
                label="Title"
                :rules="[val => !!val || 'Title is required']"
              />

              <q-input
                v-model="form.description"
                label="Description"
              />

              <q-input
                v-model="form.dueDate"
                type="datetime-local"
                label="Due Date"
                :rules="[val => !!val || 'Due date is required']"
              />

              <q-select
                v-model="form.frequency"
                :options="['once', 'hourly', 'daily', 'weekly', 'monthly']"
                label="Frequency"
                :rules="[val => !!val || 'Frequency is required']"
              />

              <div>
                <q-btn
                  type="submit"
                  color="primary"
                  :loading="submitting"
                >
                  Create Reminder
                </q-btn>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { format } from 'date-fns';
import { createReminder, deleteReminder, fetchReminders, markCompleted } from 'src/utils/storage';

interface Reminder {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  frequency: 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  completed: boolean;
}

const $q = useQuasar();
const reminders = ref<Reminder[]>([]);
const submitting = ref(false);

const form = ref({
  title: '',
  description: '',
  dueDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  frequency: 'once' as const
});

async function fetchRemindersFront() {
  try {
    const response = await fetchReminders()
    if (Array.isArray(response)) {
      reminders.value = response;
    } else {
      console.error(response)
    }
  } catch (error) {
    console.log(error)
  }
}

async function onSubmit() {
  if (submitting.value) return;
  
  submitting.value = true;
  try {
    const response = createReminder(form.value)
    
    if (!response) throw new Error('Failed to create reminder');
    
    await fetchRemindersFront();
    form.value = {
      title: '',
      description: '',
      dueDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      frequency: 'once'
    };
  } catch (error) {
    console.log(error)
  } finally {
    submitting.value = false;
  }
}

async function markCompletedFront(id: number) {
  try {
    const response = markCompleted(id)
    if (!response) throw new Error('Failed to mark reminder as completed');
    await fetchRemindersFront();
  } catch (error) {
    console.log(error)
    $q.notify({
      type: 'negative',
      message: 'Failed to mark reminder as completed'
    });
  }
}

async function deleteReminderFront(id: number) {
  try {
    const response = deleteReminder(id)
    if (!response.ok) throw new Error('Failed to delete reminder');
    await fetchRemindersFront();
  } catch (error) {
    console.log(error)
  }
}

onMounted(async () => {
  await fetchRemindersFront();
});
</script>
