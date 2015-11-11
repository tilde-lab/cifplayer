// The MIT License (MIT)
// Copyright (c) 2014 jballant
// https://github.com/jballant/webpack-strip-block

"use strict";

function StripBlockLoader(content) {

    this.startComment = 'REMBLOCK:START';
    this.endComment = 'REMBLOCK:END';

    this.regexPattern = new RegExp("[\\t ]*\\/\\* ?" + this.startComment + " ?\\*\\/[\\s\\S]*?\\/\\* ?" + this.endComment + " ?\\*\\/[\\t ]*\\n?", "g");

    content = content.replace(this.regexPattern, '');

    this.callback(null, content);
}

module.exports = StripBlockLoader;
