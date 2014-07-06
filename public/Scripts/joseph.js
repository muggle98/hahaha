var old = {};
old["the"] = "ye";
old["here"] = "hither";
old["has"] = "hath";
old["whenever"] = "whosoever";
old["between"] = "betwixt";
old["i think"] = "methink";
old["perhaps"] = "mayhap";
old["if ever"] = "ifsoever";
old["listen"] = "hark";
old["before"] = "ere";
old["no"] = "nay";
old["bitch"] = "female";
old["get"] = "acquire";
old["fuck"] = "disregard";
old["money"] = "currency";
old["dog"] = "hound";
old["you"] = "thou";

exports.oldEnglish = function (msg) {
	
	for(var i=0;i<Object.keys(old).length;i++){
				var re = new RegExp("\\b"+Object.keys(old)[i]+"\\b");
		//		console.log(Object.keys(old)[i]);
				if(re.exec(msg) != null)
				{		
				//	console.log(Object.keys(old)[i]+"  "+old[Object.keys(old)[i]]);
				    msg = msg.replace(new RegExp(Object.keys(old)[i], 'g'), old[Object.keys(old)[i]]);
				}
	}
	return msg;
}


var joseph2html = function (texttop,textbottom, width) {
    function choose(list) {
        return list[Math.floor(Math.random()*list.length)];
    }
    width = width || 200;
    var fontSize = 30*parseFloat(width)/100.0;
    var html = '<div class ="meme-block" style=\'display:inline-block;position:relative; font-family: "times", "serif", joseph, "Marker Felt", Sans; font-size: '+fontSize+'px;\'>\n'
        + '<img src="Images/joseph.png" class="meme-pic joseph" />\n';
    
        html += '<div style="position:absolute;';
        html += 'color: white;';
        html += 'width: 400px;';
        html += 'text-align: center;';
        html += 'font-size: 30px;';
        html += 'top: 20px;';
        html += "margin-left: auto;";
        html += "margin-right: auto;";
        html += '">' + texttop.toUpperCase() + '</div>\n';
    
     		html += '<div style="position:absolute;';
        html += 'color: white;';
        html += 'width: 400px;';
        html += 'text-align: center;';
        html += 'font-size: 30px;';
        html += 'bottom: 20px;';
        html += "margin-left: auto;";
        html += "margin-right: auto;";
        html += '">' + textbottom.toUpperCase() + '</div>\n';
    


    html += '</div>';
    return html;
}

if (typeof module !== 'undefined' && module.exports) exports.joseph2html = joseph2html; // so node server.js can read this too!
