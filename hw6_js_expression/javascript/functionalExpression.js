"use strict"

let cnst = (a) => () => a;
let variable = (name) => (...args) => {
    switch (name) {
        case "x":
            return +args[0];
        case "y":
            return +args[1];
        case "z":
            return +args[2];
    }
};

let apply = function(exprs, ...args) {
    let res = [];
    for (let i of exprs) {
        res.push(i(...args));
    }
    return res;
};

let operation = (f, ...args1) => (...args2) => f(...apply(args1, ...args2));

let add = (x, y) => operation((a, b) => a + b, x, y);
let subtract = (x, y) => operation((a, b) => a - b, x, y);
let multiply = (x, y) => operation((a, b) => a * b, x, y);
let divide = (x, y) => operation((a, b) => a / b, x, y);
let negate = (x) => operation((a) => -a, x);
let pi = operation(cnst(Math.acos(-1)));
let e = operation(cnst(Math.exp(1)));


function foldLeft(f, zero) {
    return (...args) => {
        let result = zero;
        for (const arg of args) {
            result = f(result, arg);
        }
        return result;
    }
}

let median = (...args) => {
    args.sort((a, b) => a - b);
    let pos = Math.floor(args.length / 2);
    return args[pos];
}

let sum = foldLeft((a, b) => a + b, 0);
let avg = (...args) => sum(...args) / (args.length);

let avg5 = (a, b, c, d, e) => operation(avg, a, b, c, d, e);
let med3 = (a, b, c) => operation(median, a, b, c);

// -------------parser functions and constants-------------------

let skip = function (f) {
    return (...args) => {
        let s = args[0];
        let i = args[1];
        while (i < s.length && f(s.charAt(i))) {
            i++;
        }
        return i;
    }
};

let variableNames = ['x', 'y', 'z'];
let constantsPrefixes = ['p', 'e'];
let operationsPrefixes = ['+', '-', '*', '/', 'a', 'm'];
let operations = ['+', '-', '*', '/', 'avg5', 'med3'];
let unaryOperations = ['negate'];
let unaryOperationsPrefixes = ['n'];
let operationByPrefix = {
    '+' : '+', '-' : '-', '*' : '*', '/' : '/', 'a' : 'avg5', 'm' : 'med3'
};
let operandsNumber = {
    '+' : 2, '-' : 2, '*' : 2, '/' : 2, 'avg5' : 5, 'med3' : 3,
};
let pushOperation = function(stack, curOp) {
    let curOperandsNumber = operandsNumber[curOp];
    let mas = [];
    for (let i = 0; i < curOperandsNumber; i++) {
        mas.push(stack.pop());
    }
    mas.reverse();
    let oper;
    switch (curOp) {
        case '+':
            oper = add;
            break;
        case '-':
            oper = subtract;
            break;
        case '*':
            oper = multiply;
            break;
        case '/':
            oper = divide;
            break;
        case 'avg5':
            oper = avg5;
            break;
        case 'med3':
            oper = med3;
            break;
    }
    stack.push(oper(...mas));
};

let isDigit = c => {return ('0' <= c && c <= '9')};  // use it only with 1-characters-strings
let skipWhiteSpaces = skip(c => {return (c === ' ')} );
let skipConst = skip(isDigit);

let check = function(s, t, ind) {
    for (let i = 0; i < t.length; i++) {
        if (s.charAt(i + ind) !== t.charAt(i)) {
            return false;
        }
    }
    return true;
};

// -------------parser functions and constants-------------------

let parse = function(s) {
    s = s.trim();
    let stack = [];
    for (let i = 0; i < s.length; i++) {
        i = skipWhiteSpaces(s, i);
        let negative = false;
        if (s.charAt(i) === '-' && isDigit(s.charAt(i + 1))) {
            negative = true;
            i++;
        }
        if (isDigit(s.charAt(i))) {
            let j = skipConst(s, i);
            let val = +s.substr(i, j - i);
            if (negative) {
                val *= -1;
            }
            stack.push(cnst(val));
            i = j;
            i--;
        } else if (variableNames.includes(s.charAt(i))) {
            stack.push(variable(s.charAt(i)));
        } else if (operationsPrefixes.includes(s.charAt(i))) {
            if (check(s, operationByPrefix[s.charAt(i)]), i) {
                let curOp = operationByPrefix[s.charAt(i)];
                pushOperation(stack, curOp);
                let str = operationByPrefix[s.charAt(i)];
                i += str.length - 1;
            }  //  -- else error
        } else if (unaryOperationsPrefixes.includes(s.charAt(i))) {
            switch (s.charAt(i)) {
                case 'n':
                    if (check(s, "negate", i)) {
                        stack.push(negate(stack.pop()));
                        i += 5;
                    }
                // otherwise -- error
            }
        } else if (constantsPrefixes.includes(s.charAt(i))) {
            switch (s.charAt(i)) {
                case 'p':
                    if (check(s, "pi", i)) {
                        stack.push(pi);
                        i += 1;
                    }
                    continue;
                case 'e':
                    stack.push(e);
            }
        }
    }
    return stack.pop();
};

let val = parse('x negate 2 /');
console.log(val(0, 0, 0));
