var global = {};

var socket = io.connect('/');


socket.on("hello", function (data) {
    console.log("Got hello");
    if(waitedLongEnough.done) return;
    clearTimeout(waitedLongEnough.timeout);
    waitedLongEnough.timeout = null;
    var conv = data.conv;
    global.conv = conv;
    console.log("Joining convid: " + conv.id + "\nCurrent messages: ");
    console.log(conv.msgs);
    startTimer();
    updateConv(conv);
});

socket.on('connect_failed', function () {
    console.log("Failed to connect");
    $(document.body).html("<h2>Unable to connect to server.</h2>");
    if (waitedLongEnough.timeout) clearTimeout(waitedLongEnough.timeout);
    waitedLongEnough.timeout = null;    
});

socket.on('disconnect', function () {
    console.log('disconnect');
});

socket.on('reconnect', function () {
    console.log("reconnect");
    socket.emit("rlog", { msg: "reconnect", wid: global.wid });
    socket.emit("hiAgain", {
        wid: global.wid,
        conv: global.conv
    });
});

socket.on('reconnecting', function () {
    console.log("reconnecting");
});

socket.on("update", function (data) {
    updateConv(data.conv);
});

function speak(msg, isHa) {
    console.log("Trying to say " + msg);
    global.conv.msgs.push(
        { text: msg, 
          wid: global.wid, 
          suggestions: global.suggs, 
          isHa: isHa
        });
    updateChatHistory(global.conv.msgs);
    hideSuggestions();
    socket.emit("update", {
        wid: global.wid,
        conv: global.conv
    });
}

function updateConv(conv) {
    if (!conv) return;
    var c2 = global.conv || conv;
    if (conv.msgs.length < c2.msgs.length) conv.msgs = c2.msgs;
    if (conv.elapsedMS < c2.elapsedMS) conv.elapsedMS = c2.elapsedMS;
    if (c2.dead) conv.dead = true;
    global.conv = conv;
    if (conv.dead) {
        endConversation();
        socket.disconnect();
    }
    var first = (conv.wid0 === global.wid);
    updateChatHistory(global.conv.msgs);
    
    var cleanMsgs = conv.msgs.filter(function (x) { return !x.isHa; });

    var n = cleanMsgs.length;
    var iWasLast = n > 0 ? (cleanMsgs[n - 1].wid === global.wid) : false;
    if (n === 0 && first || 
        (n > 0 && !iWasLast))
    { // your turn
        updateSuggestions(cleanMsgs); // now updateSuggestions doesn't have to deal with Ha's
        $("#suggestion-list-free").show();
    } else { // not your turn
        hideSuggestions();
    }
    scrollBottom();

}

function startTimer() { // starts timer when there is at least one message and the timer hasn't been restarted 
    console.log('starting timer');
    if (!global.conv || !global.conv.msgs || "time" in startTimer) return; // timer already started or nobody said anything
    startTimer.time = new Date().getTime(); 
    startTimer.timer = setInterval(function () {
        console.log("updating timer");
        var delta = new Date().getTime() - startTimer.time;
        delta = Math.floor((delta) / 60000);
        if (delta > 0) {
            if (delta >= 5) {
                $("#timer").html(delta + " min elapsed<br /><input type='button' value='Sign out' onclick='signOut()' />");
                $("#timer").css("color", "red");
            } else {
                $("#timer").html(delta + " min elapsed");
            }
        }
    }, 10000);
}

function stopTimer() {
    if (startTimer.timer) {
        clearInterval(startTimer.timer);
        delete startTimer.timer;
    }
}

function waitedLongEnough() {
    $(document.body).html("<h1>Unable to locate partner for 5 minutes. You may submit the HIT.</h1>");
    waitedLongEnough.done = true;
    console.log("Giving up and signing out " + new Date());
    socket.emit("signOut", { wid: global.wid, conv: global.conv });
}

function endConversation() {
    $("#endedDiv").show();
    $("#timer").html("<i>Signed out</i>");
    stopTimer();
    hideSuggestions();
    if(socket) socket.disconnect();
}

function signOut() {
    socket.emit("signOut", { wid: global.wid, conv: global.conv });
    endConversation();
}

function joinConv() {
    if(!waitedLongEnough.timeout) waitedLongEnough.timeout = setTimeout(waitedLongEnough, 300000);
    console.log("Trying to join conversation...");
    var t = socket.emit("hello", { wid: global.wid });
    console.log(t);
}

var speakFreeText = function(){
    var text = $("#free-text").val();
    if (text.slice(0, 5) === "html:") text = text.slice(5);
    else text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    $("#free-text").val("");
    speak(text, false);
}

var updateChatHistory = function(msgs){
    var s = "";
    for (var i =0; i < msgs.length; ++i) {
        var color = "blue";
        if (msgs[i].wid == global.wid){
            var classId = "my-chats";
            var shape = "bubble-l";
        }
        else{
            var classId = "others-chats";
            var shape = "bubble-r";
        }
        if (msgs[i].isHa){
            var shape = "shield";
            color = "pink";
        }
        s += "<div class='" + classId + " button " + shape + " " + color + " disabled'>";
        s += msgs[i].text;
        s += "</div><div class='clr'></div>";
    }
    $('#chat').html(s);
    var n = msgs.length
    if (n > 0 && msgs[n - 1].isHa && msgs[n - 1].wid != global.wid){
        console.log(msgs[n-1].text.toLowerCase());
        playSound(msgs[n-1].text.toLowerCase());
    }
}



var insertSuggestions = function(suggs){
    var s = "";
    if ($('#chat').html().length > 0){
        s += "<button class='ha button pink shield'>Ha</button>\n";
        s += "<button class='ha button pink shield'>HaHa</button>\n";
        s += "<button class='ha button pink shield'>HaHaHa</button>\n";
        s += "if you think that was funny<br/>"
    }
    for (var i =0; i < suggs.length; ++i) 
        s += "<button class='suggestion button blue brackets'>" + suggs[i].txt + "</button><br />\n";
    $('#suggestion-list').html(s);
    $(".suggestion").click(acceptSuggestion);
    $(".ha").click(sayHa);
}

var updateSuggestions = function(msgs){
    global.suggs = createSuggestions(msgs);
    insertSuggestions(global.suggs);
    $("#suggestion-instructions").html("Choose what to say:");
}

function scrollBottom() {
    $("html, body").scrollTop($(document).height());
    $("#free-text").focus().blur();
 }


var hideSuggestions = function(){
    $("#suggestion-instructions").html("Waiting for partner to talk.");
    $("#suggestion-list-free").hide();

}


var acceptSuggestion = function(){
    speak($(this).html(), false);
}

var sayHa = function(){
    speak($(this).html(), true);
}



function init() {
    global.wid = location.search.slice(5);
    console.log(new Date() + " Worker id: " + global.wid);
    //$("#version").html("version " + version);
    $(".suggestion").click(acceptSuggestion);
    joinConv();
    $("#free-text").keypress(function (e) {
        if (e.keyCode === 13) { e.preventDefault(); speakFreeText(); }
    });
    if (document.URL.match(/localhost/i)) {
        document.title = "local TurkTalk";
    }
}


window.onload = init;