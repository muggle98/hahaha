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
var funnysuggestions = require('./funnysuggestions.js');
var master = require('./master.js');
var god = require('./godMode.js');
var FRIENDS = require('./friends.js');
var EXAMPLE = require('./urbanexample.js');

var G = { waiting: null, sockets: {}, convs: {} };

var prefix = (process.env.USER || process.env.USERNAME);
if (prefix === "azureuser") prefix = "";


var port = parseInt(process.env.PORT, 10) || 8080;

app.listen(port);

app.configure(function(){
  app.use(express.bodyParser());
  app.use(app.router);
});

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
    var ss = [];
     ss.push({ txt: "Hi! What's your name?", deriv: "name-question", conf: undefined });  
     ss.push({ txt: "Why did the chicken cross the road?", deriv: "manual", conf: undefined });  
     ss.push({ txt: "Where are you from?", deriv: "where-question", conf: undefined });
     ss.push({ txt: "Knock knock!", deriv: "KnockKnock-line1", conf: undefined });  
    
    var id = date.getUTCFullYear() + pad0(date.getUTCMonth() + 1, 2) + pad0(date.getUTCDate(), 2) + pad0(date.getUTCHours(), 2) + pad0(date.getUTCMinutes(), 2) + pad0(date.getUTCSeconds(), 0) + pad0(date.getUTCMilliseconds(), 3) + "-" + wid0 + "-" + wid1 + "-" + version;
    var conv = {
        id: id,
        wid0: wid0,
        wid1: wid1,
        msgs: [],
        curSuggs: ss, //current suggestions
        cntHa: [0,0], //count how many "Ha"s each user receives
        startMS: new Date().getTime(),
        elapsedMS: 0
    };
    log("Creating conversation " + conv.id);
    return conv;
}




// ---------------------------------------------------------------------------------------------------------
// Server stuff
// ---------------------------------------------------------------------------------------------------------
master.init(function () { // this replaces the old line that was just server.listen(3000);

    console.log("Loaded " + Object.keys(master.allChats).length + " chats");

    master.prettyPrint();

 /*   console.log("name-question");
    console.log(master.score(1,"name-question"));

    console.log("ma-doge");
    console.log(master.score(1,"m-doge")); */

    server.listen(3000);

});


app.get('/god.html', function (req, res) {
    res.send(god.god(master.allChats));
});

app.get('/updategod.html', function (req, res) {
    exec('python private/collect.py');
    res.send('done');
});


/*
app.get('/', function(req, res){
    var html = fs.readFileSync('index.html');
    res.header("Content-Type", "text/html");
    res.send(html);
});
*/

app.get('/tokennizer.html', function (req, res) {	
	var query = url.parse(req.url, true).query.text;
	console.log("call tokennizer!"+ query);
	var tokenizer = new natural.WordTokenizer();
    res.send(tokenizer.tokenize(query));
});

app.use('/', express.static(__dirname + '/public'));

function rankByMaster(suggs, cnt)
{
    //  if (s) ss.push({ txt: s, deriv: "simsimi", conf: undefined });
    for(var i = 0;i<suggs.length;i++)
    {
        for (var j = suggs.length-1; j > i; j--)
        {
            scorej = master.score(suggs[j].conf, suggs[j].deriv);
            scorej_1 = master.score(suggs[j - 1].conf, suggs[j - 1].deriv);
        //    console.log(scorej + " " + scorej_1);
            if(scorej > scorej_1)
            {
                temp = suggs[j];
                suggs[j] = suggs[j - 1];
                suggs[j - 1] = temp;
            }
        }
    } 
    suggs.splice(cnt,suggs.length-cnt);
    return suggs;

}

io.sockets.on('connection', function (socket) {    
    log("New connection " + JSON.stringify(socket.id));
    function hi(wid) {
        G.sockets[wid] = socket;
        
        var address = socket.handshake.address; //get ip address
        console.log("New connection from " + address.address + ":" + address.port);
      
      //run once  
      // EXAMPLE.init();
        
     //run once   FRIENDS.init();
     
        if (G.waiting !== null && G.waiting !== wid) {
            var conv = newConv(wid, G.waiting);
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
    function update(conv, isHa) { // merge to longest conversation and update participants
        if (!conv) return;
        if (conv.startMS) conv.elapsedMS = new Date().getTime() - conv.startMS;
        var c2 = G.convs[conv.id] || conv;
        console.log(conv.msgs.length + " " + c2.msgs.length);
        if (conv.msgs.length < c2.msgs.length) 
        {
        	 conv.msgs = c2.msgs;
        	 master.updateConv(conv);
            // conv.curSuggs = funnysuggestions.createSuggestions(conv.msgs);
        }
        if (conv.elapsedMS < c2.elapsedMS) conv.elapsedMS = c2.elapsedMS;
        if (c2.dead) conv.dead = true;
        G.convs[conv.id] = conv;
        log("Updating convid " + conv.id + " to length " + conv.msgs.length);
  
        if (!isHa) {
            suggs = funnysuggestions.createSuggestions(conv.msgs);
            //    console.log("suggs ");
            //    console.log(suggs);
            conv.curSuggs = rankByMaster(suggs, 4);

            //     console.log("master suggs ");
            //     console.log(conv.curSuggs);


            fs.writeFile(__dirname + "/chats/" + prefix + conv.id + ".json", JSON.stringify(conv), function (err) { if (err) { log("Error writing chat"); log(err); } });
        }
        [conv.wid0, conv.wid1].forEach(function (wid) {
            if (wid && G.sockets[wid]) G.sockets[wid].emit("update", { conv: conv });
        });
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
                update(data.conv,data.isHa);
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

    socket.on('typing', function (data) {
        if (!data.partnerWid) error("got typing with no partnerWid"); else {
            if (G.sockets[data.partnerWid]) G.sockets[data.partnerWid].emit("typing", { textSoFar: data.textSoFar });
        }
    });

    socket.on('rlog', function (data) {
        log("rlog " + JSON.stringify(data));
    });
});


log((process.env.USER || process.env.USERNAME) + " restarting his server.");

