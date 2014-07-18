(function ($, undefined) {
    $(document).ready(function () {
        activeMenu();
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

})(window.jQuery);