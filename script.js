'use strict'
import {ALLOWED_CHARS, ComputeError, compute} from './compute-function.mjs';

const CALCULATOR_CONTAINER_ID = 'calculator-container';
const CALCULATOR_ID = 'calculator';
const INPUT_FIELD_ID = 'calculator__input-field';
const INPUT_BUTTON_CLASS_NAME = 'input-button';
const ENTER_BUTTON_ID = 'enter-button';
const CLEAR_BUTTON_ID = 'clear-button';
const ERORR_MESSAGE_CLASS = 'error-message';

const getElementsByClassName = (parent, className) => 
    Array.from(parent.getElementsByClassName(className));


class Calculator {
    computeFunction;
    inputField;
    calculatorContainer;
    calculatorElement;
    errorElement = null;
    constructor(calculatorContainer, calclulatorElement, computeFunction){
        this.calculatorContainer = calculatorContainer;
        this.computeFunction = computeFunction;
        this.inputField = document.getElementById(INPUT_FIELD_ID);
        this.calculatorElement = calclulatorElement;
        this.addHanlders(this.calculatorElement);
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
        this.removeErrorMessage();
        this.inputField.value += string;
    }

    clear(){
        this.removeErrorMessage();
        this.inputField.value = '';
    }

    enter(){
        this.removeErrorMessage();
        let computationResult;
        try {
            computationResult = this.computeFunction(this.inputField.value)
        } catch (error){
            console.log(error.message)
            this.showErrorMessage(error.message);
            return;
        }
        this.inputField.value = Calculator.round(computationResult, 5);
    }

    // toFixed returns string, so we need to turn it back to number
    static round = (number, n) =>
        Number(number.toFixed(n));

    deleteLastChar(){
        this.removeErrorMessage();
        if (this.inputField.value === '') return;
        this.inputField.value = this.inputField.value.slice(0, -1);
    }

    showErrorMessage(text){
        const errorElement = document.createElement('div');
        errorElement.classList.add('error-message');
        errorElement.textContent = `Error: ${text}`;
        this.calculatorContainer.insertBefore(errorElement, this.calculatorElement);
        this.errorElement = errorElement;
    }

    removeErrorMessage(){
        if (this.errorElement === null) return; 
        this.calculatorContainer.removeChild(this.errorElement);
        this.errorElement = null;
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
    const calculatorContainer = document.getElementById(CALCULATOR_CONTAINER_ID);
    const calclulatorElement = document.getElementById(CALCULATOR_ID);
    const calclulator = new Calculator(calculatorContainer, calclulatorElement, compute);
    addEventListenerToDocument(calclulator);
}
main();