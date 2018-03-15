'use strict';

export default class DateTimeHelper {
    static timeUntil(futureDate) {
        let delta = Math.abs(futureDate - new Date()) / 1000;
        const days = Math.floor(delta / 86400);
        delta -= days * 86400;
        const hours = Math.floor(delta / 3600) % 24;
        delta -= hours * 3600;
        const minutes = Math.floor(delta / 60) % 60;
        delta -= minutes * 60;
        const seconds = Math.floor(delta % 60);

        let string = "";
        if (days > 0) {
            string += days + 'd ';
        }
        if (hours > 0) {
            string += hours + 'h ';
        }
        if (minutes > 0) {
            string += minutes + 'm ';
        }
        if (seconds > 0) {
            string += seconds + 's ';
        }

        return string;
    }
}