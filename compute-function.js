// TODO add float numbers
// TODO add unary + and -
import genEnum from './enum.js';


const isEmpty = (array) => array.length === 0;

class Token {}

class NumberToken extends Token {
    number;
    constructor(numberString){
        super();
        this.number = new Number(numberString);
    }

    toString = () => this.number.toString();
}

const Associativity = genEnum('Left', 'Right');
class UnaryOperator extends Token {
    name;
    precendence;
    evaluate;
    constructor(name, precendence, evaluate){
        super();
        this.name = name;
        this.precendence = precendence;
        this.evaluate = evaluate;
    }

    toString = () => this.name;
}

class BinaryOperator extends Token {
    name;
    precendence;
    associativity;
    evaluate;
    constructor(name, precendence, associativity, evaluate){
        super();
        this.name = name;
        this.precendence = precendence;
        this.associativity = associativity;
        this.evaluate = evaluate;
    }

    toString = () => this.name;
}


// name, precendence, function
const UNARY_OPERATORS = [
    ['sin', 2, x => Math.sin(x)],
    ['cos', 2, x => Math.cos(x)]]
    .map(args => new UnaryOperator(...args));

// name, precendence, associativity, funciton
const BINARY_OPEARATORS = [
    ['+', 0, Associativity.Left, (a, b) => a + b],
    ['-', 0, Associativity.Left, (a,b) => a - b],
    ['*', 1, Associativity.Left, (a,b) => a * b],
    ['/', 1, Associativity.Left, (a,b) => a / b]]
    .map(args => new BinaryOperator(...args));


const NAME_TO_UNARY_OPERATOR = new Map(UNARY_OPERATORS.map(op => [op.name, op]));
const NAME_TO_BINARY_OPERATOR = new Map(BINARY_OPEARATORS.map(op => [op.name, op]));

const getUnaryOperator = (operatorName) =>
    NAME_TO_UNARY_OPERATOR.get(operatorName)

const getBinaryOperator = (operatorName) =>
    NAME_TO_BINARY_OPERATOR.get(operatorName)

const unaryOperatorExists = (operatorName) =>
    getUnaryOperator(operatorName) !== undefined;

const binaryOperatorExists = (operatorName) =>
    getBinaryOperator(operatorName) !== undefined;


class LeftParenthesisToken extends Token {
    toString = () => '(';
}


class RightParenthesisToken extends Token {
    toString = () => ')';
}


class ComputeError extends Error {
    constructor(message=''){
        super();
        this.message = message
    }
}


const compute = (expressionString) => {
    const tokens = toTokens(expressionString);
    return 42;
}

const DIGITS = new Set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
const ALPHABET_LETTERS = new Set('abcdefghijklmnopqrstuvwxyz'.split(''));
const isAlphabetLetter = (char) => ALPHABET_LETTERS.has(char);
const isDigit = (char) => DIGITS.has(char);

const toTokens = (string) => {
    const parseFuncitonToken = (firstLetter, chars) => {
        const operatorNameChars = [firstLetter];
        while(!isEmpty(chars) && isAlphabetLetter(chars[0]))
            operatorNameChars.push(chars.shift());
        const operatorName = operatorNameChars.join('');
        // multicharacter operator from letters can be only unary
        if (!unaryOperatorExists(operatorName))
            throw new ComputeError(`Operator [${operatorName}] doesn't exist`);
        return getUnaryOperator(operatorName);
    }

    chars = string.replaceAll(' ', '')
                  .toLowerCase()
                  .split('');
    const tokens = [];
    while(!isEmpty(chars)){
        const char = chars.shift();
        let token;
        if (char === '('){
            token = new LeftParenthesisToken();
        } else if (char === ')'){
            token = new RightParenthesisToken();
        } else if (isDigit(char)){
            const numberChars = [char]
            // Maybe remove check for isEmpty
            while(!isEmpty(chars) && isDigit(chars[0]))
                numberChars.push(chars.shift())
            const numberString = numberChars.join('');
            token = new NumberToken(numberString);
        } else if (isAlphabetLetter(char)){
            token = parseFuncitonToken(char, chars);
        } else if (binaryOperatorExists(char) && !unaryOperatorExists(char)){
            token = getBinaryOperator(char);
        } else if (!binaryOperatorExists(char) && unaryOperatorExists(char)){
            token = getUnaryOperator(char);
        } else {
            throw new ComputeError(`Character [${char}] doesn't match any rules`);
        }
        tokens.push(token);
    }
    return tokens;
}

const convertToRPN = (tokens) => {
    tokens = [...tokens];
    const outputQueue = [];
    const operatorStack = [];
    while (!isEmpty(tokens)){
        const token = tokens.shift();
        switch (token.constructor){
            case NumberToken:
                outputQueue.push(token);
                break;
            case UnaryOperator:
                operatorStack.push(token)
                break;
            case BinaryOperator:
                let lastOperator = operatorStack.at(-1);
                while(!isEmpty(operatorStack) &&
                      !(lastOperator instanceof LeftParenthesisToken) &&
                      (lastOperator.precendence > token.precendence ||
                      (lastOperator.precendence === token.precendence && token.associativity === Associativity.Left))
                     ){
                        outputQueue.push(operatorStack.pop());
                        lastOperator = operatorStack.at(-1);
                }
                operatorStack.push(token)
                break;
            case LeftParenthesisToken:
                operatorStack.push(token);
                break;
            case RightParenthesisToken:
                while(!(operatorStack.at(-1) instanceof LeftParenthesisToken)){
                    if (isEmpty(operatorStack))
                        throw new ComputeError('Right parenthesis present, but no opening left one');
                    outputQueue.push(operatorStack.pop());
                }
                operatorStack.pop(); // removing left parenthesis
                if (operatorStack.at(-1) instanceof UnaryOperator)
                    outputQueue.push(operatorStack.pop());
                break;
        }
    }

    while(!isEmpty(operatorStack)){
        const operator = operatorStack.pop();
        if (operator instanceof LeftParenthesisToken)
            throw new ComputeError('Left parenthesis present, but no closing right one');
        outputQueue.push(operator);
    }
    return outputQueue;
}


const evaluateRpn = (rpn) => {
    rpn = [...rpn]
    const args = [];
    while(!isEmpty(rpn)){
        const token = rpn.shift();
        switch (token.constructor){
            case NumberToken:
                args.push(token.number);
                while (!isEmpty(rpn) && rpn.at(0) instanceof NumberToken)
                    args.push(rpn.shift().number)
            break;
            //TODO maybe add functions of multiple arguments
            case FunctionToken:
                if (isEmpty(args)) throw new OperatorToken('No argument for function');
                args[args.length - 1] = null
        }
    }
} 


const RpnToString = (rpnArray) =>
    rpnArray.map(el => el.toString())
            .join(' ');


const inputs = [
    '' , '1+1', '+2', 
    '35', 'sin(5)', '7*5 /4* + 7',
    '4-sin(5)+7', 
    '7*5 /4* sin(7 )'];
// for (const input of inputs)
    // console.log([input, RpnToString(convertToRPN(toTokens(input)))])
export {ComputeError, compute};