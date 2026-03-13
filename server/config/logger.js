const winston = require('winston');

const isProduction = process.env.NODE_ENV === 'production';

// ===========================================
// Custom Format
// ===========================================
const structuredFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ'}),
    winston.format.errors({ stack: true }),
    winston.format((info) => {
        if (info.stack) {
            info.stackTrace = info.stack;
            delete info.stack;
        }

        return info;
    })(),
    winston.format.json()
);

// ===========================================
// Transports
// ===========================================
const transports = [];
if (isProduction) {
    transports.push(
        new winston.transports.Console({
            format: structuredFormat
        })
    );
} else {
    // Development: colorized human-readable console output
    transports.push(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp({ format: 'HH:mm:ss'}),
                winston.format.printf(({ timestamp, level, message, ...meta}) => {
                    const metaStr = Object.keys(meta).length
                        ? '\n ' + JSON.stringify(meta, null, 2).replace(/\n/g, '\n ')
                        : '';
                    
                    return `${timestamp} ${level}: ${message}${metaStr}`;
                })
            ),
        })
    );

    // Also write to files in dev for later review
    transports.push(
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: structuredFormat,
            maxsize: 5 * 1024 * 1024, // 5 MB per file
            maxFiles: 3,
        }),
        new winston.transports.File({
            filename: 'logs/combined.log',
            format: structuredFormat,
            maxsize: 5 * 1024 * 1024,
            maxFiles: 5
        })
    );
}


// ===========================================
// Logger Instance
// ===========================================
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
    defaultMeta: { service: 'jeopardy-api'},
    transports,
    exitOnError: false
});

// ===========================================
// Child Logger
// ===========================================
logger.forModule = (moduleName) => {
    return logger.child({ module: moduleName });
};

module.exports = logger;