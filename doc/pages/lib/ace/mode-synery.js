define('ace/mode/synery', ['require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/text', 'ace/mode/synery_highlight_rules', 'ace/mode/matching_brace_outdent'], function (require, exports, module) {


    var oop = require("../lib/oop");
    var TextMode = require("./text").Mode;
    var Tokenizer = require("../tokenizer").Tokenizer;
    var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;

    var SyneryHighlightRules = require("./synery_highlight_rules").SyneryHighlightRules;

    var Mode = function () {
        this.HighlightRules = SyneryHighlightRules;
        this.$outdent = new MatchingBraceOutdent();
    };
    oop.inherits(Mode, TextMode);

    (function () {

        this.lineCommentStart = "//";
        this.blockComment = { start: "/*", end: "*/" };

        this.getNextLineIndent = function (state, line, tab) {
            var indent = this.$getIndent(line);

            var tokenizedLine = this.getTokenizer().getLineTokens(line, state);
            var tokens = tokenizedLine.tokens;

            if (tokens.length && tokens[tokens.length - 1].type == "comment") {
                return indent;
            }

            if (state == "start") {
                var match = line.match(/^.*[\{\(\[]\s*$/);
                if (match) {
                    indent += tab;
                }
            }

            return indent;
        };

        this.checkOutdent = function (state, line, input) {
            return this.$outdent.checkOutdent(line, input);
        };

        this.autoOutdent = function (state, doc, row) {
            this.$outdent.autoOutdent(doc, row);
        };


        this.createWorker = function (session) {
            return null;
        };

        this.$id = "ace/mode/csharp";
    }).call(Mode.prototype);

    exports.Mode = Mode;
});

define('ace/mode/synery_highlight_rules', ['require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/doc_comment_highlight_rules', 'ace/mode/text_highlight_rules'], function (require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var DocCommentHighlightRules = require("./doc_comment_highlight_rules").DocCommentHighlightRules;
    var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

    var SyneryHighlightRules = function () {

        var keywordControls = (
            "CONNECT|IMPORT|EXPORT|READ|FROM|TO|LEFT|JOIN|COMPARE|SELECT|WHERE|DISTINCT|BEGIN|END|IF|ELSE|THEN|AS|ORDER|BY|RETURN|OBSERVE|HANDLE|EMIT|THROW|SET|GET|FIELDS|FILTER"
        );

        var storageType = (
            "STRING|INT|BOOL|DECIMAL|DOUBLE|CHAR|DATETIME"
        );

        var storageModifiers = (
            "CREATE|READ|UPDATE|DELETE|EXECUTE"
        );

        var keywordOperators = (
            "AND|OR|DESC"
        );

        var builtinConstants = (
            "NULL|TRUE|FALSE"
        );

        var keywordMapper = this.$keywords = this.createKeywordMapper({
            "keyword.control": keywordControls,
            "storage.type": storageType,
            "storage.modifier": storageModifiers,
            "keyword.operator": keywordOperators,
            "constant.language": builtinConstants
        }, "identifier");

        // regexp must not have capturing parentheses. Use (?:) instead.
        // regexps are ordered -> the first match is used

        this.$rules = {
            "start": [
                {
                    token: "comment",
                    regex: "\\/\\/.*$"
                },
                DocCommentHighlightRules.getStartRule("doc-start"),
                {
                    token: "comment", // multi line comment
                    regex: "\\/\\*",
                    next: "comment"
                }, {
                    token: "string.regexp",
                    regex: "~('\"' | '\\')"
                }, {
                    token: "string", // character
                    regex: /'(?:.|\\(:?u[\da-fA-F]+|x[\da-fA-F]+|[tbrf'"n]))'/
                }, {
                    token: "string", start: '"', end: '"|$', next: [
                        { token: "constant.language.escape", regex: /\\(:?u[\da-fA-F]+|x[\da-fA-F]+|[tbrf'"n])/ },
                        { token: "invalid", regex: /\\./ }
                    ]
                }, {
                    token: "string", start: '@"', end: '"', next: [
                        { token: "constant.language.escape", regex: '""' }
                    ]
                }, {
                    token: "constant.numeric", // hex
                    regex: "0[xX][0-9a-fA-F]+\\b"
                }, {
                    token: "constant.numeric", // float
                    regex: "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
                }, {
                    token: "storage.type",
                    regex: "#\.?[a-zA-Z_][a-zA-Z0-9_]*"
                }, {
                    token: "constant.language.boolean",
                    regex: "(?:TRUE|FALSE)\\b"
                }, {
                    token: "constant.other",
                    regex: "\\\\\\\\[a-zA-Z_][a-zA-Z0-9_]*(\\\\[a-zA-Z_$][a-zA-Z0-9_$]*)*"
                }, {
                    token: "variable.language",
                    regex: "\\\\[a-zA-Z_$][a-zA-Z0-9_$]*"
                }, {
                    token: "paren.lparen",
                    regex: "BEGIN"
/*                }, {
                    token: "paren.rparen",
                    regex: "END"
*/
                }, {
                    token: keywordMapper,
                    regex: "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
                }, {
                    token: "keyword.operator",
                    regex: "!|\\$|%|&|\\*|\\-\\-|\\-|\\+\\+|\\+|==|=|!=|<=|>=|<>|<|>|\\|\\||\\?\\:|\\*=|%=|\\+=|\\-="
                }, {
                    token: "keyword",
                    regex: "^\\s*#(IF|ELSE)"
                }, {
                    token: "punctuation.operator",
                    regex: "\\?|\\:|\\,|\\;|\\."
                }, {
                    token: "text",
                    regex: "\\s+"
                }
            ],
            "comment": [
                {
                    token: "comment", // closing comment
                    regex: ".*?\\*\\/",
                    next: "start"
                }, {
                    token: "comment", // comment spanning whole line
                    regex: ".+"
                }
            ]
        };

        this.embedRules(DocCommentHighlightRules, "doc-",
            [DocCommentHighlightRules.getEndRule("start")]);
        this.normalizeRules();
    };

    oop.inherits(SyneryHighlightRules, TextHighlightRules);

    exports.SyneryHighlightRules = SyneryHighlightRules;
});

define('ace/mode/doc_comment_highlight_rules', ['require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/text_highlight_rules'], function (require, exports, module) {


    var oop = require("../lib/oop");
    var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

    var DocCommentHighlightRules = function () {

        this.$rules = {
            "start": [{
                token: "comment.doc.tag",
                regex: "@[\\w\\d_]+" // TODO: fix email addresses
            }, {
                token: "comment.doc.tag",
                regex: "\\bTODO\\b"
            }, {
                defaultToken: "comment.doc"
            }]
        };
    };

    oop.inherits(DocCommentHighlightRules, TextHighlightRules);

    DocCommentHighlightRules.getStartRule = function (start) {
        return {
            token: "comment.doc", // doc comment
            regex: "\\/\\*(?=\\*)",
            next: start
        };
    };

    DocCommentHighlightRules.getEndRule = function (start) {
        return {
            token: "comment.doc", // closing comment
            regex: "\\*\\/",
            next: start
        };
    };


    exports.DocCommentHighlightRules = DocCommentHighlightRules;

});

define('ace/mode/matching_brace_outdent', ['require', 'exports', 'module', 'ace/range'], function (require, exports, module) {


    var Range = require("../range").Range;

    var MatchingBraceOutdent = function () { };

    (function () {

        this.checkOutdent = function (line, input) {
            if (! /^\s+$/.test(line))
                return false;

            return /^\s*\}/.test(input);
        };

        this.autoOutdent = function (doc, row) {
            var line = doc.getLine(row);
            var match = line.match(/^(\s*\})/);

            if (!match) return 0;

            var column = match[1].length;
            var openBracePos = doc.findMatchingBracket({ row: row, column: column });

            if (!openBracePos || openBracePos.row == row) return 0;

            var indent = this.$getIndent(doc.getLine(openBracePos.row));
            doc.replace(new Range(row, 0, row, column - 1), indent);
        };

        this.$getIndent = function (line) {
            return line.match(/^\s*/)[0];
        };

    }).call(MatchingBraceOutdent.prototype);

    exports.MatchingBraceOutdent = MatchingBraceOutdent;
});
