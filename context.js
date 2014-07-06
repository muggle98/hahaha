// JavaScript source code
//

var natural = require('natural');
var COSINE = require('./cosine.js');
var stemmer = natural.PorterStemmer;
var wordnet = new natural.WordNet();
stemmer.attach();

var pos = require('pos');


var synset = function (word) {

    wordnet.lookup(word, function (results) {
   //     console.log(word);
   //     console.log(results[0].synonyms);
            return results[0].synonyms;
        });
}

exports.synsetCosineSimilarity = function (line1, line2) //based on words and their wordnet synsets in the sentence
{
    wordsA = line1.tokenizeAndStem(); //remove stop words, stemming
    wordsB = line2.tokenizeAndStem();

    wordsAsyn = [];
    wordsBsyn = [];

    for(var i=0;i<wordsA.length;i++)
    {
        var set = wordnet.lookup(wordsA[i], function (results) {
            console.log(results);
            return results[0].synonyms;
        });
        console.log(set);
        if (set) {
            wordsAsyn.concat(set);
        } else {
            wordsAsyn.push(wordsA[i]);
        }
       
    }

    for (var i = 0; i < wordsB.length; i++) {
        var set = wordnet.lookup(wordsB[i], function (results) {
            return results[0].synonyms;
        });
        console.log(set);
        if (set) {
            wordsBsyn.concat(synset(wordsB[i]));
        } else {
            wordsBsyn.push(wordsB[i]);
        }

    }
    console.log("line A syn");
    console.log(wordsAsyn);
    console.log("line B syn");
    console.log(wordsBsyn);
    return COSINE.textCosineSimilarity(wordsAsyn, wordsBsyn);

}

exports.POSCosineSimilarity = function (line1, line2) //based on words in the sentence
{
    var words1 = new pos.Lexer().lex(line1);
    var taggedWords1 = new pos.Tagger().tag(words1);
    var pos1 = [];
    for (i in taggedWords1) {
        var taggedWord = taggedWords1[i];
     //   var word = taggedWord[0];
        var tag = taggedWord[1];
     //   console.log(word + " /" + tag);
        pos1.push(tag);
    }

    var words2 = new pos.Lexer().lex(line2);
    var taggedWords2 = new pos.Tagger().tag(words2);
    var pos2 = [];
    for (i in taggedWords2) {
        var taggedWord = taggedWords2[i];
    //    var word = taggedWord[0];
        var tag = taggedWord[1];
        //   console.log(word + " /" + tag);
        pos2.push(tag);
    }

    console.log(pos1);
    console.log(pos2);
    return COSINE.textCosineSimilarity(pos1, pos2);
}


exports.textCosineSimilarity = function (strA, strB) { //based on words in the sentence
    wordsA = strA.tokenizeAndStem(); //remove stop words, stemming
    wordsB = strB.tokenizeAndStem();
    return COSINE.textCosineSimilarity(wordsA,wordsB);
}

exports.lookupWord = function (word) {

    stemmer.attach();
    console.log('i stemmed the words.'.tokenizeAndStem());

    wordnet.lookup(word, function (results) {
        results.forEach(function (result) {
            console.log('------------------------------------');
            console.log(result.synsetOffset);
            console.log(result.pos);
            console.log(result.lemma);
            console.log(result.synonyms);
            console.log(result.pos);
            console.log(result.gloss);
        });
    });

}