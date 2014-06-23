

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
    for (var i = 0; i < chats.length; ++i)
        if (chats[i].msgs && chats[i].msgs.length > 0)
            for (var j = 0; j < chats[i].msgs.length - 1; ++j){
                if (chats[i].msgs[j].text.length == 0)
                    continue;
                var d = Math.pow(corr(msgs, chats[i].msgs, j), 3);
                if (d > 0){
                    if (chats[i].msgs[j].text in matches)
                        matches[chats[i].msgs[j].text] += d;
                    else
                        matches[chats[i].msgs[j].text] = d;
                }
            }
    return matches;
}


var maxSuggestions = 4;

var suggs = [];
var createSuggestions = function (msgs) {
    matches = calculateMatches(msgs);
    
    console.log(matches);
    
    suggs = [];
    for (var j = 0; j < maxSuggestions; ++j){
        var c = 0.0;
        var r = Math.random();
        
        matches = normalize(matches);
        for (var m in matches){
            c += matches[m];
            if (r < c){
                suggs.push(m);
                delete matches[m];
                break;
            }
        }
    }
    return suggs;
}
 

/*           
{
    if (msgs.length == 0)
        return ["Hi!", "Why did the chicken cross the road?", "What's up, doc?", "Knock knock!"];
    var last = msgs[msgs.length - 1].text;
    if (last == "Knock knock!")
        return ["Who's there?", "I think there is someone at the door", "Can't hear knocks, I'm deaf", "Knock knock knock"];
    if (last == "Who's there?")
        return ["Doris", "Honey bee", "Cows go", "Says"];
    else if (last.length > 0 && last[last.length - 1] == "?")
        return ["I dunno", "You talkin' to me?", "I would rather not comment on that", "stop asking me that!"];
    return ['"' + last + '" your mom', "On a different note, how's the weather?", "Can't think of anything funny to say"];
}
*/