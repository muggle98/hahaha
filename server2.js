var exec = require('child_process').exec;
var fs = require('fs');
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server); io.set('log level', 1);
var version = require(__dirname + '/public/Scripts/hahaha.js').version;
var doge = require('./public/Scripts/doge.js');
var url = require('url');
var master = require('./master.js');


var G = { waiting: null, sockets: {}, convs: {} };

var prefix = (process.env.USER || process.env.USERNAME);
if (prefix === "azureuser") prefix = "";

function log(msg, error) { // log a message to the console and to the log
    if (error) console.error(msg); 
    else console.log(msg);
    date = new Date();
    var filename = __dirname + "/logs/"+ prefix + date.getUTCFullYear() + pad0(date.getUTCMonth()+1, 2) + pad0(date.getUTCDate(), 2) + (error ? ".error.txt" : ".txt"); 
    msg = new Date() + "  " + msg;
    if (msg[msg.length - 1] != "\n") msg = msg + "\n";
    fs.appendFile(filename, msg, function (err) { if (err) { console.log("Failed to log, error:"); console.log(err); } });
}

function error(msg) {
    log(msg, true);
}

function pad0(n, len) { // pad an integer to be length n
    n = n + "";
    while (n.length < len) n = "0" + n;
    return n;
}

function newConv(wid0, wid1) { // for now just 2 people
    var date = new Date();
    var id = date.getUTCFullYear() + pad0(date.getUTCMonth() + 1, 2) + pad0(date.getUTCDate(), 2) + pad0(date.getUTCHours(), 2) + pad0(date.getUTCMinutes(), 2) + pad0(date.getUTCSeconds(), 0) + pad0(date.getUTCMilliseconds(), 3) + "-" + wid0 + "-" + wid1 + "-" + version;
    var conv = {
        id: id,
        wid0: wid0,
        wid1: wid1,
        msgs: [],
        startMS: new Date().getTime(),
        elapsedMS: 0
    };
    log("Creating conversation " + conv.id);
    return conv;
}


function simsimi(str, callback, that) { // get a simsimi result (and cache it) for string, call callback.call(that, result)
    options = {
        host: "api.simsimi.com",
        port: 80,
        method: 'GET',
        path: '/request.p?key=d123e1ac-c047-4e00-89ef-fcae8851fdde&lc=en&ft=1.0&text=' + encodeURIComponent(str)
    };
    if (!simsimi.cache) simsimi.cache = {};
    if (str in simsimi.cache) {
        log("Using cached Simsimi: " + str + " ==> " + simsimi.cache[str]);
        callback.call(that, simsimi.cache[str]);
        return;
    }
    var callback2 = function (str, callback, that) {
        return function (resp) {
            resp.on('data', function (chunk) {
                try {
                    chunk = eval("(" + chunk +")");
                    log("Simsimi: " + str + " ==> " + chunk.response);
                    callback.call(that, chunk.response);
                    simsimi.cache[str] = chunk.response;
                } catch(e) {
                    error("Simsimi error: " + e);
                }
            });
        }
    }(str, callback, that);
    http.get(options, callback2).on("error", function (e) { error("Simsimi server error: " + e.message); });
}

// ---------------------------------------------------------------------------------------------------------
// Server stuff
// ---------------------------------------------------------------------------------------------------------
 

master.init(function () {
    console.log("Loaded " + Object.keys(master.allChats).length + " chats");
    master.prettyPrint();
    server.listen(3000);
});
 
 
app.get('/doge.html', function (req, res) {
    var query = url.parse(req.url, true).query;
    res.send(doge.doge2html((query && query.texts || 'very generate, little AI, wow').split(/,\s*/g))
        + "<div><form action='doge.html'><input placeholder='very generate, little AI, wow' value='" + (query && query.texts || "") + "' name='texts' style='width:600px;' /><br /><input type='submit' value='wow' /></form></div>");
});

app.get('/simsimi.html', function (req, res) {
    var query = url.parse(req.url, true).query;
    simsimi(query.text, res.send, res);
});



app.get('/god.html', function (req, res) {
//    console.log('stdout: ' + stdout);
//    console.log('stderr: ' + stderr);
//    if (error !== null) {
//        res.send('exec error: ' + error);
//        return;
//    }
    fs.readFile('public/god.html', function (err, data) {
        res.end(data);
    });
});

app.get('/updategod.html', function (req, res) {
    exec('python private/collect.py');
    res.send('done');
});

app.use('/', express.static(__dirname + '/public'));


io.sockets.on('connection', function (socket) {    
    log("New connection " + JSON.stringify(socket.id));
    function hi(wid) {
        G.sockets[wid] = socket;
        if (G.waiting !== null && G.waiting !== wid) {
            var conv = newConv(G.waiting, wid);
            G.convs[conv.id] = conv;
            var toSend = { conv: conv };
            socket.emit("hello", toSend);
            G.sockets[G.waiting].emit("hello", toSend);
            G.waiting = null;
        } else {
            G.waiting = wid;
            log("waiting " + wid);
        }
        socket.wid = wid;
    }

    socket.on('hello', function (data) {
        log("hello " + data.wid);
        hi(data.wid);
    });
    function update(conv) { // merge to longest conversation and update participants
        if (!conv) return;
        if (conv.startMS) conv.elapsedMS = new Date().getTime() - conv.startMS;
        var c2 = G.convs[conv.id] || conv; 
        if (conv.msgs.length < c2.msgs.length) {
            conv.msgs = c2.msgs;
            master.updateConv(conv);
        }
        if (conv.elapsedMS < c2.elapsedMS) conv.elapsedMS = c2.elapsedMS;
        if (c2.dead) conv.dead = true;
        G.convs[conv.id] = conv;
        log("Updating convid " + conv.id + " to length " + conv.msgs.length);
        [conv.wid0, conv.wid1].forEach(function (wid) {
            if (wid && G.sockets[wid]) G.sockets[wid].emit("update", { conv: conv });
        });
        fs.writeFile(__dirname + "/chats/" + prefix + conv.id + ".json", JSON.stringify(conv), function (err) { if (err) { log("Error writing chat"); log(err); } });
    }

    socket.on('hiAgain', function (data) {
        if (!data.wid) error("got hiAgain with no wid");
        else {
            if (!data.conv) {
                log("Thanks for reconnecting " + data.wid + ". We are still looking for a partner for you.");
                hi(data.wid);
            } else {
                log("Thanks for reconnecting " + data.wid + ". Please continue your conversation.");
                update(data.conv);
            }
            G.sockets[data.wid] = socket; // just in case the server restarted
        }
    });

    socket.on('update', function (data) {
        if (!data.wid) error("got update with no wid"); else {
            G.sockets[data.wid] = socket; // just in case the server restarted
            update(data.conv);
        }
    });
    socket.on('signOut', function (data) {
        var wid = data.wid;
        log("Signing out " + wid);
        if (G.waiting === wid) {
            G.waiting = null;
        }
        var conv = data.conv;
        if (conv) {
            conv.dead = true;
            update(conv);
        }
    });

    socket.on('disconnect', function () {
        if (socket.wid) {
            log(socket.wid + " disconnected");
            delete G.sockets[socket.wid];
            if (socket.wid === G.waiting) G.waiting = null;
        } else {
            log("Someone disconnected before hello.");
        }
    });

    socket.on('rlog', function (data) {
        log("rlog " + JSON.stringify(data));
    });
});


log((process.env.USER || process.env.USERNAME) + " restarting his server.");

