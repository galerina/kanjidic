var xml2js = require('xml2js');
var fs = require('fs');
var util = require('util');
var _ = require('lodash');

var dictFile = "JMdict_e.xml";
// var dictFile = "testdic.txt";

var japaneseRE = /^[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]+$/;
//                  -------------_____________-------------_____________-------------_____________
//                  Punctuation   Hiragana     Katakana    Full-width       CJK      CJK Ext. A
//                                                           Roman/      (Common &      (Rare)
//                                                         Half-width    Uncommon)
//                                                          Katakana

var parser = new xml2js.Parser();
var words = [];
fs.readFile(dictFile, function(err, data) {
    parser.parseString(data, function (err, result) {
        result["JMdict"]["entry"].forEach(function(e) {
            if (e.hasOwnProperty("k_ele")) e["k_ele"].forEach(function(k) {
                if (k.hasOwnProperty("keb")) k["keb"].forEach(function(keb) {
                    if (japaneseRE.exec(keb)) {
                        words.push(keb);
                    }
                });
            });
        });

        words.sort();
        console.log(JSON.stringify(words));
        if (false) {
            var kanji = [];
            var kanjiRE = /([\u4e00-\u9faf\u3400-\u4dbf])/g;
            words.forEach(function(e) {
                var match;
                while(match = kanjiRE.exec(e)) {
                    if (!_.includes(kanji, match[0])) {
                        kanji.push(match[0]);
                    }
                }
            });

            kanji.sort();
            console.log(JSON.stringify(kanji));
        }
    });
});