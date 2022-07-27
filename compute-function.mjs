// TODO add float numbers
// TODO add unary + and -
import genEnum from './enum.mjs';


const isEmpty = (array) => array.length === 0;

class Token {}

class NumberToken extends Token {
    number;
    constructor(numberString){
        super();
        this.number = Number(numberString);
    }

    toString = () => this.number.toString();
}

const Associativity = genEnum('Left', 'Right');
class UnaryOperator extends Token {
    name;
    precendence;
    apply;
    constructor(name, precendence, apply){
        super();
        this.name = name;
        this.precendence = precendence;
        this.apply = apply;
    }

    toString = () => this.name;
}

class BinaryOperator extends Token {
    name;
    precendence;
    associativity;
    apply;
    constructor(name, precendence, associativity, apply){
        super();
        this.name = name;
        this.precendence = precendence;
        this.associativity = associativity;
        this.apply = apply;
    }

    toString = () => this.name;
}


// name, precendence, function
const UNARY_OPERATORS = [
    ['+', 0, x => x],
    ['-', 0, x => -x],
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


class LeftParenthesis extends Token {
    toString = () => '(';
}


class RightParenthesis extends Token {
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
    const tokensInRPN = convertToRPN(tokens);
    return evaluateRpn(tokensInRPN);
}

const DIGITS = new Set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
const ALPHABET_LETTERS = new Set('abcdefghijklmnopqrstuvwxyz'.split(''));
const isAlphabetLetter = (char) => ALPHABET_LETTERS.has(char);
const isDigit = (char) => DIGITS.has(char);

const toTokens = (string) => {
    const chars = string.replaceAll(' ', '')
                  .toLowerCase()
                  .split('');
    const tokens = [];
    while(!isEmpty(chars)){
        const char = chars.shift();
        let token;
        if (char === '(')
            token = new LeftParenthesis();
        else if (char === ')')
            token = new RightParenthesis();
        else if (isDigit(char) || char === '.')
            token = parseNumberToken(char, chars);
        else if (isAlphabetLetter(char))
            token = parseFuncitonToken(char, chars);
        else if (binaryOperatorExists(char) && unaryOperatorExists)
            token = parseMultiarityOperator(char, tokens);
        else if (binaryOperatorExists(char))
            token = getBinaryOperator(char);
        else if (unaryOperatorExists(char))
            token = getUnaryOperator(char);
        else
            throw new ComputeError(`Character [${char}] doesn't match any rules`);

        tokens.push(token);
    }
    return tokens;
}

// TODO add support for float
const parseNumberToken = (char, chars) => {
    const numberChars = [char];
    let dotAmount = 0;
    char = chars.at(0)
    while(char === '.' || isDigit(char)){
        if (char === '.') dotAmount++;
        numberChars.push(chars.shift());
        char = chars.at(0)
    }
    if (dotAmount > 1)
        throw new ComputeError(`Number can't have more than one dot, has [${dotAmount}]`);
    const numberString = numberChars.join('');
    return new NumberToken(numberString);
}

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

const parseMultiarityOperator = (char, tokens) => {
    const previousTokenType = tokens.at(-1)?.constructor;
    // if ther is no previous token or it was ')' or Binary operator, than
    // next operator is unary
    if ([undefined, LeftParenthesis, BinaryOperator].includes(previousTokenType))
        return getUnaryOperator(char);
    if ([RightParenthesis, NumberToken].includes(previousTokenType))
        return getBinaryOperator(char);
    // only left option for previous token is unary operator 
    throw new ComputeError(`Operator ${char} can't follow unary opearotr`);
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
                      !(lastOperator instanceof LeftParenthesis) &&
                      (lastOperator.precendence > token.precendence ||
                      (lastOperator.precendence === token.precendence && token.associativity === Associativity.Left))
                     ){
                        outputQueue.push(operatorStack.pop());
                        lastOperator = operatorStack.at(-1);
                }
                operatorStack.push(token)
                break;
            case LeftParenthesis:
                operatorStack.push(token);
                break;
            case RightParenthesis:
                while(!(operatorStack.at(-1) instanceof LeftParenthesis)){
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
        if (operator instanceof LeftParenthesis)
            throw new ComputeError('Left parenthesis present, but no closing right one');
        outputQueue.push(operator);
    }
    return outputQueue;
}


const evaluateRpn = (rpn) => {
    rpn = [...rpn]
    const operands = [];
    while(!isEmpty(rpn)){
        const token = rpn.shift();
        switch (token.constructor){
            case NumberToken:
                operands.push(token.number);
                break;
            case UnaryOperator:
                const argument = operands.at(-1);
                if (argument === undefined)
                    throw new ComputeError(`No argument for [${token}] opeartor`);
                operands.splice(-1, 1, token.apply(argument));
                break;
            case BinaryOperator:
                const args = operands.slice(-2);
                if (args.length < 2)
                    throw new ComputeError(`Not enogught operands for [${token}]`);
                operands.splice(-2, 2, token.apply(...args));
                break;
            default:
                throw new ComputeError(`[${token}] is unknown token type`);
        }
    }
    if (operands.length !== 1)
        throw new ComputeError('Not enoght operands');
    return operands[0];
} 


const RpnToString = (rpnArray) =>
    rpnArray.map(el => el.toString())
            .join(' ');


const inputs = [
    '' , '1+1', '+2', 
    '35', 'sin(5)', '7*5 /4* + 7',
    '4-sin(5)+7', 
    '7*5 /4* sin(7 )'];
for (const input of inputs)
    console.log([input, RpnToString(convertToRPN(toTokens(input)))])
export {ComputeError, compute};