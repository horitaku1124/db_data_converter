"use strict";

const constant = require('../js/node_constant');
const Node = require('../js/query_node');

module.exports = class QueryParser {
    constructor(global)
    {
        this._global = global;
    }
    test() {
        return constant.TYPE_NONE;
    }
    static exeVerse(type, queryTokens, verse) {
        if(type === constant.TYPE_COLUMN) {
            queryTokens.columns.push(verse);
        }
        if(type === constant.TYPE_FROM) {
            queryTokens.froms.push(verse);
        }
        if(type === constant.TYPE_WHERE) {
            if(/^and$/i.test(verse)) {
                verse = verse.toUpperCase();
            }
            queryTokens.wheres.push(verse);
        }
        if(type === constant.TYPE_VALUES) {
            queryTokens.values.push(verse);
        }
    }

    static makeSyntaxTree(queryType, queryTokens)
    {
        let root = new Node();
        switch (queryType) {
            case "select":
                root.type = constant.NODE_TYPE_SELECT;
                break;
            case "update":
                root.type = constant.NODE_TYPE_UPDATE;
                break;
            case "insert":
                root.type = constant.NODE_TYPE_INSERT;
                break;
            case "delete":
                root.type = constant.NODE_TYPE_DELETE;
                break;
            default:
                throw Error("error");
                break;
        }

        if(root.type === constant.NODE_TYPE_SELECT || root.type === constant.NODE_TYPE_INSERT){
            let columnNode = new Node(constant.NODE_CHILD_TYPE_COLUMN);

            if(root.type === constant.NODE_TYPE_INSERT) {
                let into = queryTokens.columns[0].toLowerCase();
                if(into !== "into") {
                    throw Error('INSERT "INTO" error');
                }

                let node = new Node(constant.NODE_CHILD_TYPE_INTO, queryTokens.columns[1]);
                root.addChild(node);
            }

            for(let i = 2;i < queryTokens.columns.length;i++) {
                let column = queryTokens.columns[i];
                if(column !== "," && column !== "("  && column !== ")") {
                    let node = new Node(constant.NODE_VALUE, column);
                    columnNode.addChild(node);
                }
            }
            root.addChild(columnNode);
        }
        if(root.type === constant.NODE_TYPE_SELECT || root.type === constant.NODE_TYPE_UPDATE ||  root.type === constant.NODE_TYPE_DELETE){
            let fromNode = new Node(constant.NODE_CHILD_TYPE_FROM);

            for(let i = 0;i < queryTokens.froms.length;i++) {
                let column = queryTokens.froms[i];
                if(column !== ",") {
                    let node = new Node(constant.NODE_VALUE, column);
                    fromNode.addChild(node);
                }
            }
            root.addChild(fromNode);
        }
        if(root.type === constant.NODE_TYPE_SELECT || root.type === constant.NODE_TYPE_UPDATE ||  root.type === constant.NODE_TYPE_DELETE){
            let whereNode = new Node(constant.NODE_CHILD_TYPE_WHERE);

            let length = queryTokens.wheres.length;
            for(let i = 0;i < length;i++) {
                let column = queryTokens.wheres[i];

                if(column === ",") {
                    continue;
                }
                if(column === "AND") {
                    let node = new Node(constant.NODE_VALUE, "AND");
                    whereNode.addChild(node);
                    continue;
                }
                let formulas = [column];
                for(let j = 0;j < 2;j++) {
                    if((i + 2 <= length) &&  queryTokens.wheres[i + 1] !== "and") {
                        formulas.push(queryTokens.wheres[i + 1]);
                        i++;
                    } else {
                        break;
                    }
                }
                let node = new Node(constant.NODE_VALUE, formulas);
                whereNode.addChild(node);
            }
            root.addChild(whereNode);
        }
        if(root.type === constant.NODE_TYPE_INSERT){
            let valuesNode, nestDepth = 0;

            for(let i = 0;i < queryTokens.values.length;i++) {
                let column = queryTokens.values[i];
                if(column === ";") {
                    break;
                }
                if(column === '(') {
                    valuesNode = new Node(constant.NODE_CHILD_TYPE_VALUES);
                    nestDepth++;
                }
                if(column === ')') {
                    root.addChild(valuesNode);
                    nestDepth--;
                }
                if(/[a-zA-Z0-9\_]+/.test(column)) {
                    let next = queryTokens.values[i + 1] !== undefined ? queryTokens.values[i + 1] : null;
                    let next2 = queryTokens.values[i + 2] !== undefined ? queryTokens.values[i + 2] : null;
                    if(next === "(" && next2 === ")") {
                        let node = new Node(constant.NODE_VALUE, column + next + next2);
                        valuesNode.addChild(node);
                        i += 2;
                        continue;
                    }
                }
                // Value type
                if(column !== "," && column !== "("  && column !== ")") {
                    // if(column.indexOf("\\") >= 0) {
                    //     column = QueryParser.escapeByCharacter(column);
                    // }
                    let node = new Node(constant.NODE_VALUE, column);
                    valuesNode.addChild(node);
                }
            }
            let nameCount = root.children[1].children.length;
            for(let i = 2;i < root.children.length;i++) {
                if(nameCount !== root.children[i].children.length) {
                    throw new Error("length error");
                }
            }
        }
        return root;
    }

    static escapeByCharacter(chars) {
        let index = 0;
        while(true) {
            index = chars.indexOf("\\", index);
            if(index < 0) {
                break;
            }
            let c = chars.charAt(index + 1);
            let replaceTo = " ";
            switch (c) {
                case "'":
                    replaceTo = "'";
                    break;
                case "\"":
                    replaceTo = "\"";
                    break;
                case "n":
                    replaceTo = "\n";
                    break;
                default:
                    break;
            }
            chars = chars.substring(0, index) + replaceTo + chars.substring(index + 2);
            index--;
        }
        return chars;
    }


    convert(sql)
    {
        let queryTokens = {
            columns: [],
            froms: [],
            wheres: [],
            values: [],
            into: null
        };
        let queryTokensList = [];

        let verse = "", quote = null, queryType;
        let queryTypeDecided = false;
        let type = constant.TYPE_NONE;
        for(let i = 0;i < sql.length;i++) {
            const char = sql[i];
            if(quote !== null) {
                if(char === quote) {
                    quote = null;
                    QueryParser.exeVerse(type, queryTokens, verse);
                    verse = "";
                } else {
                    verse += char;
                }
                continue;
            }
            if(char === '\'' || char === '"' || char === '`') {
                quote = char;
            } else if(char === ' ' || char === '\t' || char === '\r' || char === '\n') {
                let verse2 = verse.toLowerCase();
                if(verse2 === "select" || verse2 === "insert") {
                    type = constant.TYPE_COLUMN;
                    queryType = verse2;
                    queryTypeDecided = true;
                } else if(verse2 === "from") {
                    type = constant.TYPE_FROM;
                } else if(verse2 === "where") {
                    type = constant.TYPE_WHERE;
                } else if(verse2 === "values") {
                    type = constant.TYPE_VALUES;
                } else {
                    if(verse !== "") {
                        QueryParser.exeVerse(type, queryTokens, verse);
                    }
                }
                verse = "";
            } else if(char === ',' || char === '(' || char === ')') {
                if(verse !== "") {
                    QueryParser.exeVerse(type, queryTokens, verse);
                }
                QueryParser.exeVerse(type, queryTokens, char);
                verse = "";
            } else if(char === ';') {
                queryTokensList.push([queryType, queryTokens]);
                queryTokens = {
                    columns: [],
                    froms: [],
                    wheres: [],
                    values: [],
                    into: null
                };
            } else {
                verse += char;
            }
        }
        if(verse !== "") {
            QueryParser.exeVerse(queryType, queryTokens, verse);
        }
        if (queryTokens.columns.length > 0 && queryTokens.values.length > 0) {
            queryTokensList.push([type, queryTokens]);
        }

        let parseResultList = [];
        for (let [queryType, queryTokens] of queryTokensList) {
            let syntaxTree = QueryParser.makeSyntaxTree(queryType, queryTokens);

            let selectors = [], froms = [], wheres = [], records = [], into = null;
            for(let i = 0;i < syntaxTree.children.length;i++) {
                let node = syntaxTree.children[i];
                if(node.type === constant.NODE_CHILD_TYPE_COLUMN) {
                    for(let child of node.children) {
                        selectors.push(child.value);
                    }
                }
                if(node.type === constant.NODE_CHILD_TYPE_FROM) {
                    for(let child of node.children) {
                        froms.push(child.value);
                    }
                }
                if(node.type === constant.NODE_CHILD_TYPE_WHERE) {
                    for(let child of node.children) {
                        wheres.push(child.value);
                    }
                }
                if(node.type === constant.NODE_CHILD_TYPE_VALUES) {
                    let values = [];
                    for(let child of node.children) {
                        values.push(child.value);
                    }
                    records.push(values);
                }
                if(node.type === constant.NODE_CHILD_TYPE_INTO) {
                    into = node.value;
                }
            }
            let parseResult = {type: queryType};
            if(queryType === "select" || queryType === "update" || queryType === "delete") {
                let dataSource = fromToDataSource(this._global, froms);
                dataSource = filterByWhere(dataSource, wheres, selectors);
                parseResult["dataSource"] = dataSource;
                parseResultList.push(parseResult);
            } else if(queryType === "insert") {
                parseResult["selectors"] = selectors;
                parseResult["records"] = records;
                parseResult["into"] = into;
                parseResultList.push(parseResult);
            }
        }
        return parseResultList;
    }
};