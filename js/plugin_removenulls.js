"use strict";

module.exports = class PluginRemoveNulls {
    performe(headerCells, bodyData, SQLValue_NULL) {
        let newHeaderCells = [], newBodyData = [];
        let toRemoveCols = [];
        for (let i = 0;i < headerCells.length;i++) {
            let everyNull = bodyData.every(e => e[i].type === SQLValue_NULL);
            if (bodyData.length > 0 && everyNull) {
                toRemoveCols.push(i);
            } else {
                newHeaderCells.push(headerCells[i]);
            }
        }
        for (let i = 0;i < bodyData.length;i++) {
            let row = bodyData[i];
            let newRow = [];
            for (let j = 0;j < headerCells.length;j++) {
                if (!toRemoveCols.includes(j)) {
                    newRow.push(row[j]);
                }
            }
            newBodyData.push(newRow);
        }
        return [newHeaderCells, newBodyData];
    }
};