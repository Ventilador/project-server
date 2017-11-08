const map = Object.create(null);
export function parse(key: string) {
    if (key in map) {
        return map[key];
    }
    if (key === 'hasOwnProperty' || key === 'constructor') {
        throw 'Invalid expression';
    }
    return map[key] = makeFn(key);
}

function makeFn(key: string) {
    (fn as any).assign = assign;
    return fn;
    function fn(obj: any, locals: any) {
        if (locals && (key in locals)) {
            return locals[key];
        }
        return obj && obj[key];
    }
    function assign(obj: any, newVal: any) {
        if (obj) {
            obj[key] = newVal;
        }
    }
}

// angular parse cleaned a bit
// import { createMap } from './createMap';
// import { lowercase, copy, noop, csp } from './utility';
// import { isDefined, isString, isNumber, isFunction } from './typeChecks';
// import { forEach } from './forEach';


// let $parseMinErr = function (...args: any[]) { };

// let objectValueOf = Object.prototype.valueOf;




// function getStringValue(name) {
//     return name + '';
// }

// function isValidIdentifierStart(ch) {
//     return ('a' <= ch && ch <= 'z' ||
//         'A' <= ch && ch <= 'Z' ||
//         '_' === ch || ch === '$');
// }

// function isNumberLex(ch) {
//     return ('0' <= ch && ch <= '9') && typeof ch === 'string';
// }

// function isWhitespace(ch) {
//     return (ch === ' ' || ch === '\r' || ch === '\t' ||
//         ch === '\n' || ch === '\v');
// }
// function is(ch, chars) {
//     return chars.indexOf(ch) !== -1;
// }

// function isValidIdentifierContinue(ch) {
//     return isValidIdentifierStart(ch) || isNumberLex(ch);
// }

// function isExpOperator(ch) {
//     return (ch === '-' || ch === '+' || isNumberLex(ch));
// }

// const OPERATORS = createMap();
// forEach('+ - * / % === !== == != < > <= >= && || ! = |'.split(' '), function (operator) { OPERATORS[operator] = true; });
// const ESCAPE = { 'n': '\n', 'f': '\f', 'r': '\r', 't': '\t', 'v': '\v', '\'': '\'', '"': '"' };

// export function Lexer() {
//     this.index = 0;
//     this.tokens = [];
//     this.text = null;
// };

// Lexer.prototype = {
//     constructor: Lexer,

//     lex: function (text: string) {
//         this.text = text;

//         while (this.index < this.text.length) {
//             let ch = this.text[this.index];
//             if (ch === '"' || ch === '\'') {
//                 this.readString(ch);
//             } else if (isNumberLex(ch) || ch === '.' && isNumberLex(this.peek())) {
//                 this.readNumber();
//             } else if (this.isValidIdentifierStart(this.peekMultichar())) {
//                 this.readIdent();
//             } else if (is(ch, '(){}[].,;:?')) {
//                 this.tokens.push({ index: this.index, text: ch });
//                 this.index++;
//             } else if (isWhitespace(ch)) {
//                 this.index++;
//             } else {
//                 let ch2 = ch + this.peek();
//                 let ch3 = ch2 + this.peek(2);
//                 let op1 = OPERATORS[ch];
//                 let op2 = OPERATORS[ch2];
//                 let op3 = OPERATORS[ch3];
//                 if (op1 || op2 || op3) {
//                     let token = op3 ? ch3 : (op2 ? ch2 : ch);
//                     this.tokens.push({ index: this.index, text: token, operator: true });
//                     this.index += token.length;
//                 } else {
//                     this.throwError('Unexpected next character ', this.index, this.index + 1);
//                 }
//             }
//         }
//         const toReturn = this.tokens;
//         this.index = 0;
//         this.tokens = [];
//         this.text = null;
//         return toReturn;
//     },

//     peek: function (i) {
//         let num = i || 1;
//         return (this.index + num < this.text.length) ? this.text[this.index + num] : false;
//     },


//     peekMultichar: function () {
//         let ch = this.text[this.index];
//         let peek = this.peek();
//         if (!peek) {
//             return ch;
//         }
//         let cp1 = ch.charCodeAt(0);
//         let cp2 = peek.charCodeAt(0);
//         if (cp1 >= 0xD800 && cp1 <= 0xDBFF && cp2 >= 0xDC00 && cp2 <= 0xDFFF) {
//             return ch + peek;
//         }
//         return ch;
//     },

//     throwError: function (error, start, end) {
//         end = end || this.index;
//         let colStr = (isDefined(start)
//             ? 's ' + start + '-' + this.index + ' [' + this.text.substring(start, end) + ']'
//             : ' ' + end);
//         throw 'Lexer Error: ' + error + ' at column' + colStr + ' in expression [' + this.text + '].';
//     },

//     readNumber: function () {
//         let number = '';
//         let start = this.index;
//         while (this.index < this.text.length) {
//             let ch = lowercase(this.text[this.index]);
//             if (ch === '.' || isNumberLex(ch)) {
//                 number += ch;
//             } else {
//                 let peekCh = this.peek();
//                 if (ch === 'e' && isExpOperator(peekCh)) {
//                     number += ch;
//                 } else if (isExpOperator(ch) &&
//                     peekCh && isNumberLex(peekCh) &&
//                     number[number.length - 1] === 'e') {
//                     number += ch;
//                 } else if (isExpOperator(ch) &&
//                     (!peekCh || !isNumberLex(peekCh)) &&
//                     number[number.length - 1] === 'e') {
//                     this.throwError('Invalid exponent');
//                 } else {
//                     break;
//                 }
//             }
//             this.index++;
//         }
//         this.tokens.push({
//             index: start,
//             text: number,
//             constant: true,
//             value: Number(number)
//         });
//     },

//     readIdent: function () {
//         let start = this.index;
//         this.index += this.peekMultichar().length;
//         while (this.index < this.text.length) {
//             let ch = this.peekMultichar();
//             if (!isValidIdentifierContinue(ch)) {
//                 break;
//             }
//             this.index += ch.length;
//         }
//         this.tokens.push({
//             index: start,
//             text: this.text.slice(start, this.index),
//             identifier: true
//         });
//     },

//     readString: function (quote) {
//         let start = this.index;
//         this.index++;
//         let string = '';
//         let rawString = quote;
//         let escape = false;
//         while (this.index < this.text.length) {
//             let ch = this.text[this.index];
//             rawString += ch;
//             if (escape) {
//                 if (ch === 'u') {
//                     let hex = this.text.substring(this.index + 1, this.index + 5);
//                     if (!hex.match(/[\da-f]{4}/i)) {
//                         this.throwError('Invalid unicode escape [\\u' + hex + ']');
//                     }
//                     this.index += 4;
//                     string += String.fromCharCode(parseInt(hex, 16));
//                 } else {
//                     let rep = ESCAPE[ch];
//                     string = string + (rep || ch);
//                 }
//                 escape = false;
//             } else if (ch === '\\') {
//                 escape = true;
//             } else if (ch === quote) {
//                 this.index++;
//                 this.tokens.push({
//                     index: start,
//                     text: rawString,
//                     constant: true,
//                     value: string
//                 });
//                 return;
//             } else {
//                 string += ch;
//             }
//             this.index++;
//         }
//         this.throwError('Unterminated quote', start);
//     }
// };

// let AST: any = function AST(lexer, options) {
//     this.lexer = lexer;
//     this.options = options;
// };

// AST.Program = 'Program';
// AST.ExpressionStatement = 'ExpressionStatement';
// AST.AssignmentExpression = 'AssignmentExpression';
// AST.ConditionalExpression = 'ConditionalExpression';
// AST.LogicalExpression = 'LogicalExpression';
// AST.BinaryExpression = 'BinaryExpression';
// AST.UnaryExpression = 'UnaryExpression';
// AST.CallExpression = 'CallExpression';
// AST.MemberExpression = 'MemberExpression';
// AST.Identifier = 'Identifier';
// AST.Literal = 'Literal';
// AST.ArrayExpression = 'ArrayExpression';
// AST.Property = 'Property';
// AST.ObjectExpression = 'ObjectExpression';
// AST.ThisExpression = 'ThisExpression';
// AST.LocalsExpression = 'LocalsExpression';

// // Internal use only
// AST.NGValueParameter = 'NGValueParameter';

// AST.prototype = {
//     ast: function (text) {
//         this.text = text;
//         this.tokens = this.lexer.lex(text);

//         let value = this.program();

//         if (this.tokens.length !== 0) {
//             this.throwError('is an unexpected token', this.tokens[0]);
//         }

//         return value;
//     },

//     program: function () {
//         let body = [];
//         while (true) {
//             if (this.tokens.length > 0 && !this.peek('}', ')', ';', ']')) {
//                 body.push(this.expressionStatement());
//             }
//             if (!this.expect(';')) {
//                 return { type: AST.Program, body: body };
//             }
//         }
//     },

//     expressionStatement: function () {
//         return { type: AST.ExpressionStatement, expression: this.filterChain() };
//     },

//     filterChain: function () {
//         let left = this.expression();
//         while (this.expect('|')) {
//             left = this.filter(left);
//         }
//         return left;
//     },

//     expression: function () {
//         return this.assignment();
//     },

//     assignment: function () {
//         let result = this.ternary();
//         if (this.expect('=')) {
//             if (!isAssignable(result)) {
//                 throw $parseMinErr('lval', 'Trying to assign a value to a non l-value');
//             }

//             result = { type: AST.AssignmentExpression, left: result, right: this.assignment(), operator: '=' };
//         }
//         return result;
//     },

//     ternary: function () {
//         let test = this.logicalOR();
//         let alternate;
//         let consequent;
//         if (this.expect('?')) {
//             alternate = this.expression();
//             if (this.consume(':')) {
//                 consequent = this.expression();
//                 return { type: AST.ConditionalExpression, test: test, alternate: alternate, consequent: consequent };
//             }
//         }
//         return test;
//     },

//     logicalOR: function () {
//         let left = this.logicalAND();
//         while (this.expect('||')) {
//             left = { type: AST.LogicalExpression, operator: '||', left: left, right: this.logicalAND() };
//         }
//         return left;
//     },

//     logicalAND: function () {
//         let left = this.equality();
//         while (this.expect('&&')) {
//             left = { type: AST.LogicalExpression, operator: '&&', left: left, right: this.equality() };
//         }
//         return left;
//     },

//     equality: function () {
//         let left = this.relational();
//         let token;
//         while ((token = this.expect('==', '!=', '===', '!=='))) {
//             left = { type: AST.BinaryExpression, operator: token.text, left: left, right: this.relational() };
//         }
//         return left;
//     },

//     relational: function () {
//         let left = this.additive();
//         let token;
//         while ((token = this.expect('<', '>', '<=', '>='))) {
//             left = { type: AST.BinaryExpression, operator: token.text, left: left, right: this.additive() };
//         }
//         return left;
//     },

//     additive: function () {
//         let left = this.multiplicative();
//         let token;
//         while ((token = this.expect('+', '-'))) {
//             left = { type: AST.BinaryExpression, operator: token.text, left: left, right: this.multiplicative() };
//         }
//         return left;
//     },

//     multiplicative: function () {
//         let left = this.unary();
//         let token;
//         while ((token = this.expect('*', '/', '%'))) {
//             left = { type: AST.BinaryExpression, operator: token.text, left: left, right: this.unary() };
//         }
//         return left;
//     },

//     unary: function () {
//         let token;
//         if ((token = this.expect('+', '-', '!'))) {
//             return { type: AST.UnaryExpression, operator: token.text, prefix: true, argument: this.unary() };
//         } else {
//             return this.primary();
//         }
//     },

//     primary: function () {
//         let primary;
//         if (this.expect('(')) {
//             primary = this.filterChain();
//             this.consume(')');
//         } else if (this.expect('[')) {
//             primary = this.arrayDeclaration();
//         } else if (this.expect('{')) {
//             primary = this.object();
//         } else if (this.selfReferential.hasOwnProperty(this.peek().text)) {
//             primary = copy(this.selfReferential[this.consume().text]);
//         } else if (this.options.literals.hasOwnProperty(this.peek().text)) {
//             primary = { type: AST.Literal, value: this.options.literals[this.consume().text] };
//         } else if (this.peek().identifier) {
//             primary = this.identifier();
//         } else if (this.peek().constant) {
//             primary = this.constant();
//         } else {
//             this.throwError('not a primary expression', this.peek());
//         }

//         let next;
//         while ((next = this.expect('(', '[', '.'))) {
//             if (next.text === '(') {
//                 primary = { type: AST.CallExpression, callee: primary, arguments: this.parseArguments() };
//                 this.consume(')');
//             } else if (next.text === '[') {
//                 primary = { type: AST.MemberExpression, object: primary, property: this.expression(), computed: true };
//                 this.consume(']');
//             } else if (next.text === '.') {
//                 primary = { type: AST.MemberExpression, object: primary, property: this.identifier(), computed: false };
//             } else {
//                 this.throwError('IMPOSSIBLE');
//             }
//         }
//         return primary;
//     },

//     filter: function (baseExpression) {
//         let args = [baseExpression];
//         let result = { type: AST.CallExpression, callee: this.identifier(), arguments: args, filter: true };

//         while (this.expect(':')) {
//             args.push(this.expression());
//         }

//         return result;
//     },

//     parseArguments: function () {
//         let args = [];
//         if (this.peekToken().text !== ')') {
//             do {
//                 args.push(this.filterChain());
//             } while (this.expect(','));
//         }
//         return args;
//     },

//     identifier: function () {
//         let token = this.consume();
//         if (!token.identifier) {
//             this.throwError('is not a valid identifier', token);
//         }
//         return { type: AST.Identifier, name: token.text };
//     },

//     constant: function () {
//         // TODO check that it is a constant
//         return { type: AST.Literal, value: this.consume().value };
//     },

//     arrayDeclaration: function () {
//         let elements = [];
//         if (this.peekToken().text !== ']') {
//             do {
//                 if (this.peek(']')) {
//                     // Support trailing commas per ES5.1.
//                     break;
//                 }
//                 elements.push(this.expression());
//             } while (this.expect(','));
//         }
//         this.consume(']');

//         return { type: AST.ArrayExpression, elements: elements };
//     },

//     object: function () {
//         let properties = [], property;
//         if (this.peekToken().text !== '}') {
//             do {
//                 if (this.peek('}')) {
//                     // Support trailing commas per ES5.1.
//                     break;
//                 }
//                 property = { type: AST.Property, kind: 'init' };
//                 if (this.peek().constant) {
//                     property.key = this.constant();
//                     property.computed = false;
//                     this.consume(':');
//                     property.value = this.expression();
//                 } else if (this.peek().identifier) {
//                     property.key = this.identifier();
//                     property.computed = false;
//                     if (this.peek(':')) {
//                         this.consume(':');
//                         property.value = this.expression();
//                     } else {
//                         property.value = property.key;
//                     }
//                 } else if (this.peek('[')) {
//                     this.consume('[');
//                     property.key = this.expression();
//                     this.consume(']');
//                     property.computed = true;
//                     this.consume(':');
//                     property.value = this.expression();
//                 } else {
//                     this.throwError('invalid key', this.peek());
//                 }
//                 properties.push(property);
//             } while (this.expect(','));
//         }
//         this.consume('}');

//         return { type: AST.ObjectExpression, properties: properties };
//     },

//     throwError: function (msg, token) {
//         throw $parseMinErr('syntax',
//             'Syntax Error: Token \'{0}\' {1} at column {2} of the expression [{3}] starting at [{4}].',
//             token.text, msg, (token.index + 1), this.text, this.text.substring(token.index));
//     },

//     consume: function (e1) {
//         if (this.tokens.length === 0) {
//             throw $parseMinErr('ueoe', 'Unexpected end of expression: {0}', this.text);
//         }

//         let token = this.expect(e1);
//         if (!token) {
//             this.throwError('is unexpected, expecting [' + e1 + ']', this.peek());
//         }
//         return token;
//     },

//     peekToken: function () {
//         if (this.tokens.length === 0) {
//             throw $parseMinErr('ueoe', 'Unexpected end of expression: {0}', this.text);
//         }
//         return this.tokens[0];
//     },

//     peek: function (e1, e2, e3, e4) {
//         return this.peekAhead(0, e1, e2, e3, e4);
//     },

//     peekAhead: function (i, e1, e2, e3, e4) {
//         if (this.tokens.length > i) {
//             let token = this.tokens[i];
//             let t = token.text;
//             if (t === e1 || t === e2 || t === e3 || t === e4 ||
//                 (!e1 && !e2 && !e3 && !e4)) {
//                 return token;
//             }
//         }
//         return false;
//     },

//     expect: function (e1, e2, e3, e4) {
//         let token = this.peek(e1, e2, e3, e4);
//         if (token) {
//             this.tokens.shift();
//             return token;
//         }
//         return false;
//     },

//     selfReferential: {
//         'this': { type: AST.ThisExpression },
//         '$locals': { type: AST.LocalsExpression }
//     }
// };

// function ifDefined(v, d) {
//     return typeof v !== 'undefined' ? v : d;
// }

// function plusFn(l, r) {
//     if (typeof l === 'undefined') { return r; }
//     if (typeof r === 'undefined') { return l; }
//     return l + r;
// }



// // let PURITY_ABSOLUTE = 1;
// let PURITY_RELATIVE = 2;



// function getInputs(body) {
//     if (body.length !== 1) { return; }
//     let lastExpression = body[0].expression;
//     let candidate = lastExpression.toWatch;
//     if (candidate.length !== 1) { return candidate; }
//     return candidate[0] !== lastExpression ? candidate : undefined;
// }

// function isAssignable(ast) {
//     return ast.type === AST.Identifier || ast.type === AST.MemberExpression;
// }

// function assignableAST(ast) {
//     if (ast.body.length === 1 && isAssignable(ast.body[0].expression)) {
//         return { type: AST.AssignmentExpression, left: ast.body[0].expression, right: { type: AST.NGValueParameter }, operator: '=' };
//     }
// }

// function isLiteral(ast) {
//     return ast.body.length === 0 ||
//         ast.body.length === 1 && (
//             ast.body[0].expression.type === AST.Literal ||
//             ast.body[0].expression.type === AST.ArrayExpression ||
//             ast.body[0].expression.type === AST.ObjectExpression);
// }

// function isConstant(ast) {
//     return ast.constant;
// }

// function ASTCompiler() {

// }

// ASTCompiler.prototype = {
//     compile: function (ast) {
//         let self = this;
//         this.state = {
//             nextId: 0,
//             filters: {},
//             fn: { vars: [], body: [], own: {} },
//             assign: { vars: [], body: [], own: {} },
//             inputs: []
//         };
//         let extra = '';
//         let assignable;
//         this.stage = 'assign';
//         if ((assignable = assignableAST(ast))) {
//             this.state.computing = 'assign';
//             let result = this.nextId();
//             this.recurse(assignable, result);
//             this.return_(result);
//             extra = 'fn.assign=' + this.generateFunction('assign', 's,v,l');
//         }
//         let toWatch = getInputs(ast.body);
//         self.stage = 'inputs';
//         forEach(toWatch, function (watch, key) {
//             let fnKey = 'fn' + key;
//             self.state[fnKey] = { vars: [], body: [], own: {} };
//             self.state.computing = fnKey;
//             let intoId = self.nextId();
//             self.recurse(watch, intoId);
//             self.return_(intoId);
//             self.state.inputs.push({ name: fnKey, isPure: watch.isPure });
//             watch.watchId = key;
//         });
//         this.state.computing = 'fn';
//         this.stage = 'main';
//         this.recurse(ast);
//         let fnString =
//             // The build and minification steps remove the string "use strict" from the code, but this is done using a regex.
//             // This is a workaround for this until we do a better job at only removing the prefix only when we should.
//             '"' + this.USE + ' ' + this.STRICT + '";\n' +
//             'let fn=' + this.generateFunction('fn', 's,l,a,i') +
//             extra +
//             this.watchFns() +
//             'return fn;';

//         // eslint-disable-next-line no-new-func
//         let fn = (new Function('getStringValue',
//             'ifDefined',
//             'plus',
//             fnString))(
//             getStringValue,
//             ifDefined,
//             plusFn);
//         this.state = this.stage = undefined;
//         return fn;
//     },

//     USE: 'use',

//     STRICT: 'strict',

//     watchFns: function () {
//         let result = [];
//         let inputs = this.state.inputs;
//         let self = this;
//         forEach(inputs, function (input) {
//             result.push('let ' + input.name + '=' + self.generateFunction(input.name, 's'));
//             if (input.isPure) {
//                 result.push(input.name, '.isPure=' + JSON.stringify(input.isPure) + ';');
//             }
//         });
//         if (inputs.length) {
//             result.push('fn.inputs=[' + inputs.map(function (i) { return i.name; }).join(',') + '];');
//         }
//         return result.join('');
//     },

//     generateFunction: function (name, params) {
//         return 'function(' + params + '){' +
//             this.varsPrefix(name) +
//             this.body(name) +
//             '};';
//     },

//     varsPrefix: function (section) {
//         return this.state[section].vars.length ? 'let ' + this.state[section].vars.join(',') + ';' : '';
//     },

//     body: function (section) {
//         return this.state[section].body.join('');
//     },

//     recurse: function (ast, intoId, nameId, recursionFn, create, skipWatchIdCheck) {
//         let left, right, self = this, args, expression, computed;
//         recursionFn = recursionFn || noop;
//         if (!skipWatchIdCheck && isDefined(ast.watchId)) {
//             intoId = intoId || this.nextId();
//             this.if_('i',
//                 this.lazyAssign(intoId, this.computedMember('i', ast.watchId)),
//                 this.lazyRecurse(ast, intoId, nameId, recursionFn, create, true)
//             );
//             return;
//         }
//         switch (ast.type) {
//             case AST.Program:
//                 forEach(ast.body, function (expression, pos) {
//                     self.recurse(expression.expression, undefined, undefined, function (expr) { right = expr; });
//                     if (pos !== ast.body.length - 1) {
//                         self.current().body.push(right, ';');
//                     } else {
//                         self.return_(right);
//                     }
//                 });
//                 break;
//             case AST.Literal:
//                 expression = this.escape(ast.value);
//                 this.assign(intoId, expression);
//                 recursionFn(intoId || expression);
//                 break;
//             case AST.UnaryExpression:
//                 this.recurse(ast.argument, undefined, undefined, function (expr) { right = expr; });
//                 expression = ast.operator + '(' + this.ifDefined(right, 0) + ')';
//                 this.assign(intoId, expression);
//                 recursionFn(expression);
//                 break;
//             case AST.BinaryExpression:
//                 this.recurse(ast.left, undefined, undefined, function (expr) { left = expr; });
//                 this.recurse(ast.right, undefined, undefined, function (expr) { right = expr; });
//                 if (ast.operator === '+') {
//                     expression = this.plus(left, right);
//                 } else if (ast.operator === '-') {
//                     expression = this.ifDefined(left, 0) + ast.operator + this.ifDefined(right, 0);
//                 } else {
//                     expression = '(' + left + ')' + ast.operator + '(' + right + ')';
//                 }
//                 this.assign(intoId, expression);
//                 recursionFn(expression);
//                 break;
//             case AST.LogicalExpression:
//                 intoId = intoId || this.nextId();
//                 self.recurse(ast.left, intoId);
//                 self.if_(ast.operator === '&&' ? intoId : self.not(intoId), self.lazyRecurse(ast.right, intoId));
//                 recursionFn(intoId);
//                 break;
//             case AST.ConditionalExpression:
//                 intoId = intoId || this.nextId();
//                 self.recurse(ast.test, intoId);
//                 self.if_(intoId, self.lazyRecurse(ast.alternate, intoId), self.lazyRecurse(ast.consequent, intoId));
//                 recursionFn(intoId);
//                 break;
//             case AST.Identifier:
//                 intoId = intoId || this.nextId();
//                 if (nameId) {
//                     nameId.context = self.stage === 'inputs' ? 's' : this.assign(this.nextId(), this.getHasOwnProperty('l', ast.name) + '?l:s');
//                     nameId.computed = false;
//                     nameId.name = ast.name;
//                 }
//                 self.if_(self.stage === 'inputs' || self.not(self.getHasOwnProperty('l', ast.name)),
//                     function () {
//                         self.if_(self.stage === 'inputs' || 's', function () {
//                             if (create && create !== 1) {
//                                 self.if_(
//                                     self.isNull(self.nonComputedMember('s', ast.name)),
//                                     self.lazyAssign(self.nonComputedMember('s', ast.name), '{}'));
//                             }
//                             self.assign(intoId, self.nonComputedMember('s', ast.name));
//                         });
//                     }, intoId && self.lazyAssign(intoId, self.nonComputedMember('l', ast.name))
//                 );
//                 recursionFn(intoId);
//                 break;
//             case AST.MemberExpression:
//                 left = nameId && (nameId.context = this.nextId()) || this.nextId();
//                 intoId = intoId || this.nextId();
//                 self.recurse(ast.object, left, undefined, function () {
//                     self.if_(self.notNull(left), function () {
//                         if (ast.computed) {
//                             right = self.nextId();
//                             self.recurse(ast.property, right);
//                             self.getStringValue(right);
//                             if (create && create !== 1) {
//                                 self.if_(self.not(self.computedMember(left, right)), self.lazyAssign(self.computedMember(left, right), '{}'));
//                             }
//                             expression = self.computedMember(left, right);
//                             self.assign(intoId, expression);
//                             if (nameId) {
//                                 nameId.computed = true;
//                                 nameId.name = right;
//                             }
//                         } else {
//                             if (create && create !== 1) {
//                                 self.if_(self.isNull(self.nonComputedMember(left, ast.property.name)), self.lazyAssign(self.nonComputedMember(left, ast.property.name), '{}'));
//                             }
//                             expression = self.nonComputedMember(left, ast.property.name);
//                             self.assign(intoId, expression);
//                             if (nameId) {
//                                 nameId.computed = false;
//                                 nameId.name = ast.property.name;
//                             }
//                         }
//                     }, function () {
//                         self.assign(intoId, 'undefined');
//                     });
//                     recursionFn(intoId);
//                 }, !!create);
//                 break;
//             case AST.CallExpression:
//                 intoId = intoId || this.nextId();
//                 if (ast.filter) {
//                     right = self.filter(ast.callee.name);
//                     args = [];
//                     forEach(ast.arguments, function (expr) {
//                         let argument = self.nextId();
//                         self.recurse(expr, argument);
//                         args.push(argument);
//                     });
//                     expression = right + '(' + args.join(',') + ')';
//                     self.assign(intoId, expression);
//                     recursionFn(intoId);
//                 } else {
//                     right = self.nextId();
//                     left = {};
//                     args = [];
//                     self.recurse(ast.callee, right, left, function () {
//                         self.if_(self.notNull(right), function () {
//                             forEach(ast.arguments, function (expr) {
//                                 self.recurse(expr, ast.constant ? undefined : self.nextId(), undefined, function (argument) {
//                                     args.push(argument);
//                                 });
//                             });
//                             if (left.name) {
//                                 expression = self.member(left.context, left.name, left.computed) + '(' + args.join(',') + ')';
//                             } else {
//                                 expression = right + '(' + args.join(',') + ')';
//                             }
//                             self.assign(intoId, expression);
//                         }, function () {
//                             self.assign(intoId, 'undefined');
//                         });
//                         recursionFn(intoId);
//                     });
//                 }
//                 break;
//             case AST.AssignmentExpression:
//                 right = this.nextId();
//                 left = {};
//                 this.recurse(ast.left, undefined, left, function () {
//                     self.if_(self.notNull(left.context), function () {
//                         self.recurse(ast.right, right);
//                         expression = self.member(left.context, left.name, left.computed) + ast.operator + right;
//                         self.assign(intoId, expression);
//                         recursionFn(intoId || expression);
//                     });
//                 }, 1);
//                 break;
//             case AST.ArrayExpression:
//                 args = [];
//                 forEach(ast.elements, function (expr) {
//                     self.recurse(expr, ast.constant ? undefined : self.nextId(), undefined, function (argument) {
//                         args.push(argument);
//                     });
//                 });
//                 expression = '[' + args.join(',') + ']';
//                 this.assign(intoId, expression);
//                 recursionFn(intoId || expression);
//                 break;
//             case AST.ObjectExpression:
//                 args = [];
//                 computed = false;
//                 forEach(ast.properties, function (property) {
//                     if (property.computed) {
//                         computed = true;
//                     }
//                 });
//                 if (computed) {
//                     intoId = intoId || this.nextId();
//                     this.assign(intoId, '{}');
//                     forEach(ast.properties, function (property) {
//                         if (property.computed) {
//                             left = self.nextId();
//                             self.recurse(property.key, left);
//                         } else {
//                             left = property.key.type === AST.Identifier ?
//                                 property.key.name :
//                                 ('' + property.key.value);
//                         }
//                         right = self.nextId();
//                         self.recurse(property.value, right);
//                         self.assign(self.member(intoId, left, property.computed), right);
//                     });
//                 } else {
//                     forEach(ast.properties, function (property) {
//                         self.recurse(property.value, ast.constant ? undefined : self.nextId(), undefined, function (expr) {
//                             args.push(self.escape(
//                                 property.key.type === AST.Identifier ? property.key.name :
//                                     ('' + property.key.value)) +
//                                 ':' + expr);
//                         });
//                     });
//                     expression = '{' + args.join(',') + '}';
//                     this.assign(intoId, expression);
//                 }
//                 recursionFn(intoId || expression);
//                 break;
//             case AST.ThisExpression:
//                 this.assign(intoId, 's');
//                 recursionFn(intoId || 's');
//                 break;
//             case AST.LocalsExpression:
//                 this.assign(intoId, 'l');
//                 recursionFn(intoId || 'l');
//                 break;
//             case AST.NGValueParameter:
//                 this.assign(intoId, 'v');
//                 recursionFn(intoId || 'v');
//                 break;
//         }
//     },

//     getHasOwnProperty: function (element, property) {
//         let key = element + '.' + property;
//         let own = this.current().own;
//         if (!own.hasOwnProperty(key)) {
//             own[key] = this.nextId(false, element + '&&(' + this.escape(property) + ' in ' + element + ')');
//         }
//         return own[key];
//     },

//     assign: function (id, value) {
//         if (!id) { return; }
//         this.current().body.push(id, '=', value, ';');
//         return id;
//     },

//     filter: function (filterName) {
//         if (!this.state.filters.hasOwnProperty(filterName)) {
//             this.state.filters[filterName] = this.nextId(true);
//         }
//         return this.state.filters[filterName];
//     },

//     ifDefined: function (id, defaultValue) {
//         return 'ifDefined(' + id + ',' + this.escape(defaultValue) + ')';
//     },

//     plus: function (left, right) {
//         return 'plus(' + left + ',' + right + ')';
//     },

//     return_: function (id) {
//         this.current().body.push('return ', id, ';');
//     },

//     if_: function (test, alternate, consequent) {
//         if (test === true) {
//             alternate();
//         } else {
//             let body = this.current().body;
//             body.push('if(', test, '){');
//             alternate();
//             body.push('}');
//             if (consequent) {
//                 body.push('else{');
//                 consequent();
//                 body.push('}');
//             }
//         }
//     },

//     not: function (expression) {
//         return '!(' + expression + ')';
//     },

//     isNull: function (expression) {
//         return expression + '==null';
//     },

//     notNull: function (expression) {
//         return expression + '!=null';
//     },

//     nonComputedMember: function (left, right) {
//         let SAFE_IDENTIFIER = /^[$_a-zA-Z][$_a-zA-Z0-9]*$/;
//         let UNSAFE_CHARACTERS = /[^$_a-zA-Z0-9]/g;
//         if (SAFE_IDENTIFIER.test(right)) {
//             return left + '.' + right;
//         } else {
//             return left + '["' + right.replace(UNSAFE_CHARACTERS, this.stringEscapeFn) + '"]';
//         }
//     },

//     computedMember: function (left, right) {
//         return left + '[' + right + ']';
//     },

//     member: function (left, right, computed) {
//         if (computed) { return this.computedMember(left, right); }
//         return this.nonComputedMember(left, right);
//     },

//     getStringValue: function (item) {
//         this.assign(item, 'getStringValue(' + item + ')');
//     },

//     lazyRecurse: function (ast, intoId, nameId, recursionFn, create, skipWatchIdCheck) {
//         let self = this;
//         return function () {
//             self.recurse(ast, intoId, nameId, recursionFn, create, skipWatchIdCheck);
//         };
//     },

//     lazyAssign: function (id, value) {
//         let self = this;
//         return function () {
//             self.assign(id, value);
//         };
//     },

//     stringEscapeRegex: /[^ a-zA-Z0-9]/g,

//     stringEscapeFn: function (c) {
//         return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
//     },

//     escape: function (value) {
//         if (isString(value)) { return '\'' + value.replace(this.stringEscapeRegex, this.stringEscapeFn) + '\''; }
//         if (isNumber(value)) { return value.toString(); }
//         if (value === true) { return 'true'; }
//         if (value === false) { return 'false'; }
//         if (value === null) { return 'null'; }
//         if (typeof value === 'undefined') { return 'undefined'; }

//         throw $parseMinErr('esc', 'IMPOSSIBLE');
//     },

//     nextId: function (skip, init) {
//         let id = 'v' + (this.state.nextId++);
//         if (!skip) {
//             this.current().vars.push(id + (init ? '=' + init : ''));
//         }
//         return id;
//     },

//     current: function () {
//         return this.state[this.state.computing];
//     }
// };



// function Parser(lexer, options) {
//     this.ast = new AST(lexer, options);
//     this.astCompiler = new ASTCompiler();
// }

// Parser.prototype = {
//     constructor: Parser,

//     parse: function (text) {
//         let ast = this.ast.ast(text);
//         let fn = this.astCompiler.compile(ast);
//         fn.literal = isLiteral(ast);
//         fn.constant = isConstant(ast);
//         return fn;
//     }
// };

// function getValueOf(value) {
//     return isFunction(value.valueOf) ? value.valueOf() : objectValueOf.call(value);
// }
// const literals = {
//     'true': true,
//     'false': false,
//     'null': null,
//     'undefined': undefined
// };
// const options = {
//     csp: false,
//     literals: literals
// };
// const cache = createMap();
// export function $parse(text: string, interceptor?: Function) {
//     if (text in cache) {
//         return cache[text];
//     }
//     const lexer = new Lexer();
//     const parser = new Parser(lexer, options) as any;
//     const fn = parser.parse(text);
//     return addInterceptor(cache[text] = fn, interceptor);
// }

// function addInterceptor(parsedExpression, interceptorFn) {
//     if (!interceptorFn) { return parsedExpression; }

//     let useInputs = false;

//     let fn = function interceptedExpression(scope, locals, assign, inputs) {
//         let value = useInputs && inputs ? inputs[0] : parsedExpression(scope, locals, assign, inputs);
//         return interceptorFn(value);
//     };

//     // Maintain references to the interceptor/intercepted
//     (fn as any).$$intercepted = parsedExpression;
//     (fn as any).$$interceptor = interceptorFn;

//     // Propogate the literal/oneTime/constant attributes
//     (fn as any).literal = parsedExpression.literal;
//     (fn as any).oneTime = parsedExpression.oneTime;
//     (fn as any).constant = parsedExpression.constant;

//     // Treat the interceptor like filters.
//     // If it is not $stateful then only watch its inputs.
//     // If the expression itself has no inputs then use the full expression as an input.
//     if (!interceptorFn.$stateful) {
//         useInputs = !parsedExpression.inputs;
//         (fn as any).inputs = parsedExpression.inputs ? parsedExpression.inputs : [parsedExpression];

//         if (!interceptorFn.$$pure) {
//             (fn as any).inputs = (fn as any).inputs.map(function (e) {
//                 // Remove the isPure flag of inputs when it is not absolute because they are now wrapped in a
//                 // non-pure interceptor function.
//                 if (e.isPure === PURITY_RELATIVE) {
//                     return function depurifier(s) { return e(s); };
//                 }
//                 return e;
//             });
//         }
//     }

//     return (fn);
// }

// export function $ParseProvider() {
//     let cache = createMap();

//     this.$get = ['$fil2ter', function ($fil2ter) {
//         let noUnsafeEval = csp().noUnsafeEval;
//         let $parseOptions = {
//             csp: noUnsafeEval,
//             literals: copy(literals)
//         };
//         return $parse;

//         function $parse(exp, interceptorFn) {
//             let parsedExpression, oneTime, cacheKey;

//             switch (typeof exp) {
//                 case 'string':
//                     exp = exp.trim();
//                     cacheKey = exp;

//                     parsedExpression = cache[cacheKey];

//                     if (!parsedExpression) {
//                         if (exp[0] === ':' && exp[1] === ':') {
//                             oneTime = true;
//                             exp = exp.substring(2);
//                         }
//                         let lexer = new Lexer();
//                         let parser = new Parser(lexer, $parseOptions) as any;
//                         parsedExpression = parser.parse(exp);
//                         parsedExpression.oneTime = !!oneTime;

//                         cache[cacheKey] = addWatchDelegate(parsedExpression);
//                     }
//                     return addInterceptor(parsedExpression, interceptorFn);

//                 case 'function':
//                     return addInterceptor(exp, interceptorFn);

//                 default:
//                     return addInterceptor(noop, interceptorFn);
//             }
//         }

//         function expressionInputDirtyCheck(newValue, oldValueOfValue, compareObjectIdentity) {

//             if (newValue == null || oldValueOfValue == null) { // null/undefined
//                 return newValue === oldValueOfValue;
//             }

//             if (typeof newValue === 'object') {

//                 // attempt to convert the value to a primitive type
//                 // TODO(docs): add a note to docs that by implementing valueOf even objects and arrays can
//                 //             be cheaply dirty-checked
//                 newValue = getValueOf(newValue);

//                 if (typeof newValue === 'object' && !compareObjectIdentity) {
//                     // objects/arrays are not supported - deep-watching them would be too expensive
//                     return false;
//                 }

//                 // fall-through to the primitive equality check
//             }

//             // Primitive or NaN
//             // eslint-disable-next-line no-self-compare
//             return newValue === oldValueOfValue || (newValue !== newValue && oldValueOfValue !== oldValueOfValue);
//         }

//         function inputsWatchDelegate(scope, listener, objectEquality, parsedExpression, prettyPrintExpression) {
//             let inputExpressions = parsedExpression.inputs;
//             let lastResult;

//             if (inputExpressions.length === 1) {
//                 let oldInputValueOf = expressionInputDirtyCheck; // init to something unique so that equals check fails
//                 inputExpressions = inputExpressions[0];
//                 return scope.$watch(function expressionInputWatch(scope) {
//                     let newInputValue = inputExpressions(scope);
//                     if (!expressionInputDirtyCheck(newInputValue, oldInputValueOf, inputExpressions.isPure)) {
//                         lastResult = parsedExpression(scope, undefined, undefined, [newInputValue]);
//                         oldInputValueOf = newInputValue && getValueOf(newInputValue);
//                     }
//                     return lastResult;
//                 }, listener, objectEquality, prettyPrintExpression);
//             }

//             let oldInputValueOfValues = [];
//             let oldInputValues = [];
//             for (let i = 0, ii = inputExpressions.length; i < ii; i++) {
//                 oldInputValueOfValues[i] = expressionInputDirtyCheck; // init to something unique so that equals check fails
//                 oldInputValues[i] = null;
//             }

//             return scope.$watch(function expressionInputsWatch(scope) {
//                 let changed = false;

//                 for (let i = 0, ii = inputExpressions.length; i < ii; i++) {
//                     let newInputValue = inputExpressions[i](scope);
//                     if (changed || (changed = !expressionInputDirtyCheck(newInputValue, oldInputValueOfValues[i], inputExpressions[i].isPure))) {
//                         oldInputValues[i] = newInputValue;
//                         oldInputValueOfValues[i] = newInputValue && getValueOf(newInputValue);
//                     }
//                 }

//                 if (changed) {
//                     lastResult = parsedExpression(scope, undefined, undefined, oldInputValues);
//                 }

//                 return lastResult;
//             }, listener, objectEquality, prettyPrintExpression);
//         }

//         function oneTimeWatchDelegate(scope, listener, objectEquality, parsedExpression) {
//             let unwatch, lastValue;
//             return unwatch = scope.$watch(function oneTimeWatch(scope) {
//                 return parsedExpression(scope);
//             }, function oneTimeListener(value, old, scope) {
//                 lastValue = value;
//                 if (isFunction(listener)) {
//                     listener.apply(this, arguments);
//                 }
//                 if (isDefined(value)) {
//                     scope.$$postDigest(function () {
//                         if (isDefined(lastValue)) {
//                             unwatch();
//                         }
//                     });
//                 }
//             }, objectEquality);
//         }


//         function constantWatchDelegate(scope, listener, objectEquality, parsedExpression) {
//             let unwatch = scope.$watch(function constantWatch(scope) {
//                 unwatch();
//                 return parsedExpression(scope);
//             }, listener, objectEquality);
//             return unwatch;
//         }

//         function addWatchDelegate(parsedExpression) {
//             if (parsedExpression.constant) {
//                 parsedExpression.$$watchDelegate = constantWatchDelegate;
//             } else if (parsedExpression.oneTime) {
//                 parsedExpression.$$watchDelegate = oneTimeWatchDelegate;
//             } else if (parsedExpression.inputs) {
//                 parsedExpression.$$watchDelegate = inputsWatchDelegate;
//             }

//             return parsedExpression;
//         }

//         function chainInterceptors(first, second) {
//             function chainedInterceptor(value) {
//                 return second(first(value));
//             }
//             (chainedInterceptor as any).$stateful = first.$stateful || second.$stateful;
//             (chainedInterceptor as any).$$pure = first.$$pure && second.$$pure;

//             return chainedInterceptor;
//         }

//         function addInterceptor(parsedExpression, interceptorFn) {
//             if (!interceptorFn) { return parsedExpression; }

//             // Extract any existing interceptors out of the parsedExpression
//             // to ensure the original parsedExpression is always the $$intercepted
//             if (parsedExpression.$$interceptor) {
//                 interceptorFn = chainInterceptors(parsedExpression.$$interceptor, interceptorFn);
//                 parsedExpression = parsedExpression.$$intercepted;
//             }

//             let useInputs = false;

//             let fn = function interceptedExpression(scope, locals, assign, inputs) {
//                 let value = useInputs && inputs ? inputs[0] : parsedExpression(scope, locals, assign, inputs);
//                 return interceptorFn(value);
//             };

//             // Maintain references to the interceptor/intercepted
//             (fn as any).$$intercepted = parsedExpression;
//             (fn as any).$$interceptor = interceptorFn;

//             // Propogate the literal/oneTime/constant attributes
//             (fn as any).literal = parsedExpression.literal;
//             (fn as any).oneTime = parsedExpression.oneTime;
//             (fn as any).constant = parsedExpression.constant;

//             // Treat the interceptor like filters.
//             // If it is not $stateful then only watch its inputs.
//             // If the expression itself has no inputs then use the full expression as an input.
//             if (!interceptorFn.$stateful) {
//                 useInputs = !parsedExpression.inputs;
//                 (fn as any).inputs = parsedExpression.inputs ? parsedExpression.inputs : [parsedExpression];

//                 if (!interceptorFn.$$pure) {
//                     (fn as any).inputs = (fn as any).inputs.map(function (e) {
//                         // Remove the isPure flag of inputs when it is not absolute because they are now wrapped in a
//                         // non-pure interceptor function.
//                         if (e.isPure === PURITY_RELATIVE) {
//                             return function depurifier(s) { return e(s); };
//                         }
//                         return e;
//                     });
//                 }
//             }

//             return addWatchDelegate(fn);
//         }
//     }];
// }
