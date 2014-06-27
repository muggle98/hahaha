minutes = function(t){
    return ("0" + Math.floor(t / 60000) % 60).slice(-2);
}

var escapeQuotes = function (s) {
    return s.replace(/'/g, "&#39;").replace(/"/g, "&#34;");
}


seconds = function (t) {
    return ("0" + Math.floor(t / 1000) % 60).slice(-2);
}

hours = function(t){
    return ("0" + Math.floor(t / 3600000) % 60).slice(-2);
}

timeString = function(t){
    return hours(t) + ":" + minutes(t) + ":" + seconds(t);
}

isSuggestion = function(msgs){
    for (var i = 0; i < msgs.suggestions.length; ++i)
        if (msgs.text == msgs.suggestions[i].txt)
            return true;

    return false;
}

exports.god = function(allChats) {
    keys = Object.keys(allChats);
    keys.sort(function (c, d) { return allChats[d].startMS - allChats[c].startMS; });
    var s = '<html><head><title>TurkTalk - God Page</title><link rel="stylesheet" href="Styles/god.css" /><link rel="stylesheet" href="Styles/hahaha.css" /></head><body>';
    for (var i = 0; i < keys.length; ++i){
        s += "<div class='chat-link' id='chat-" + i + "'>\n";
        s += timeAgo(allChats[keys[i]].startMS) + " with ";
        s += "<span class='chat-line-one'>" + allChats[keys[i]].wid0 + "</span>";
        s += " and ";
        s += "<span class='chat-line-two'>" + allChats[keys[i]].wid1 + "</span>";
        s += ", duration " + timeString(allChats[keys[i]].elapsedMS) + "<br/>\n";
        s += "<div class='messages'>\n";
        for (var j = 0; j < allChats[keys[i]].msgs.length; ++j){
            s += "<div class='";
            if (j % 2 == 0)
                s += "chat-line-one";
            else
                s += "chat-line-two";
            if (allChats[keys[i]].msgs[j].suggestions && !isSuggestion(allChats[keys[i]].msgs[j]))
                s += " not-a-suggestion";
            s += "'"; 
            s += "title='"
            if (allChats[keys[i]].msgs[j].suggestions)
                s += escapeQuotes(allChats[keys[i]].msgs[j].suggestions.map(
                    function(x){ 
                        y = (typeof x==="string") ? x : x.txt.replace(/</g, "&lt;").replace(/>/g, "&gt;"); 
                        if (y.length > 100)
                            y = "suggestion_too_long_to_show";
                        return y;
                    }).join('\n'));
            s += "'";
            s += ">\n";
            s += allChats[keys[i]].msgs[j].text;
            s +=  "</br>\n";
           s += "</div>\n"
        }
        s += "</div>";
        s += "</div><br>";
    }
    s += "</body></html>";
    return s;
}
