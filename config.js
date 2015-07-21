module.exports = {
    site    : {
        title      : 'CloudSync!',
        development: {},
        production : {},
        heroku     : {
            host         : 'cloudsync.herokuapp.com',
            baseUrl      : 'https://cloudsync.herokuapp.com/',
            port         : 5000,
            cookieSecret : 'kPKFeqhemadOfq46jPg0O9FkUDH03ITLvcufHxgC',
            sessionSecret: 'VnLxoGqMzGczxW6WdeURX9DaiKAYw33sPivgBpGC',
            ga_file      : 'ga.openshift.js',
            mongoose     : {
                server: 'ds055742.mongolab.com',
                port  : 55742,
                url   : 'mongodb://cloudsync:cloudsync@ds055742.mongolab.com:55742/heroku_m1nnnt0t'
            }
        }
    },
    cloud   : {
        list       : ['google', 'dropbox'],
        development: {},
        production : {},
        heroku     : {
            google : {
                CLIENT_ID    : '205864361842-kac7ptg5spp8199sm7v7geu5qioh9p9h.apps.googleusercontent.com',
                CLIENT_EMAIL : '205864361842-kac7ptg5spp8199sm7v7geu5qioh9p9h@developer.gserviceaccount.com',
                CLIENT_SECRET: 'GaKZ6G-rQKd_3yr_n1_1ClRN',
                REDIRECT_URL : 'https://cloudsync.herokuapp.com/cloud-sync/google/callback',
                SCOPE        : 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.apps.readonly',
                ACCESS_TYPE  : 'offline'
            },
            dropbox: {
                CLIENT_ID    : 'b9p3b0wkf3hnm56',
                CLIENT_SECRET: 'zgizf669b74613v',
                AUTH_URL     : 'https://www.dropbox.com/1/oauth/authorize',
                ACCESS_TOKEN : 'ZAJq0ux5k_gAAAAAAAAIYo9uywojXQDTus1GVuifHe5EqswX4Ahr6IJCgyUmjHsn',
                REDIRECT_URL : 'https://cloudsync.herokuapp.com/cloud-sync/dropbox/callback',
                ROOT         : 'dropbox'
            }
        }
    },
    stripe  : {
        test: {},
        live: {}
    },
    mailgun : {
        API_KEY: 'key-7ybbqsjaigqazwh50qipnix4vcswrz44'
    },
    options : {
        contactEmails: ['e.abdurayimov@gmail.com']
    },
    settings: {
        officeMimeTypes: [
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
            "application/vnd.ms-word.document.macroEnabled.12",
            "application/vnd.ms-word.template.macroEnabled.12",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
            "application/vnd.ms-excel.sheet.macroEnabled.12",
            "application/vnd.ms-excel.template.macroEnabled.12",
            "application/vnd.ms-excel.addin.macroEnabled.12",
            "application/vnd.ms-excel.sheet.binary.macroEnabled.12",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/vnd.openxmlformats-officedocument.presentationml.template",
            "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
            "application/vnd.ms-powerpoint.addin.macroEnabled.12",
            "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
            "application/vnd.ms-powerpoint.template.macroEnabled.12",
            "application/vnd.ms-powerpoint.slideshow.macroEnabled.12"
        ]
    }
};

/*"dbox"                   : "git://github.com/christiangenco/node-dbox.git",*/
