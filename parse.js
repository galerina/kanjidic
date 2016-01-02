var _ = require('lodash');
var fs = require('fs');
var readline = require('readline');

var dictFile = "kanjidic.txt";
var rlDict = readline.createInterface({
    input: fs.createReadStream(dictFile),
    terminal: false
});

var entries = [];
var radicalEntries = [];

var findElementWithProperty = function(list, propertyName, propertyValue) {
    return _.find(list, function(entry) {
        return _.isEqual(entry[propertyName], propertyValue);
    });
}

var merge = _.after(2, function() {
    var undefRadicalsFile = "radicals.json";
    var contents = fs.readFileSync(undefRadicalsFile);
    var undefinedRadicals = JSON.parse(contents);
    var index = {};
    for (var i = 0; i < entries.length; i++) {
        if (_.has(radicalEntries, entries[i].kanji)) {
            var radicals = radicalEntries[entries[i].kanji];
            entries[i]["radicals"] = radicals;
            entries[i]["meanings"] = _.uniq(entries[i]["meanings"].concat(
                _.flatten(_.compact(
                radicals.map(function(elem) {
                var radicalDictEntry = undefined;
                if (_.isEqual(entries[i], elem)) {
                    return undefined;
                }

                if (radicalDictEntry = findElementWithProperty(entries, "kanji", elem)) {
                    return radicalDictEntry["meanings"];
                } else if (radicalDictEntry = findElementWithProperty(undefinedRadicals, "kanji", elem)) {
                    return [radicalDictEntry["meaning"]];
                } else {
                    return undefined;
                }
            })))));

            entries[i]["radicals"].forEach(function(rad) {
                if (!_.has(index, rad)) {
                    index[rad] = [];
                }

                index[rad].push(entries[i].kanji);
            });

            entries[i]["meanings"].forEach(function(meaning) {
                if (!_.has(index, meaning)) {
                    index[meaning] = [];
                }

                index[meaning].push(entries[i].kanji);
            });
        }
    }

    var kanji = {};
    entries.forEach(function(e) {
        kanji[e.kanji] = e.meanings[0];
    })

    // FINAL OUTPUT
    var kanjiFile = "kanji-new-format.json";
    fs.writeFileSync(kanjiFile, JSON.stringify(kanji));


    var indexFile = "kanjiLookup.json";
    fs.writeFileSync(indexFile, JSON.stringify(index));
});

var wordKanjiFile = "wordkanji.json";
var contents = fs.readFileSync(wordKanjiFile);
var wordKanji = JSON.parse(contents);
var entryRE = /(.)[^{]+ (?:F([^ ]+))?/;
var meaningsRE = /{([a-z ]+)}/g;
rlDict.on('line', function(line) {
    var entryMatch = line.match(entryRE);
    var meaningsMatch = [];
    var match;
    while (match = meaningsRE.exec(line)) {
	    meaningsMatch.push(match[1]);
    }
    if (entryMatch) {
        var frequency = 10000; // arbitrary large #
        if (entryMatch[2]) {
            frequency = Number(entryMatch[2]);
        }

        if (_.includes(wordKanji, entryMatch[1])) {
            entries.push({ kanji: entryMatch[1],
               // frequencyRank: frequency,
               meanings: meaningsMatch });
        }
    }
});

rlDict.on('close', function() {
    merge();
});

var radFile = "kradfile-u.txt";
var rlRad = readline.createInterface({
    input: fs.createReadStream(radFile),
    terminal: false
});

rlRad.on('line', function(line) {
    parts = line.split(' : ');
    if (_.eq(parts.length, 2)) {
	    radicalEntries[parts[0]] = parts[1].split(" ");
    }
});

rlRad.on('close', function() {
    merge();
});

