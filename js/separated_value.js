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
                    let nextChar = str.substring(i + 1, i + 2);
                    if (nextChar === ',') {
                        columns.push(textBuff);
                        textBuff = "";

                        i++;
                        let nextNextChar = str.substring(i + 1, i + 2);
                        if (nextNextChar === ' ') {
                            i++;
                        }
                    }
                } else {

                }
                inSingleQuote = true;
            } else {
                textBuff += char;
            }
        }
        if (textBuff !== '') {
            columns.push(textBuff);
        }
        return columns;
    }
};