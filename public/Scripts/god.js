minutes = function(t){
    return ("0" + Math.floor(t / 60000) % 60).slice(-2);
}

seconds = function(t){
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
        if (msgs.text == msgs.suggestions[i].txt || msgs.text.indexOf("joseph.png") >= 0 || msgs.text.indexOf("doge.png") >= 0)
            return true;

    return false;
}

function init() {
    chatHist.sort(function(c, d){ return d.startMS - c.startMS; });
    var s = [];
    for (var i = 0; i < chatHist.length; ++i){
        s += "<div class='chat-link' id='chat-" + i + "'>\n";
        s += timeAgo(chatHist[i].startMS) + " with ";
        s += "<span class='chat-line-one'>" + chatHist[i].wid0 + "</span>";
        s += " and ";
        s += "<span class='chat-line-two'>" + chatHist[i].wid1 + "</span>";
        s += ", duration " + timeString(chatHist[i].elapsedMS) + "<br/>\n";
        s += "<div class='messages'>\n";
        for (var j = 0; j < chatHist[i].msgs.length; ++j){
            s += "<div class='";
           /* if (j % 2 == 0)
                s += "chat-line-one";
            else
                s += "chat-line-two"; */
            if(chatHist[i].msgs[j].wid == chatHist[i].wid0)
            {
            	s += "chat-line-one";
            }else{
            	s += "chat-line-two";
            }
            if (chatHist[i].msgs[j].suggestions && !isSuggestion(chatHist[i].msgs[j]))
                s += " not-a-suggestion";
            s += "'"; 
            s += "title='"
            if (chatHist[i].msgs[j].suggestions)
                s += escapeQuotes(chatHist[i].msgs[j].suggestions.map(
                    function(x){ 
                        y = (typeof x==="string") ? x : x.txt.replace(/</g, "&lt;").replace(/>/g, "&gt;"); 
                        if (y.length > 100)
                            y = "suggestion_too_long_to_show";
                        return y;
                    }).join('\n'));
            s += "'";
            s += ">\n";
            s += chatHist[i].msgs[j].text;
            s +=  "</br>\n";
           s += "</div>\n"
        }
        s += "</div>";
        s += "</div><br>";
    }
    $("#chats").html(s);

}

window.onload = init;