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
const UNARI_OPERATORS = [
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


class OperatorProvider {
    static nameToOpearator = OperatorProvider.computeOperatorsMap()

    static computeOperatorsMap(){
        const operators = UNARI_OPERATORS.concat(BINARY_OPEARATORS);
        return new Map(operators.map(op => [op.name, op]))
    }

    static operatorExists = (operatorName) => 
        OperatorProvider.nameToOpearator.has(operatorName);
    
    static getOperator = (operatorName) =>
        OperatorProvider.nameToOpearator.get(operatorName);
}


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
    chars = string.replaceAll(' ', '')
                  .toLowerCase()
                  .split('');
    const tokens = [];
    while(!isEmpty(chars)){
        const char = chars.shift();
        if (char === '('){
            tokens.push(new LeftParenthesisToken());
        } else if (char === ')'){
            tokens.push(new RightParenthesisToken());
        } else if (isDigit(char)){
            const numberChars = [char]
            // Maybe remove check for isEmpty
            while(!isEmpty(chars) && isDigit(chars[0]))
                numberChars.push(chars.shift())
            const numberString = numberChars.join('');
            tokens.push(new NumberToken(numberString));
        } else if (isAlphabetLetter(char)){
            const functionNameChars = [char];
            while(!isEmpty(chars) && isAlphabetLetter(chars[0]))
                functionNameChars.push(chars.shift());
            const functionName = functionNameChars.join('');
            if (!OperatorProvider.operatorExists(functionName))
                throw new ComputeError(`Operator [${functionName}] doesn't exist`);
            tokens.push(OperatorProvider.getOperator(functionName));
        // if it is not parenthesis, number or function name
        } else if (OperatorProvider.operatorExists(char)){
            tokens.push(OperatorProvider.getOperator(char));
        } else {
            throw new ComputeError(`Character [${char}] doesn't match any rules`);
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

export {ComputeError, compute};