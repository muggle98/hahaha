var version = "0.4.3";

if (typeof module !== 'undefined' && module.exports) exports.version = version; // so node server.js can read this too!

var escapeQuotes = function(s){
    return s.replace(/'/g, "&#39;").replace(/"/g, "&#34;");
}

timeAgo = function(d){
    var secs = Math.round(((new Date()).getTime() - d) / 1000);
    if (secs < 2)
        return "";
    if (secs < 120)
        return secs.toString() + " seconds ago";
    if (secs < 7200)
        return Math.round(secs / 60).toString() + " minutes ago";
    if (secs < 172800)
        return Math.round(secs / 3600).toString() + " hours ago";
    else
        return Math.round(secs / 86400).toString() + " days ago";
        
}


function playSound(id) {
    try {
        document.getElementById(id).play();
    } catch (e) {
        console.log("failed to play sound");
    }
}
