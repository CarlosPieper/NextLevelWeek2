export default function convertHourToMinutes(time: string) {
    const [hour, minutes] = time.split(':').map(Number);
    const timeInMinutes: number = (hour * 60) + minutes;
    return timeInMinutes;
}