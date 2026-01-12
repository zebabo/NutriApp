import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { MOTIVATIONAL_QUOTES } from '../../data/quotes';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureChannelExists() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Geral',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#32CD32',
      sound: 'default',
    });
  }
}

export const registerForPushNotificationsAsync = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  await ensureChannelExists();
  return status;
};

// --- AGENDAR ÁGUA ---
export const scheduleWaterReminder = async (hours = 2) => {
  await ensureChannelExists();
  // No Android, para trocar o intervalo, o ideal é cancelar o anterior
  await Notifications.cancelScheduledNotificationAsync('water_reminder'); 
  
  const secondsTrigger = hours * 3600;
  await Notifications.scheduleNotificationAsync({
    identifier: 'water_reminder',
    content: {
      title: "Hora de beber água! 💧",
      body: "Mantém o teu metabolismo ativo. Bebe um copo agora.",
      sound: true,
      android: { channelId: 'default' }
    },
    trigger: { 
      type: 'timeInterval',
      seconds: secondsTrigger, 
      repeats: true 
    },
  });
};

// --- AGENDAR MOTIVAÇÃO (PRODUÇÃO - 09:00) ---
export const scheduleDailyQuote = async () => {
  await ensureChannelExists();
  // Garante que não há agendamentos duplicados
  await Notifications.cancelScheduledNotificationAsync('daily_quote');

  const phrase = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  
  await Notifications.scheduleNotificationAsync({
    identifier: 'daily_quote',
    content: {
      title: "Motivação do Dia! ✨",
      body: phrase,
      sound: true,
      android: { channelId: 'default' }
    },
    trigger: {
      type: 'daily',
      hour: 9,
      minute: 0,
    },
  });
};

export const cancelNotification = async (id) => {
  await Notifications.cancelScheduledNotificationAsync(id);
};