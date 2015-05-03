
var doc = {};

$(document).ready(function () {

    var currentPage = "";
    var currentUrl = "";

    $(document).ajaxStop(function () {

        // mark active links as selected

        $('a').each(function (index, item) {
            var jqItem = $(item);
            var href = jqItem.attr("href");

            if (href == currentUrl) {
                jqItem.addClass("selected");
            } else {
                jqItem.removeClass("selected");
            }
        });

        // replace textareas marked with a "data-editor" attribute with a readonly "ace" texteditor

        $('textarea[data-editor]').each(function () {
            var textarea = $(this);

            var mode = textarea.data('editor');

            var editDiv = $('<div>', {
                position: 'absolute',
                width: textarea.width(),

                'class': textarea.attr('class')
            }).insertBefore(textarea);

            textarea.css('visibility', 'hidden');
            textarea.css('display', 'none');
            textarea.css('position', 'absolute');
            textarea.css('width', '0px');
            textarea.css('height', '0px');

            var editor = ace.edit(editDiv[0]);
            editor.getSession().setValue(textarea.val().trimEnd());
            editor.getSession().setMode("ace/mode/" + mode);
            editor.setOptions({
                theme: "ace/theme/textmate",
                readOnly: true,
                showPrintMargin: false,
                highlightActiveLine: false,
                highlightGutterLine: false,
                showGutter: true,
                scrollPastEnd: false,
                maxLines: Infinity,
            });

            // hide the cursor
            editor.renderer.$cursorLayer.element.style.opacity = 0
        });

        // register all elements with the class "imagelink" for a slimbox image preview

        $(".imagelink").slimbox();
    });

    if (String.prototype.trimEnd === undefined) {
        String.prototype.trimEnd = function () {
            return this.replace(/\s+$/g, "");
        };
    }

    doc.openPage = function (name) {

        // store the current page name and URL
        currentPage = name;
        currentUrl = "#/" + name;

        // load page content according to the given URL

        $('#topic').load('pages/' + name + '.html', function (response, status, xhr) {
            if (status == "error") {
                $('#topic').load('pages/404.html');

                return;
            }

            // load include pages accroding to the "data-include" attribute(s)

            $('div[data-include]').each(function (index, item) {
                var includeName = $(item).data("include");

                $(item).load('pages/' + includeName + '.html', function (includeResponse, includeStatus, includeXhr) {
                    if (includeStatus == "error") {
                        $(item).html(includeXhr.status + " " + includeXhr.statusText);

                        return;
                    }
                });
            });
        });
    }

    doc.goBack = function () {
        window.history.back();
    }

    var router = Router({
        "/?(.*)": doc.openPage
    });

    router.init();
    if (router.getRoute() == "") {
        router.setRoute(0, "index");
    }
});