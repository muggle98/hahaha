// make sure to include CHATS.js as well

function normalize(matches){
    var sumDist = 0.0;
    for (var m in matches)
        sumDist += matches[m];
    for (var m in matches)
        matches[m] = matches[m] / sumDist;
    return matches;
}

//lowercase and trim whitespaces from extremeties
function standardize(str) {  
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '').toLowerCase();
}

var expo = 0.5;

function corr(msgs, hist, histLen){
    var d = 0.0;

    var j = msgs.length;
    for (var i = histLen; i > 0 && j > 0; --i){
        if (standardize(msgs[j-1].text) == standardize(hist[i - 1].text))
            d += Math.pow(expo, histLen - i);
        --j;
    }
    d += Math.pow(expo, Math.max(histLen, msgs.length) - 1);

    return d;
}

function calculateMatches(msgs){
    var matches = {};
    for (var i = 0; i < CHATS.length; ++i)
        if (CHATS[i].msgs && CHATS[i].msgs.length > 0)
            for (var j = 0; j < CHATS[i].msgs.length - 1; ++j){
                if (CHATS[i].msgs[j].text.length == 0)
                    continue;
                var d = Math.pow(corr(msgs, CHATS[i].msgs, j), 3);
                if (d > 0){
                    if (CHATS[i].msgs[j].text in matches)
                        matches[CHATS[i].msgs[j].text] += d;
                    else
                        matches[CHATS[i].msgs[j].text] = d;
                }
            }
    return matches;
}



var createSuggestionsSimilarity = function (msgs, numSuggestions) {


    matches = calculateMatches(msgs);
    
    var ss = [];
    for (var j = 0; j < numSuggestions; ++j){
        var c = 0.0;
        var r = Math.random();
        
        matches = normalize(matches);
        for (var m in matches){
            c += matches[m];
            if (r < c){
                ss.push({ txt: m, deriv: "similarity" });
                delete matches[m];
                break;
            }
        }
    }
    return ss;
}
 

function simsimi(txt) {
    var res;
    $.ajax({
        url: "/simsimi.html?text=" + encodeURIComponent(txt),
        type: 'GET',
        async: false,
        success: function (data) {
            res = data;
        },
        error: function (jxhr) {
            console.log(jxhr.responseText);
        }
    });
    return res;
}


var createSuggestionsManual = function (msgs) {
    var ss = [];
    if (msgs.length > 0)
        var last = msgs[msgs.length - 1].text;
    if (msgs.length == 0)
        ss = ["Hi!", "Why did the chicken cross the road?", "Knock knock!"];
    else if (last == "Knock knock!")
        ss = ["Who's there?", "I think there is someone at the door"];
    else if (last == "Who's there?")
        ss = ["Honey bee", "Cows go", "Says"];
    else if (last.length > 0 && last[last.length - 1] == "?")
        ss = ["I dunno", "I would rather not comment on that", "stop asking me that!"];
    else{
        words = last.replace(/[^a-zA-Z\s]+/g, '').toLowerCase().split(" ")
        if (words.length < 3 || words.length > 10 )
            doge = "WOW. such joke. so laugh. much funny.";
        else
            doge = "WOW. such " + words[0] + ".  so " + words[1] + ". much " + words[2] + ".&nbsp";
//        doge += doge2html(doge.split(". "), 40);
        doge = doge2html(doge.split(". "), 300);
        ssA = [[doge], ['"' + last + '" your dad'], ['"' + last + '" your mom'], ["On a different note, how's the weather?"]];
        ss = ssA[Math.floor(Math.random()*ssA.length)];
    }
    ss = ss.map(function (s) { return { txt: s, deriv: "manual" }; });
    if (msgs.length > 0 && last) {
        var s = simsimi(last);
        if (s) ss.push({ txt: s, deriv: "simsimi" });
    }
    return ss;
}



var suggs = [];

var createSuggestions = function(msgs){
    var ssManual = createSuggestionsManual(msgs);
    var ssSimilarity = createSuggestionsSimilarity(msgs, 4 - ssManual.length);
    suggs = ssSimilarity;
    for (var i = 0; i < ssManual.length; ++i){
        var found = false;
        for (var j = 0; j < suggs.length; ++j)
            if(ssManual[i].txt == suggs[j].txt)
                found = true;
        if (!found)
            suggs.push(ssManual[i]);
    }
    console.log(suggs);
    return suggs;
}