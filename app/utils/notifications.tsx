import * as Notifications from 'expo-notifications';

export const scheduleNotification = async (title: string, body:string, delaySeconds: number, screen: string) => {

    await Notifications.scheduleNotificationAsync({
        content: {
            title: title,
            body: body,
            data: { screen: screen }, 
        },
        trigger: { seconds: delaySeconds },
    });

}