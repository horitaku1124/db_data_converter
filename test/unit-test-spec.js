"use strict";

const assert = require('assert');
const queryParser = require('../js/query_parser');

describe('Testing Query Parser', function() {
    it('Parse Insert Query', function() {
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