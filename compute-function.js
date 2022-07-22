import Enum from './enum.js';


const DIGITS = new Set('0', '1', '2', '3', '4', '5', '6', '7', '8', '9');
const OPERATORS = new Set('+', '-', '*', '/');
const PARENTHESES = new Set('(', ')');
const ALPHABET_LETTERS = new Set(...('abcdefghijklmnopqrstuvwxyz'.split('')));
const FUNCTIONS = new Set();
const ALLOWED_CHARS = new Set([
    ...DIGITS, 
    ...OPERATORS, 
    ...PARENTHESES,
    ...ALPHABET_LETTERS,
    ' ']);


const OPERATOR_TO_PRECEDENCE = {
    '+': 0, '-': 0,
    '*': 1, '/': 1
}
const getPrecendence = (opeator) => OPERATOR_TO_PRECEDENCE[opeator];
// TODO make operator a class
const OPERATOR_ASSOCIATIVITY = {
    '+': 'left', '-': 'left', '*': 'left', '/': 'left'
}
const getAssociativity = (opeator) => OPERATOR_ASSOCIATIVITY[opeator];

const TokenType = Enum(
    'Number',
    'Operator',
    'Function',
    'LeftParenthesis',
    'RightParenthesis'
);

const isEmpty = (array) => array.lenght === 0;

const isOperator = (char) => OPERATORS.has(char);
const isNumber = (value) => typeof(value) === 'number';
const isFunctionName = (string) => FUNCTIONS.has(string);

const tokenValueToType = (tokenValue) => {
    if (isNumber(tokenValue)) return TokenType.Number;
    if (isOperator(tokenValue)) return TokenType.Operator;
    if (isFunctionName(tokenValue)) return TokenType.Function;
    if (tokenValue === '(') return TokenType.LeftParenthesis;
    if (tokenValue === ')') return TokenType.RightParenthesis;
    throw new Error('Incorrect token value');
}

// TODO add dot
// TODO add functions

class ExpressionContainsNonAllowedChars extends Error {}

class Token {
    constructor(value){
        this.type = tokenValueToType(value);
        this.value = value;
    }
}

const compute = (expressionString) => {
    if (!isValidExpression(expressionString)) 
        throw new ExpressionContainsNonAllowedChars();
    const tokens = stringToTokens(expressionString);

    return 42;
}

// TODO rename
const isValidExpression = (string) =>
    string.split('').every(char => ALLOWED_CHARS.has(char));


const isParenthesis = (char) => PARENTHESES.has(char);
const isAlphabetLetter = (char) => ALPHABET_LETTERS.has(char);
const isDigit = (char) => DIGITS.has(char);

const stringToTokens = (string) => {
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
            tokens.push(new Token(new Number(numberChars.join())));
        } else if (isOperator(char)){
            tokens.push(new Token('operator'), char);
        } else if (isParenthesis(char)){
            tokens.push(new Token(char));
        } else if (isAlphabetLetter(char)){
            let functionName = char;
            while(!isEmpty(chars) && isAlphabetLetter(chars[0]))
                functionName += chars.shift();
            tokens.push(new Token(functionName));
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