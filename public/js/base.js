(function ($, undefined) {
    $(document).ready(function () {
        activeMenu();
        showNoties();
        initPlanSlider();
    });

    $(document).ajaxStop(function () {
        showNoties();
    });

    window.onhashchange = function () {
        activeMenu();
    };

    function initPlanSlider() {
        var $slider = $('#planSlider');

        if ($slider.length > 0) {
            $slider.slider({
                value: 0,
                min  : 0,
                max  : 2,
                step : 1,
                slide: function (event, ui) {
                    var $handle = $slider.find('.ui-slider-handle');

                    switch (ui.value) {
                        case 0:
                            $handle.css('background-color', '#18bc9c');
                            break;
                        case 1:
                            $handle.css('background-color', '#2c3e50');
                            break;
                        case 2:
                            $handle.css('background-color', '#f39c12');
                            break;
                    }

//                    if (ui.value == ['free': 0, 'silver', 'gold'][]) {
//                        return false;
//                    }
                }
            });
        }
    }

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
