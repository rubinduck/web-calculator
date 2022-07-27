'use strict'
import {ALLOWED_CHARS, compute} from './compute-function.mjs';

const CALCULATOR_CLASS_ID = 'calculator';
const INPUT_FIELD_ID = 'calculator__input-field';
const INPUT_BUTTON_CLASS_NAME = 'input-button';
const ENTER_BUTTON_ID = 'enter-button';
const CLEAR_BUTTON_ID = 'clear-button';

const getElementsByClassName = (parent, className) => 
    Array.from(parent.getElementsByClassName(className));


class Calculator {
    computeFunction;
    inputField;
    constructor(calculatorElement, computeFunction){
        this.computeFunction = computeFunction;
        this.inputField = document.getElementById(INPUT_FIELD_ID);
        this.addHanlders(calculatorElement) 
    }

    addHanlders(calculatorElement){
        const inputButtons = getElementsByClassName(calculatorElement, INPUT_BUTTON_CLASS_NAME);
        inputButtons.forEach(
            button => button.addEventListener('click', (e) => this.handleInputButtonClick(e)));

        const enterButton = document.getElementById(ENTER_BUTTON_ID);
        enterButton.addEventListener('click', (e) => this.enter());

        const clearButton = document.getElementById(CLEAR_BUTTON_ID);
        clearButton.addEventListener('click', () => this.clear());
    }

    handleInputButtonClick(event){
        const text = event.currentTarget.textContent;
        this.inputString(text);
    }

    inputString(string){
        this.inputField.value += string;
    }

    clear(){
        this.inputField.value = '';
    }

    enter(){
        const computationResult = this.computeFunction(this.inputField.value)
        this.inputField.value = Calculator.round(computationResult, 5);
    }

    // toFixed returns string, so we need to turn it back to number
    static round = (number, n) =>
        Number(number.toFixed(n));

    deleteLastChar(){
        if (this.inputField.value === '') return;
        this.inputField.value = this.inputField.value.slice(0, -1);
    }
}

function addEventListenerToDocument(calculator){
    document.addEventListener('keydown', event => {
        const key = event.key;
        if (key === 'Enter'){
            calculator.enter();
            return;
        }
        if (calculator.inputField === document.activeElement) return;
        if (ALLOWED_CHARS.has(key))
            calculator.inputString(key);
        else if (key === 'Backspace')
            calculator.deleteLastChar()
    });
}

function main(){
    const calclulatorElement = document.getElementById(CALCULATOR_CLASS_ID);
    const calclulator = new Calculator(calclulatorElement, compute);
    addEventListenerToDocument(calclulator);
}
main();