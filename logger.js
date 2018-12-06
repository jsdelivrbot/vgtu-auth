var winston = require('winston');
var loggerConfig = require('config').logger;
require('winston-syslog-posix').SyslogPosix;
require('winston-email').Email;
 
winston.emitErrs = true;
 


var logger = new winston.Logger({
   // Alternatively: set to winston.config.syslog.levels
   exitOnError: false,
   // Alternatively use winston.addColors(customColours); There are many ways
   // to do the same thing with winston
   colors: loggerConfig.colours,
   levels: loggerConfig.levels
});
 
// Add transports. There are plenty of options provided and you can add your own.
 
logger.addConsole = function(config) {
   logger.add (winston.transports.Console, config);
   return this;
};
 
logger.addFile = function(config) {
   logger.add (winston.transports.File, config);
   return this;
};
 
logger.addPosixSyslog = function(config) {
   logger.add (winston.transports.SyslogPosix, config);
   return this;
};
 
logger.addEmail = function(config) {
   logger.add (winston.transports.Email, config);
   return this;
};
 
logger.emailLoggerFailure = function (err /*level, msg, meta*/) {
   // If called with an error, then only the err param is supplied.
   // If not called with an error, level, msg and meta are supplied.
   if (err) logger.alert(
      JSON.stringify(
         'error-code:' + err.code + '. '
         + 'error-message:' + err.message + '. '
         + 'error-response:' + err.response + '. logger-level:'
         + err.transport.level + '. transport:' + err.transport.name
      )
   );
};
 
logger.init = function () {
   if (loggerConfig.fileTransportOptions)
      logger.addFile( loggerConfig.fileTransportOptions );
   if (loggerConfig.consoleTransportOptions)
      logger.addConsole( loggerConfig.consoleTransportOptions );
   if (loggerConfig.syslogPosixTransportOptions)
      logger.addPosixSyslog( loggerConfig.syslogPosixTransportOptions );
   if (loggerConfig.emailTransportOptions)
      logger.addEmail( loggerConfig.emailTransportOptions );
};

module.exports = logger;
module.exports.stream = {
   write: function (message, encoding) {
      logger.info(message);
   }
};
