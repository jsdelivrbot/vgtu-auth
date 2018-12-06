module.exports = {
   logger: {
      colours: {
         debug: 'white',
         info: 'green',
         notice: 'blue',
         warning: 'yellow',
         error: 'yellow',
         crit: 'red',
         alert: 'red',
         emerg: 'red'
      },
      // Syslog compatible protocol severities.
      levels: {
         debug: 0,
         info: 1,
         notice: 2,
         warning: 3,
         error: 4,
         crit: 5,
         alert: 6,
         emerg: 7
      },
      consoleTransportOptions: {
         //level: 'debug',
         handleExceptions: true,
         json: false,
         timestamp: true,
         colorize: true
      },
      fileTransportOptions: {
         //level: 'debug',
         filename: './auth-vgtu.log',
         handleExceptions: true,
         timestamp: true,
         json: true,
         maxsize: 5242880, //5MB
         maxFiles: 5,
         colorize: false
      },
      syslogPosixTransportOptions: {
         handleExceptions: true,
         //level: 'debug',
         identity: 'yourapp_winston',
         facility: 'local0' // default
            // /etc/rsyslog.conf also needs: local0.* /var/log/yourapp.log
            // If non posix syslog is used, then /etc/rsyslog.conf or one
            // of the files in /etc/rsyslog.d/ also needs the following
            // two settings:
            // $ModLoad imudp // Load the udp module.
            // $UDPServerRun 514 // Open the standard syslog port.
            // $UDPServerAddress 127.0.0.1 // Interface to bind to.
      },
      emailTransportOptions: {
         handleExceptions: true,
         level: 'alert',
         from: 'superAuthSystem@vgtu.lt',
         to: 'lo@epitech.eu',
         service: 'Gmail',
         auth: {
            user: "oqsdxdeadbeef123@gmail.com",
            pass: 'deadqsdbeef' // App specific password.
         },
         tags: ['VGTU AUTH']
      }
   }
}
