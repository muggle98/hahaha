var fs = require('fs');
var path = require('path');
var glob = require('glob');

exports.allChats = {};

var master = {
    stats: {},
    Lambda1: 10,
    Lambda2: 10
};

var addMessage = function (msg) {
    if (!msg || !msg.suggestions) return;
    msg.suggestions.forEach(function (sugg) {
        if (!sugg.deriv) return;
        var conf = sugg.conf || 1;
        if (!(sugg.deriv in master.stats)) {
            console.log(sugg.deriv);
            master.stats[sugg.deriv] = [0, 0];
        }
        var stat = master.stats[sugg.deriv];
        stat[1] += conf * conf;
        if (sugg.txt === msg.text) stat[0] += conf;
    });
}

exports.updateConv = function (chat) {
    var i = (exports.allChats[chat.id] ? exports.allChats[chat.id].msgs.length : 0);
    exports.allChats[chat.id] = chat;
    if (!chat.msgs) return;
    while (i < chat.msgs.length) {
       // console.log(i + " " + chat.msgs[i].suggestions);
        addMessage(chat.msgs[i]);
        i++;
    }
}


exports.init = function (callback) {
      glob("./chats/20*", {}, function (err, filenames) {
        if (err) { callback(err); return; }
        var pending = filenames.length;
        filenames.forEach(function (filename) {
            fs.readFile(filename, function (err, data) {
                if (err) { callback(err); return; }
                try {
                    var chat = JSON.parse(data);
                    exports.updateConv(chat);
                } catch (e) {
                    console.error("*** master.init: Error reading file " + filename);
                }
                pending--;
                if (pending == 0) callback(undefined);
            });
        });
    });
}

/*test version
exports.init = function (callback) {
  
    var filename = "./chats/20140627123850253-A2TP3RDW3QWA43-A2B8HPIZDKYKDR-0.4.3.json";
            fs.readFile(filename, function (err, data) {
                console.log(filename);
                if (err) { callback(err); return; }
                //console.log(data);
                var chat = eval("(" + data + ")");
                exports.updateConv(chat);
                callback(undefined);
            });
      
}*/;

exports.score = function (origconf, deriv) {
    //  console.log("conf: "+conf+" deriv: "+deriv);
    var conf = origconf || 1;
    var d = master.stats[deriv] || [0, 0];
    return conf * (d[0]+master.Lambda1)/(d[1] + master.Lambda2);
}

exports.prettyPrint = function () {
    var deriv;
    for (deriv in master.stats) {
        console.log(deriv +":\t" +  master.stats[deriv][0]+"\t" + master.stats[deriv][1] + "\t" + exports.score(1, deriv));
    }
}

