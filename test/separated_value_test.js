"use strict";

const assert = require('assert');
const separatedValue = require('../js/separated_value.js');

describe('Testing Separated Value', () => {
    it('Parse Value with quote', () => {
        let rows = separatedValue.parse("'1', 'Name1', 'ok'");
        assert.equal(rows.length, 3);
        assert.equal(rows[0], '\'1\'');
        assert.equal(rows[1], '\'Name1\'');
        assert.equal(rows[2], '\'ok\'');
    });
    it('Parse Value without quote', () => {
        let rows = separatedValue.parse("1, NULL, 'ok', 'ng'");
        assert.equal(rows.length, 4);
        assert.equal(rows[0], '1');
        assert.equal(rows[1], 'NULL');
        assert.equal(rows[2], '\'ok\'');
        assert.equal(rows[3], '\'ng\'');
        rows = separatedValue.parse("'6', NULL, 'NG'");
        assert.equal(rows.length, 3);
        assert.equal(rows[0], '\'6\'');
        assert.equal(rows[1], 'NULL');
        assert.equal(rows[2], '\'NG\'');
    });
    it('Parse Value contains comma', () => {
        let rows = separatedValue.parse("'4', 'A, B, C, D', 'ok'");
        assert.equal(rows.length, 3);
        assert.equal(rows[0], '\'4\'');
        assert.equal(rows[1], '\'A, B, C, D\'');
        assert.equal(rows[2], '\'ok\'');
    });
    it('Parse NULL type', () => {
        let rows = separatedValue.parse("'5', '', NULL");
        assert.equal(rows.length, 3);
        assert.equal(rows[0], '\'5\'');
        assert.equal(rows[1], '\'\'');
        assert.equal(rows[2], 'NULL');
    });
});