

var autocomplete = {
    maxOptions: 5,
    started: false,
    suppressKeyPress, suppressKeyPressRepeat, suppressInput		
};

autocomplete.start = function () {
    if (autocomplete.started) return;
    autocomplete.started = true;
    var html = "";
    var i;
    for(i=0;i<autocomplete.maxOptions;i++) {
        html += '<div id="auto-' + i + '" class="auto">Test line ' + i + '</div>';
    }
    $("#autocomplete").html(html).hide();
    $("#custom").keyrpress(function (key) {

    });
}

autocomplete.populate = function (suggestions) {
    autocomplete.start();
    if (!suggestions || suggestions.length == 0) {
        $("#autocomplete").hide();
        return;
    }
    $(".auto").hide();
    var i;
    for (i = 0; i < suggestions.length; i++) {
        var el = $("#auto-" + i);
        if (el.length == 0) break;
        el.show();
        el.html(suggestions[i]);
    }
    $("#autocomplete").show();
}

