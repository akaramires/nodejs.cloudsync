(function ($, undefined) {
    $(document).ready(function () {
        $('.image-preview-clear').click(function () {
            $('.image-preview-filename').val("");
            $('.image-preview-clear').hide();
            $('.image-preview-input input:file').val("");
        });
    });

    $(function () {
        $(".image-preview-input input:file").change(function () {
            var file = this.files[0];
            var reader = new FileReader();
            reader.onload = function (e) {
                $(".image-preview-clear").show();
                $(".image-preview-filename").val(file.name);
            }
            reader.readAsDataURL(file);
        });
    });
})(window.jQuery);