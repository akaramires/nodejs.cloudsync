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
//            this.exec({id: 'root'}, false);
            this.exec({id: '0B482Ywq2Rr2hOEVjQlRuSEs0Nkk'}, false);
        };

        GooglePanel.prototype.assignEvents = function () {
            var self = this;

            this.$colSingleFrom.on('click', '.todo.file-list li.file', function (e) {
                var fileObj = JSON.parse($(this).find('.json-data').val());
                var $checkBox = $(this).find('.checked.hide');
                $checkBox.prop("checked", !$checkBox.prop("checked"));

                if ($checkBox.prop("checked")) {
                    $(this).addClass('todo-done');
                    self.transfers[fileObj.id] = fileObj;
                } else {
                    $(this).removeClass('todo-done');
                    delete self.transfers[fileObj.id];
                }

                window.Transfers.renderModal();
            });

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
                url       : getAjaxUrl('google'),
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
                    } else {
                        if (response.msg == 'refresh') {
                            window.location = '/cloud-sync/google/refresh'
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
            this.exec({path: '/WGEN/Legal'}, false);
//            this.exec({id: 'root'}, false);
        };

        DropboxPanel.prototype.assignEvents = function () {
            var self = this;

            this.$colSingleTo.on('click', '.todo.file-list li.file', function (e) {
                var fileObj = JSON.parse($(this).find('.json-data').val());
                console.log(fileObj);
                var $checkBox = $(this).find('.checked.hide');
                $checkBox.prop("checked", !$checkBox.prop("checked"));

                if ($checkBox.prop("checked")) {
                    $(this).addClass('todo-done');
                    self.transfers[fileObj.path] = fileObj;
                } else {
                    $(this).removeClass('todo-done');
                    delete self.transfers[fileObj.path];
                }

                window.Transfers.renderModal();
            });

            this.$colSingleTo.on('click', '.todo.file-list li.folder', function (e) {
                var data = JSON.parse($(this).find('.json-data').val());
                self.exec(data, $(this));
            });

            this.$colRowToolbar.on('click', '.btn-up-to', function (e) {
                self.parentIds.pop();
                self.exec({path: self.parentIds[self.parentIds.length - 1]}, false);
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
                url       : getAjaxUrl('dropbox'),
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
            for (var key in toDBoxTransfers) {
                toDBoxHtml += '<li><a>' + toDBoxTransfers[key].title + '<span class="badge pull-right">' + bytesToSize(toDBoxTransfers[key].fileSize) + '</span></a></li>';
            }
            $('#transfersToDropbox').html(toDBoxHtml);

            var toGDriveTransfers = window.DropboxPanel.transfers;
            var toGDriveHtml = '';
            for (var key in toGDriveTransfers) {
                toGDriveHtml += '<li><a>' + toGDriveTransfers[key].title + '<span class="badge pull-right">' + bytesToSize(toGDriveTransfers[key].fileSize) + '</span></a></li>';
            }
            $('#transfersToDropbox').html(toGDriveHtml);
        };

        return Transfers;

    })();

    function bytesToSize(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    };

    function getAjaxUrl(type) {
        return '/cloud-sync/' + type + '/get';
    }

    $(function () {
        window.GooglePanel = new GooglePanel;
        window.DropboxPanel = new DropboxPanel;
        window.Transfers = new Transfers;
    });

}).call(this);