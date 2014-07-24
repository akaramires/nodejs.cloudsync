(function () {
    var GooglePanel = (function () {

        function GooglePanel() {
            this.initVars();
            this.init();
            this.assignEvents();
        }

        GooglePanel.prototype.initVars = function () {
            this.step = 0;
            this.parentIds = [];
            this.parentTitles = {};
            this.transfers = {};

            this.$colWrap = $(".col-wrap");
            this.$colRow = this.$colWrap.find(".col-row");
            this.$colRowToolbar = this.$colWrap.find(".col-row-toolbar");
            this.$colSingleFrom = this.$colRow.find(".col-single.from");
        };

        GooglePanel.prototype.init = function () {
            this.exec({id: 'root'}, false);
//            this.exec({id: '0B482Ywq2Rr2hOEVjQlRuSEs0Nkk'}, false);
        };

        GooglePanel.prototype.assignEvents = function () {
            var self = this;

//            this.$colSingleFrom.on('click', '.todo.file-list li.file', function (e) {
//                $(this).toggleClass('todo-done');
//            });

            this.$colSingleFrom.on('click', '.todo.file-list li.folder', function (e) {
                var data = JSON.parse($(this).find('.json-data').val());
                self.exec(data, $(this));
            });

            this.$colRowToolbar.on('click', '.btn-up-from', function (e) {
                if (self.$colSingleFrom.find('.todo.file-list li.folder').length && self.parentIds.length > 1) {
                    self.parentIds.pop();
                    self.exec({id: self.parentIds[self.parentIds.length - 1]}, false);
                }
            });
        };

        GooglePanel.prototype.exec = function (parent, target) {
            var self = this;

            if (this.parentIds.indexOf(parent.id) < 0) {
                this.parentIds[this.step++] = parent.id;
                if (parent.title != undefined) {
                    this.parentTitles[parent.id] = parent.title;
                } else if (parent.id == 'root') {
                    this.parentTitles[parent.id] = '/';
                }
            }

            if (typeof parent.parents != 'undefined') {
                this.$colRowToolbar.find('.btn-up-from').data('parent-id', parent.parents[0].id);
            }

            $.ajax({
                url       : getAjaxUrl('google', 'get'),
                type      : 'POST',
                data      : {
                    parent: parent
                },
                beforeSend: function () {
                    if (typeof parent.mimeType === 'undefined') {
                        $(".from-loader").show();
                        self.$colSingleFrom.find('.todo.file-list').addClass('show-loader');
                        return true;
                    } else {
                        if (target && parent.mimeType === 'application/vnd.google-apps.folder') {
                            $(".from-loader").show();
                            self.$colSingleFrom.find('.todo.file-list').addClass('show-loader');
                            return true;
                        }
                    }

                    return false;
                },
                complete  : function () {
                    self.$colSingleFrom.find('.todo.file-list').removeClass('show-loader');
                    $(".from-loader").hide();
                },
                success   : function (response) {
                    if (response.status) {
                        self.$colSingleFrom.html(response.html);
                        self.$colSingleFrom.find('.todo-search').html(self.parentTitles[parent.id])
                        window.Common.focus();
                    } else {
                        if (response.msg == 'refresh') {
                            self.$colSingleFrom.html(response.html);
                        }
                    }
                }
            });
        };

        return GooglePanel;

    })();

    var DropboxPanel = (function () {

        function DropboxPanel() {
            this.initVars();
            this.init();
            this.assignEvents();
        }

        DropboxPanel.prototype.initVars = function () {
            this.step = 0;
            this.parentIds = [];
            this.parentTitles = {};
            this.transfers = {};

            this.$colWrap = $(".col-wrap");
            this.$colRow = this.$colWrap.find(".col-row");
            this.$colRowToolbar = this.$colWrap.find(".col-row-toolbar");
            this.$colSingleTo = this.$colRow.find(".col-single.to");
        };

        DropboxPanel.prototype.init = function () {
//            this.exec({path: '/WGEN/Legal'}, false);
            this.exec({id: 'root'}, false);
        };

        DropboxPanel.prototype.assignEvents = function () {
            var self = this;

//            this.$colSingleTo.on('click', '.todo.file-list li.file', function (e) {
//                $(this).toggleClass('todo-done');
//            });

            this.$colSingleTo.on('click', '.todo.file-list li.folder', function (e) {
                var data = JSON.parse($(this).find('.json-data').val());
                self.exec(data, $(this));
            });

            this.$colRowToolbar.on('click', '.btn-up-to', function (e) {
                self.parentIds.pop();
                self.exec({path: self.parentIds[self.parentIds.length - 1]}, false);
            });

            $(document).on('click', '#startTransferToGoogle', function (e) {
                var $btn = $(this);

                $.ajax({
                    url       : getAjaxUrl('google', 'upload'),
                    type      : 'POST',
                    data      : {
                        transfers    : self.transfers,
                        destinationID: window.GooglePanel.parentIds[window.GooglePanel.parentIds.length - 1]
                    },
                    beforeSend: function () {
                        if (Object.size(self.transfers)) {
                            $btn.button('loading');
                            return true;
                        }
                        return false;
                    },
                    complete  : function () {
                        $btn.button('reset');
                    },
                    success   : function (response) {
                        if (response.status) {
                            window.Transfers.clear('google');
                            window.Transfers.clear('dropbox');
                        }
                    }
                });
            });

        };

        DropboxPanel.prototype.exec = function (parent, target) {
            var self = this;
            if (self.parentIds.length == 0) {
                self.parentIds[self.step++] = 'root';
            } else if (self.parentIds.indexOf(parent.path) < 0) {
                self.parentIds[self.step++] = parent.path;
            }

            if (parent.title != undefined) {
                this.parentTitles[parent.path] = parent.title;
            } else if (parent.id == 'root') {
                this.parentTitles[parent.id] = '/';
            }

            $.ajax({
                url       : getAjaxUrl('dropbox', 'get'),
                type      : 'POST',
                data      : {
                    parent: parent
                },
                beforeSend: function () {
                    if (parent.id == "root" || parent.is_dir == true || !target) {
                        $(".to-loader").show();
                        self.$colSingleTo.find('.todo.file-list').addClass('show-loader');
                        return true;
                    }

                    return false;
                },
                complete  : function () {
                    self.$colSingleTo.find('.todo.file-list').removeClass('show-loader');
                    $(".to-loader").hide();
                },
                success   : function (response) {
                    if (response.status) {
                        self.$colSingleTo.html(response.html);
                        self.$colSingleTo.find('.todo-search').html(self.parentTitles[parent.id || parent.path])
                        window.Common.focus();
                    }
                }
            });
        };

        return DropboxPanel;

    })();

    var Transfers = (function () {

        function Transfers() {
        }

        Transfers.prototype.renderModal = function () {
            var toDBoxTransfers = window.GooglePanel.transfers;
            var toDBoxHtml = '';
            if (Object.size(toDBoxTransfers)) {
                for (var key in toDBoxTransfers) {
                    toDBoxHtml += '<li><a>' + toDBoxTransfers[key].title + '<span class="badge pull-right">' + bytesToSize(toDBoxTransfers[key].fileSize) + '</span></a></li>';
                }
            } else {
                toDBoxHtml += '<li class="disabled"><a>Empty</a></li>';
            }
            $('#transfersToDropbox').html(toDBoxHtml);

            var toGDriveTransfers = window.DropboxPanel.transfers;
            var toGDriveHtml = '';
            if (Object.size(toGDriveTransfers)) {
                for (var key in toGDriveTransfers) {
                    toGDriveHtml += '<li><a>' + toGDriveTransfers[key].title + '<span class="badge pull-right">' + toGDriveTransfers[key].size + '</span></a></li>';
                }
            } else {
                toGDriveHtml += '<li class="disabled"><a>Empty</a></li>';
            }
            $('#transfersToGoogle').html(toGDriveHtml);

            $(".pendingTransfers #countTransfers").html((Object.size(toDBoxTransfers) + Object.size(toGDriveTransfers)));
        };

        Transfers.prototype.clear = function (type) {
            var winGoogle = window.GooglePanel;
            var winDropbox = window.DropboxPanel;

            if (type == 'google') {
                winGoogle.transfers = {};
                $('#transfersToGoogle').html('<li class="disabled"><a>Empty</a></li>');
                $(".pendingTransfers #countTransfers").html(Object.size(winGoogle.transfers) + Object.size(winDropbox.transfers));
                winGoogle.exec({id: winGoogle.parentIds[winGoogle.parentIds.length - 1]}, false);
            }

            if (type == 'dropbox') {
                winDropbox.transfers = {};
                $('#transfersToGoogle').html('<li class="disabled"><a>Empty</a></li>');
                $(".pendingTransfers #countTransfers").html(Object.size(winGoogle.transfers) + Object.size(winDropbox.transfers));
                winDropbox.exec({path: winDropbox.parentIds[winDropbox.parentIds.length - 1]}, false);
            }

            $('#pendingTransfers').modal('hide');
        };

        return Transfers;

    })();

    var KeyCodeEvents = (function () {

        function KeyCodeEvents() {
            this.current = $('body').find('.file-list li.current-file-focus');
        }

        KeyCodeEvents.prototype.up = function () {
            if (this.current.prev('li').length) {
                this.current.removeClass('current-file-focus');
                this.current.prev('li').addClass('current-file-focus');
            }
        };

        KeyCodeEvents.prototype.down = function () {
            if (this.current.next('li').length) {
                this.current.removeClass('current-file-focus');
                this.current.next('li').addClass('current-file-focus');
            }
        };

        KeyCodeEvents.prototype.tab = function () {
            var directions = { from: 'to', to: 'from' };
            var currentDirection = this.current.closest('.col-single').attr('data-direction');

            this.current.removeClass('current-file-focus');
            $('body').find('.col-single.' + directions[currentDirection] + ' .file-list li:eq(0)').addClass('current-file-focus');
        };

        KeyCodeEvents.prototype.enter = function () {
            if (this.current.hasClass('folder')) {
                this.current.trigger('click');
            }
        };

        KeyCodeEvents.prototype.back = function () {
            var currentDirection = this.current.closest('.col-single').attr('data-direction');

            $('body').find('.btn.btn-link.btn-up-' + currentDirection).trigger('click');
        };

        return KeyCodeEvents;

    })();

    var Common = (function () {

        function Common() {

        }

        Common.prototype.checkType = function () {
            if ($('body').find('.file-list li.current-file-focus').hasClass('folder')) {
                $('#startSync').attr('disabled', true);
            } else {
                $('#startSync').attr('disabled', false)
            }
        };

        Common.prototype.focus = function () {
            var self = this;

            $('body').find('.file-list li').removeClass('current-file-focus');
            $('body').find('.file-list li:eq(0)').addClass('current-file-focus');

            if (window.manInit) {
                return;
            } else {
                window.manInit = true;
                this.checkType();
            }

            $('body').on('click', '.todo.file-list li.file', function (e) {
                $('.todo.file-list li').removeClass('current-file-focus');
                $(this).addClass('current-file-focus');
            });

            $(document).on('keydown', function (e) {
                window.KeyCodeEvents = new KeyCodeEvents;
                var KeyCodeAction = window.KeyCodeEvents;

                if (e.which == 38) {
                    e.preventDefault();
                    KeyCodeAction.up();
                }

                if (e.which == 40) {
                    e.preventDefault();
                    KeyCodeAction.down();
                }

                if (e.which == 9) {
                    e.preventDefault();
                    KeyCodeAction.tab();
                }

                if (e.which == 13) {
                    e.preventDefault();
                    KeyCodeAction.enter();
                }

                if (e.which == 8) {
                    e.preventDefault();
                    KeyCodeAction.back();
                }

                self.checkType();
            });
        };

        return Common;

    })();

    function getAjaxUrl(type, route) {
        return '/cloud-sync/' + type + '/' + route;
    }

    $(function () {
        window.GooglePanel = new GooglePanel;
        window.DropboxPanel = new DropboxPanel;
        window.Transfers = new Transfers;

        window.manInit = false;
        window.Common = new Common;
    });

}).call(this);

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

