var HOST = 'http://127.0.0.1';

module.exports = {
    mongoose: {
        server: 'localhost',
        port  : 27017,
        url   : 'mongodb://localhost/cloudsync'
    },
    site    : {
        baseUrl      : HOST + ':3030/',
        port         : 3030,
        cookieSecret : '8mjwB7nPhfHILeeQFkjzu1Nl91KdD7kxsxLDfStc',
        sessionSecret: 'bxWEV7W126v9DlFJQrLSc60gqx8i3apNGDkYLKSf'
    },
    cloud   : {
        list   : ['google', 'dropbox'],
        google : {
            CLIENT_ID    : '296847072410-6ni07djkcfk86dhme9caq234v5jlhiev.apps.googleusercontent.com',
            CLIENT_EMAIL : '296847072410-6ni07djkcfk86dhme9caq234v5jlhiev@developer.gserviceaccount.com',
            CLIENT_SECRET: 'xrpf-cbRGQXparnCtqBodqb2',
            REDIRECT_URL : HOST + ':3030/cloud-sync/google/callback',
            SCOPE        : 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.apps.readonly',
            ACCESS_TYPE  : 'offline'
        },
        dropbox: {
            CLIENT_ID    : 'fyhqvv1fi7fwnvu',
            CLIENT_SECRET: '28ksoittt4xji34',
            AUTH_URL     : 'https://www.dropbox.com/1/oauth/authorize',
            ACCESS_TOKEN : 'ZAJq0ux5k_gAAAAAAAAERI1UkDeWBRSDmNg3gRQkwV96IBHFeIAZgkMXRgAqTFL9',
            REDIRECT_URL : HOST + ':3030/cloud-sync/dropbox/callback',
            ROOT         : 'dropbox'
        }
    },
    mailgun : {
        API_KEY: 'key-7ybbqsjaigqazwh50qipnix4vcswrz44'
    },
    options : {
        contactEmails: ['e.abdurayimov@gmail.com']
    }
};
