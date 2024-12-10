import * as Notifications from 'expo-notifications';

// Function to schedule a notification
export const callNotification = async (title: string, body: string, delaySeconds: number, screen: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      data: { screen: screen },
      categoryIdentifier: 'CALL_ACTIONS', 
    },
    trigger: { seconds: delaySeconds },
  });
};

// Define the actions for the notification
export const registerNotificationActions = async () => {
  await Notifications.setNotificationCategoryAsync('CALL_ACTIONS', [
    {
      identifier: 'ANSWER_CALL',
      buttonTitle: 'Answer',
      options: { opensAppToForeground: true }, 
    },
    {
      identifier: 'DECLINE_CALL',
      buttonTitle: 'Decline',
      options: { opensAppToForeground: false }, 
    },
  ]);
};
