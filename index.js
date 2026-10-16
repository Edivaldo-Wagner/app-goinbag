// index.js
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';

async function createChannel() {
  await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });
}

// Handler quando o app está em background ou killed
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log("Mensagem background:", remoteMessage);

  // Se o sistema já forneceu `notification`, pule para não duplicar
  if (remoteMessage.notification) {
    console.log('Notificação já mostrada pelo sistema. Ignorando display customizado.');
    return;
  }

  await createChannel();

  await notifee.displayNotification({
    title: remoteMessage.notification?.title || remoteMessage.data?.title,
    body: remoteMessage.notification?.body || remoteMessage.data?.body,
    android: {
      channelId: 'default',
      importance: AndroidImportance.HIGH,
      pressAction: { id: 'default' },
    },
  });
});

AppRegistry.registerComponent(appName, () => App);