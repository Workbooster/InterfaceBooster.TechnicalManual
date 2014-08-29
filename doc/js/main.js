
var doc = {};

$(document).ready(function() {
    
    if(String.prototype.trimEnd === undefined) {
        String.prototype.trimEnd = function() {
            return this.replace(/\s+$/g, "");
        };
    }
    
    doc.openPage = function(name) {
        $('#topic').load('pages/' + name +'.html', function(response, status, xhr) {
            if ( status == "error" ) {
                $( "#topic" ).html(xhr.status + " " + xhr.statusText);
                
                return;
            }
            
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
                editor.renderer.$cursorLayer.element.style.opacity=0
            });
    
            $(".imagelink").slimbox();
        });
    }
    
    var router = Router({
        "/?(.*)" : doc.openPage
    });

    router.init();
    if(router.getRoute() == "") {
        router.setRoute(0, "index");
    }
});