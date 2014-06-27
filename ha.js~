var global = {
    prevLinesToShow: 3
}

function escapeHTML(s) {
    if (!s) {
        return "";
    }
    s = s + "";
    return s.replace(/[\&"<>\\\n]|  /g, function (s) {
        switch (s) {
            case "&": return "&amp;";
            case "\\": return "\\";
            case '"': return '\"';
            case "<": return "&lt;";
            case ">": return "&gt;";
            case "  ": return "&nbsp; ";
            case "\n": return "<br />";
            default: return s;
        }
    });
}


function extractChats(str) {
    return str.split(/==*\n(?:[^\n]+\n)*/g).map(function(chat) { 
        lines = chat.trim().split(/\n\s*/g);
        var res = [];
        lines.forEach(function (line) {
            var colon = line.indexOf(":");
            speaker = line.slice(0, colon);            
            res.push({user: speaker, text: line.slice(colon + 2)});           
        });
        return res;
    });
}

function go(pattern) {
    var f;
    $("#matches").removeClass("error");
    try {
        f = eval("(" + pattern + ")");
    } catch (e) {
        $("#matches").text("Exception: " + e);
        $("#matches").addClass("error");
        return;
    }
    var chats = extractChats($("#src").val());
    var res = "";
    chats.forEach(function (chat) {
        var i, j;
        j = 0;
        var buffer = [];
        for (i = 0; i < chat.length; i++) {
            if (j < i - global.prevLinesToShow) j = i - global.prevLinesToShow;
            var f_out = f(chat.slice(0, i));
            if (f_out) {
                while (j < i) { buffer.push(chat[j]); j++ }
                buffer.push(f_out);
            }
        }
        if (buffer.length > 0) {
            var alice = chat[0].user;
            nextSpeaker = "alice";
            res += "================================================================";
            buffer.forEach(function (line) {
                if (line === undefined || line === "") return;
                res += "<div class='";
                if (line.user === undefined) {
                    res += "suggestion " + nextSpeaker;
                } else {
                    if (line.user === alice) {
                        res += "alice";
                        nextSpeaker = "bob";
                    } else {
                        res += "bob";
                        nextSpeaker = "alice";
                    }
                }
                res += "'>" + escapeHTML(line.text) + "</div>\n";
            });
        }
    });
    $("#matches").html(res);
}











$(init)

function init() {
}