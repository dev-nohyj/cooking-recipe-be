import path from 'path';
import winston from 'winston';
import WinstonDaily from 'winston-daily-rotate-file';

const { combine, timestamp, printf } = winston.format;

const logDir = '../../logs';

const logFormat = combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    printf((info) => {
        return `${info.timestamp} ${info.message}`;
    }),
);

const transports = [
    new WinstonDaily({
        level: 'debug',
        datePattern: 'YYYY-MM-DD',
        dirname: path.join(__dirname, logDir),
        filename: '%DATE%.all.log',
        maxFiles: '7d',
        zippedArchive: true,
    }),
];

export const Logger = winston.createLogger({
    format: logFormat,
    transports,
});
