import * as Notifications from 'expo-notifications';

export const scheduleNotification = async (title: string, body:string, delaySeconds = 1) => {

    await Notifications.scheduleNotificationAsync({
        content: {
            title: title,
            body: body,
        },
        trigger: { seconds: delaySeconds },
    });

}