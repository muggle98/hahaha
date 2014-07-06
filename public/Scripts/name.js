var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
//make fun of names, maybe use as a callback joke
exports.namejoke = function(name)
{
	var suggs = [];
	var relatecnt = 0;
			xmlHttp = new XMLHttpRequest();
			xmlHttp.open("GET",'http://api.urbandictionary.com/v0/define?term='+name,false);
			xmlHttp.send(null);
			var l = JSON.parse(xmlHttp.responseText).list;
			if(l){
				var def=l[0].definition;
		//	console.log("DEF ");
		//		console.log(def);
		//		console.log(l[0]);
			if(def != "A word in the [urbandictionary] that is lacking definition."){
				var s = def.split(".");
				var index = 0;
				if(s[0].indexOf(name)>-1)
				{
					 suggs.push({ txt: s[0], deriv: "name-urban", conf: undefined });
				}else{
					 suggs.push({ txt: "Oh, "+s[0], deriv: "name-urban", conf: undefined });
				}
				index++;
				
				var eg=l[0].example;
			//	console.log("E.G. ");
			//	console.log(eg);
				s = eg.split(".");
				for(var i=0;i<s.length;i++)
				{
					if(s[i].indexOf(name)&&s[i]!="")
					{
						 suggs.push({ txt: s[i], deriv: "name-urban", conf: undefined });
						index++;
					}
				}
			}
			}
			//console.log(suggs);
			return suggs;
}