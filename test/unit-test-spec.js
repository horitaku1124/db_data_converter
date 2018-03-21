"use strict";

const assert = require('assert');
const queryParser = require('../js/query_parser');
const pluginRemoveNulls = require('../js/plugin_removenulls.js');

describe('Testing Query Parser', () => {
    it('Parse Insert Query', () => {
        let qp = new queryParser({});
        let result = qp.convert("INSERT INTO table1(a,b) VALUES (1,2);");
        assert(result.length === 1);
        assert(result[0].into === 'table1');
        assert(result[0].selectors.length === 2);
        assert(result[0].selectors[0] === 'a');
        assert(result[0].selectors[1] === 'b');
        assert(result[0].records.length === 1);
        assert(result[0].records[0][0] === '1');
        assert(result[0].records[0][1] === '2');


        result = qp.convert("INSERT INTO table2(a,b) VALUES (1,2),(3,4);");
        assert(result.length === 1);
        assert(result[0].into === 'table2');
        assert(result[0].selectors.length === 2);
        assert(result[0].selectors[0] === 'a');
        assert(result[0].records.length === 2);
        assert(result[0].records[1][1] === '4');
    });
});
const NullValue = Symbol('NULL');

describe('Plugin Remove Null', () => {
    it('dont change', () => {
        let rn = new pluginRemoveNulls();
        const header = ['id', 'name', 'age'];
        const data1 = [
            // [new SQLValue(1), new SQLValue('a'), new SQLValue(10)],
            // [new SQLValue(2), new SQLValue('b'), new SQLValue(20)],
        ]
        let [resultHeader, resultBody] = rn.performe(header, data1, NullValue);
        assert.equal(resultHeader.length, 3);
        // assert.equal(resultBody.length, 2);
        // assert.equal(resultBody[0].length, 3);
        // assert.equal(resultBody[0][0], 1);
        // assert.equal(resultBody[0][1], 'a');
        // assert.equal(resultBody[0][2], 10);
    });
});