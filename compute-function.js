class Token {}

class NumberToken extends Token {
    value;
    constructor(numberString){
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
        new OperatorToken('/', 0, 'right')
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
        this.allowedOperators.some(operator => operator.name === string);

    static isOperator = (string) =>
        this.findOperatorByName(string) !== undefined;

    static from(string){
        const operator = this.findOperatorByName(string);
        // TODO make normal error
        if (operator === undefined) throw new Error('no such operator');
        return operator;
    }
}

class LeftParenthesisToken extends Token {}
class RightParenthesisToken extends Token {}


const DIGITS = new Set('0', '1', '2', '3', '4', '5', '6', '7', '8', '9');
const OPERATORS = new Set(OperatorToken.allowedOperators.map(op => op.name))
const PARENTHESES = new Set('(', ')');
const ALPHABET_LETTERS = new Set(...('abcdefghijklmnopqrstuvwxyz'.split('')));
const FUNCTIONS = new Set();
const ALLOWED_CHARS = new Set([
    ...DIGITS, 
    ...OPERATORS, 
    ...PARENTHESES,
    ...ALPHABET_LETTERS,
    ' ']);

const isEmpty = (array) => array.lenght === 0;

// TODO add dot
// TODO add functions

class ExpressionContainsNonAllowedChars extends Error {}


const compute = (expressionString) => {
    if (!isValidExpression(expressionString)) 
        throw new ExpressionContainsNonAllowedChars();
    const tokens = toTokens(expressionString);
    return 42;
}

// TODO rename
const isValidExpression = (string) =>
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
            const numberString = numberChars.join();
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
            tokens.push(new FunctionToken(functionNameChars.join()));
        }
    }
    return tokens;
}

const convertToRPN = (tokens) => {
    const hasGreaterPrecedence = (operator1, operator2) =>
        getPrecendence(operator1.value) > getPrecendence(operator2.value);
    const hasEqualPrecednece = (operator1, operator2) =>
        getPrecendence(operator1.value) === getPrecendence(operator2.value);
    tokens = [...tokens];
    const outputQueue = [];
    const operatorStack = [];
    while (!isEmpty(tokens)){
        const token = tokens.shift();
        switch(token.type) {
            case TokenType.Number:
                outputQueue.push(token);
                break;
            case TokenType.Function:
                operatorStack.push(token)
                break;
            case TokenType.Operator:
                let lastOperator = operatorStack.at(-1)
                while(!isEmpty(operatorStack) && 
                      lastOperator.type !== TokenType.LeftParenthesis &&
                      (hasGreaterPrecedence(lastOperator, token) ||
                       hasEqualPrecednece(lastOperator, token), getAssociativity(token) === 'left')
                      ){
                        outputQueue.push(operatorStack.pop());
                        lastOperator = operatorStack.at(-1);
                }
                operatorStack.push(token)
                break;
            case TokenType.LeftParenthesis:
                operatorStack.push(token);
            case TokenType.RightParenthesis:
                while(operatorStack.at(-1).type !== TokenType.LeftParenthesis){
                    // TODO make proper error
                    if (isEmpty(operatorStack)) throw new Error('no left parenthesis');
                    outputQueue.push(operatorStack.pop());
                }
                operatorStack.pop(); // removing left parenthesis
                if (operatorStack.at(-1).type === TokenType.Function)
                    outputQueue.push(operatorStack.pop());
        }
    }

    while(!isEmpty(operatorStack)){
        const operator = operatorStack.pop();
        // TODO make proper error
        if (operator.type === OperatorType.LeftParenthesis) throw new Error('no right parenthesis');
        outputQueue.push(operator);
    }
    return outputQueue;
}

export {ExpressionContainsNonAllowedChars, compute};