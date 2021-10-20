const log4js = require('log4js'), path = require('path')
log4js.configure({
    replaceConsole: true,
    appenders: {
        stdout: {
            type: 'console'
        },
        info: {
            type: 'dateFile',
            filename: 'logs/app',
            pattern: 'yyyy-MM-dd.log',
            alwaysIncludePattern: true
        },

    },
    categories: {
        default: { appenders: ['info'], level: 'info' }
    }
})

function getLogger(name) {
    return log4js.getLogger(name || 'info')
}

module.exports = {
    getLogger
}