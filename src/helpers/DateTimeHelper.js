'use strict';

export default class DateTimeHelper {
    static timeUntil(futureDate) {
        return DateTimeHelper.niceCountdown(futureDate - new Date());
    }

    static timeSince(pastDate) {
        return DateTimeHelper.niceCountdown(new Date() - pastDate);
    }

    static relativeTimeString(date) {
        if (date > new Date()) {
            return DateTimeHelper.timeUntil(date);
        } else {
            return `${DateTimeHelper.timeSince(date)} ago`;
        }
    }

    static skillLength(startDate, endDate) {
        startDate = new Date(startDate);
        endDate = new Date(endDate);

        if (startDate < new Date()) {
            startDate = new Date();
        }

        const msDelta = Math.abs(endDate - startDate);

        return DateTimeHelper.niceCountdown(msDelta);
    }

    static niceCountdown(millisecondsRemaining) {
        let delta = millisecondsRemaining / 1000;

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