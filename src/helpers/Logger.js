'use strict';

import winston from 'winston';

const logger = winston.createLogger({
    level: 'verbose',
    transports: [
        new winston.transports.File({ filename: 'winston.log' })
    ]
});

export default class Logger {
    static log(level, message) {
        logger.log(level, message);
    }
}