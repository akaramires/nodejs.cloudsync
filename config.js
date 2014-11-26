module.exports = {
    site    : {
        title      : 'CloudSync!',
        development: {
            host         : '127.0.0.1',
            baseUrl      : 'http://127.0.0.1:3030/',
            port         : 3030,
            cookieSecret : '8mjwB7nPhfHILeeQFkjzu1Nl91KdD7kxsxLDfStc',
            sessionSecret: 'bxWEV7W126v9DlFJQrLSc60gqx8i3apNGDkYLKSf',
            ga_file      : 'ga.local.js',
            mongoose     : {
                server: 'localhost',
                port  : 27017,
                url   : 'mongodb://localhost/cloudsync'
            }
        },
        production : {
            host         : 'localhost',
            baseUrl      : 'http://localhost:3000/',
            port         : 3000,
            cookieSecret : 'kPKFeqhemadOfq46jPg0O9FkUDH03ITLvcufHxgC',
            sessionSecret: 'VnLxoGqMzGczxW6WdeURX9DaiKAYw33sPivgBpGC',
            ga_file      : 'ga.eatech.js',
            mongoose     : {
                server: 'localhost',
                port  : 27017,
                url   : 'mongodb://localhost/cloudsync'
            }
        },
        openshift  : {
            host         : 'cloudsync-eatech.rhcloud.com',
            baseUrl      : 'http://cloudsync-eatech.rhcloud.com/',
            port         : 8080,
            cookieSecret : 'kPKFeqhemadOfq46jPg0O9FkUDH03ITLvcufHxgC',
            sessionSecret: 'VnLxoGqMzGczxW6WdeURX9DaiKAYw33sPivgBpGC',
            ga_file      : 'ga.openshift.js',
            mongoose     : {
                server: 'localhost',
                port  : process.env.OPENSHIFT_MONGODB_DB_PORT,
                url   : 'mongodb://admin:adJcjKx5-CGb@' + process.env.OPENSHIFT_MONGODB_DB_HOST + ':' + process.env.OPENSHIFT_MONGODB_DB_PORT + '/cloudsync'
            }
        }
    },
    cloud   : {
        list       : ['google', 'dropbox'],
        development: {
            google : {
                CLIENT_ID    : '296847072410-6ni07djkcfk86dhme9caq234v5jlhiev.apps.googleusercontent.com',
                CLIENT_EMAIL : '296847072410-6ni07djkcfk86dhme9caq234v5jlhiev@developer.gserviceaccount.com',
                CLIENT_SECRET: 'xrpf-cbRGQXparnCtqBodqb2',
                REDIRECT_URL : 'http://127.0.0.1:3030/cloud-sync/google/callback',
                SCOPE        : 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.apps.readonly',
                ACCESS_TYPE  : 'offline'
            },
            dropbox: {
                CLIENT_ID    : 'fyhqvv1fi7fwnvu',
                CLIENT_SECRET: '28ksoittt4xji34',
                AUTH_URL     : 'https://www.dropbox.com/1/oauth/authorize',
                ACCESS_TOKEN : 'ZAJq0ux5k_gAAAAAAAAERI1UkDeWBRSDmNg3gRQkwV96IBHFeIAZgkMXRgAqTFL9',
                REDIRECT_URL : 'http://127.0.0.1:3030/cloud-sync/dropbox/callback',
                ROOT         : 'dropbox'
            }
        },
        production : {
            google : {
                CLIENT_ID    : '711075498703-mqr30ksshhkfifd6e71cecv8hsf2rkim.apps.googleusercontent.com',
                CLIENT_EMAIL : '711075498703-mqr30ksshhkfifd6e71cecv8hsf2rkim@developer.gserviceaccount.com',
                CLIENT_SECRET: 'ZIh14Ss2rRmGqalqk-KMDNlo',
                REDIRECT_URL : 'http://cloudsync.eatech.org/cloud-sync/google/callback',
                SCOPE        : 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.apps.readonly',
                ACCESS_TYPE  : 'offline'
            },
            dropbox: {
                CLIENT_ID    : '5i0pekac70z08rz',
                CLIENT_SECRET: 'i06e1fgit8jfmkx',
                AUTH_URL     : 'https://www.dropbox.com/1/oauth/authorize',
                ACCESS_TOKEN : 'ZAJq0ux5k_gAAAAAAAAERI1UkDeWBRSDmNg3gRQkwV96IBHFeIAZgkMXRgAqTFL9',
                REDIRECT_URL : 'http://cloudsync.eatech.org/cloud-sync/dropbox/callback',
                ROOT         : 'dropbox'
            }
        },
        openshift  : {
            google : {
                CLIENT_ID    : '205864361842-kac7ptg5spp8199sm7v7geu5qioh9p9h.apps.googleusercontent.com',
                CLIENT_EMAIL : '205864361842-kac7ptg5spp8199sm7v7geu5qioh9p9h@developer.gserviceaccount.com',
                CLIENT_SECRET: 'GaKZ6G-rQKd_3yr_n1_1ClRN',
                REDIRECT_URL : 'http://cloudsync-eatech.rhcloud.com/cloud-sync/google/callback',
                SCOPE        : 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.apps.readonly',
                ACCESS_TYPE  : 'offline'
            },
            dropbox: {
                CLIENT_ID    : 'b9p3b0wkf3hnm56',
                CLIENT_SECRET: 'zgizf669b74613v',
                AUTH_URL     : 'https://www.dropbox.com/1/oauth/authorize',
                ACCESS_TOKEN : 'ZAJq0ux5k_gAAAAAAAAERI1UkDeWBRSDmNg3gRQkwV96IBHFeIAZgkMXRgAqTFL9',
                REDIRECT_URL : 'http://cloudsync-eatech.rhcloud.com/cloud-sync/dropbox/callback',
                ROOT         : 'dropbox'
            }
        }
    },
    stripe  : {
        test: {
            secret : 'sk_test_OcgQfW6kmGJFaXgd1RkAVdUn',
            publish: 'pk_test_icZYFKZKPOmxsbtPHpbvvC68'
        },
        live: {
            secret : 'sk_live_myysHtVhwCWgQefW7P9veeQq',
            publish: 'pk_live_0E4ioodeLqCiuUB2fc8UnCek'
        }
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
