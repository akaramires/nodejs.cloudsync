exports.routes = {
    cloudSync    : function (req, res) {
        res.render('cloud/cloudSync', {
            title             : 'Start Sync',
            user              : req.user,
            googleIsConnected : !(req.user.google == undefined || req.user.google.access_token === undefined),
            dropboxIsConnected: !(req.user.dropbox == undefined || req.user.dropbox.oauth_token === undefined)
        });
    },
    googleDropbox: function (req, res) {
        res.render('cloud/googleDropbox', {
            title     : 'Cloud Panel',
            user      : req.user,
            show_title: false,
            panels    : {
                first : {
                    show   : !(req.user.google == undefined || req.user.google.access_token === undefined),
                    title  : 'Google Drive',
                    icon   : 'ico-moon-google-drive',
                    authUrl: '/cloud-sync/google/auth'
                },
                second: {
                    show   : !(req.user.dropbox == undefined || req.user.dropbox.oauth_token === undefined),
                    title  : 'Dropbox',
                    icon   : 'fa fa-dropbox',
                    authUrl: '/cloud-sync/dropbox/auth'
                }
            }
        });
    }
};
