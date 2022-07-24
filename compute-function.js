class Token {}

class NumberToken extends Token {
    value;
    constructor(numberString){
        super();
        this.value = new Number(numberString);
    }
}

//TODO extend function class
class FunctionToken extends Token {
    name;
    constructor(name){
        super();
        this.name = name;
    }
}

class OperatorToken extends Token {
    static allowedOperators = [
        new OperatorToken('+', 0, 'left'),
        new OperatorToken('-', 0, 'left'),
        new OperatorToken('*', 0, 'left'),
        new OperatorToken('/', 0, 'left')
    ];

    name;
    precendence;
    associativity;
    constructor(name, precendence, associativity){
        super();
        this.name = name;
        this.precendence = precendence;
        this.associativity = associativity;
    }

    static findOperatorByName = (string) =>
        this.allowedOperators.find(operator => operator.name === string);

    static isOperator = (string) =>
        this.findOperatorByName(string) !== undefined;

    static from(string){
        const operator = this.findOperatorByName(string);
        // TODO make normal error
        if (operator === undefined)
            throw new ComputeError(`Operator [${string}] doesn't exist`);
        return operator;
    }
}

class LeftParenthesisToken extends Token {}
class RightParenthesisToken extends Token {}


const DIGITS = new Set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
const OPERATORS = new Set(OperatorToken.allowedOperators.map(op => op.name))
const PARENTHESES = new Set(['(', ')']);
const ALPHABET_LETTERS = new Set('abcdefghijklmnopqrstuvwxyz'.split(''));
const FUNCTIONS = new Set();
const ALLOWED_CHARS = new Set([
    ...DIGITS, 
    ...OPERATORS, 
    ...PARENTHESES,
    ...ALPHABET_LETTERS,
    ' ']);

const isEmpty = (array) => array.length === 0;

// TODO add dot
// TODO add functions

class ComputeError extends Error {
    constructor(message=''){
        this.message = message
    }
}


const compute = (expressionString) => {
    if (!hasOnlyAllowedChars(expressionString))
        throw new ComputeError('Expression contains not allowed charactes');
    const tokens = toTokens(expressionString);
    return 42;
}

const hasOnlyAllowedChars = (string) =>
    string.split('').every(char => ALLOWED_CHARS.has(char));

const isAlphabetLetter = (char) => ALPHABET_LETTERS.has(char);
const isDigit = (char) => DIGITS.has(char);

//TODO think about multichar operators
const toTokens = (string) => {
    chars = string.replaceAll(' ', '')
                  .toLowerCase()
                  .split('');
    const tokens = [];
    while(!isEmpty(chars)){
        const char = chars.shift();
        if (isDigit(char)){
            const numberChars = [char]
            // Maybe remove check for isEmpty
            while(!isEmpty(chars) && isDigit(chars[0]))
                numberChars.push(chars.shift())
            const numberString = numberChars.join('');
            tokens.push(new NumberToken(numberString));
        } else if (OperatorToken.isOperator(char)){
            tokens.push(OperatorToken.from(char));
        } else if (char === '('){
            tokens.push(new LeftParenthesisToken());
        } else if (char === ')'){
            tokens.push(new RightParenthesisToken());
        } else if (isAlphabetLetter(char)){
            const functionNameChars = [char];
            while(!isEmpty(chars) && isAlphabetLetter(chars[0]))
                functionNameChars.push(chars.shift());
            tokens.push(new FunctionToken(functionNameChars.join('')));
        }
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
            case FunctionToken:
                operatorStack.push(token)
                break;
            case OperatorToken:
                let lastOperator = operatorStack.at(-1)
                while(!isEmpty(operatorStack) &&
                      !(lastOperator instanceof LeftParenthesisToken) &&
                      (lastOperator.precendence > token.precendence ||
                      (lastOperator.precendence === token.precendence && token.associativity === 'left'))
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
                if (operatorStack.at(-1) instanceof FunctionToken)
                    outputQueue.push(operatorStack.pop());
                break;
        }
    }

    while(!isEmpty(operatorStack)){
        const operator = operatorStack.pop();
        // TODO make proper error
        if (operator instanceof LeftParenthesisToken) throw new Error('no right parenthesis');
        outputQueue.push(operator);
    }
    return outputQueue;
}

export {ExpressionContainsNonAllowedChars, compute};