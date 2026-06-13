export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function sendNotification(title: string, body: string): void {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/paw.svg' });
  }
}

export function scheduleReminder(
  time: string,
  days: number[],
  title: string,
  body: string,
): (() => void) {
  const [h, m] = time.split(':').map(Number);
  let timerId: ReturnType<typeof setTimeout>;

  function schedule() {
    const now = new Date();
    const next = new Date();
    next.setHours(h, m, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);

    const ms = next.getTime() - now.getTime();
    timerId = setTimeout(() => {
      const day = new Date().getDay();
      if (days.length === 0 || days.includes(day)) {
        sendNotification(title, body);
      }
      schedule();
    }, ms);
  }

  schedule();
  return () => clearTimeout(timerId);
}
