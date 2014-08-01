(function ($, undefined) {
    $(document).ready(function () {
        activeMenu();
    });

    $(document).ajaxStop(function () {
        showNoties();
    });

    window.onhashchange = function () {
        activeMenu();
    };

    function activeMenu() {
        $(".navbar-fixed-top .navbar-right li").removeClass('active').each(function (index) {
            if (window.location.pathname.indexOf($(this).find('> a').attr('href')) > -1 || $(this).find('> a').attr("href") == location.hash) {
                $(this).addClass('active');
            }
        });
    }

    function showNoties() {
        $('.msg-flash').each(function (index) {
            showNoty($(this).html(), $(this).attr('data-type'));
        });
    }

})(window.jQuery);

function showNoty(content, type) {
    noty({
        text     : content,
        type     : type,
        layout   : 'topRight',
        theme    : 'noty-flat-theme',
        timeout  : 5000,
        closeWith: [
            'click'
        ]
    });
}

function getSocket() {
    return io.connect('http://localhost');
}
