"use strict";


module.exports = class SeparatedValue {
    static parse(str) {
        let columns = [];
        let inSingleQuote = false;
        let textBuff = "";
        for (let i = 0;i < str.length;i++) {
            let char = str.substring(i, i + 1);
            if (char === '\'') {
                if (inSingleQuote) {
                    if (str.length - 1 === i) {
                        columns.push("'" + textBuff + "'");
                        textBuff = "";
                        continue;
                    }
                    let nextChar = str.substring(i + 1, i + 2);

                    if (nextChar === ',') {
                        columns.push("'" + textBuff + "'");
                        textBuff = "";

                        i++;
                        let nextNextChar = str.substring(i + 1, i + 2);
                        if (nextNextChar === ' ') {
                            i++;
                        }
                    }
                    inSingleQuote = false;
                } else {
                    inSingleQuote = true;
                }
            } else if (inSingleQuote) {
                textBuff += char;
            } else {
                textBuff += char;
                let nextChar = str.substring(i + 1, i + 2);
                if (nextChar === ',') {
                    columns.push(textBuff);
                    textBuff = '';
                    i++;
                    let nextNextChar = str.substring(i + 1, i + 2);
                    if (nextNextChar === ' ') {
                        i++;
                    }
                }
            }
        }
        if (textBuff !== '') {
            if (inSingleQuote) {
                columns.push("'" + textBuff + "'");
            } else {
                columns.push(textBuff);
            }
        }
        return columns;
    }
};