'use strict'

const CALCULATOR_CLASS_NAME = 'calculator';
const INPUT_FIELD_CLASS_NAME = 'calculator__input-field';
const INPUT_BUTTON_CLASS_NAME = 'input-button';
const ENTER_BUTTON_CLASS_NAME = 'enter-button';

const getElementsByClassName = (parent, className) => 
    Array.from(parent.getElementsByClassName(className));


class Calculator {
    computeFunction;
    inputField;
    constructor(calculatorElement, computeFunction){
        this.computeFunction = computeFunction;
        this.inputField = calculatorElement
            .getElementsByClassName(INPUT_FIELD_CLASS_NAME)[0];
        this.addHanlders(calculatorElement) 
    }

    addHanlders(calculatorElement){
        const inputButtons = getElementsByClassName(calculatorElement, INPUT_BUTTON_CLASS_NAME);
        inputButtons.forEach(
            button => button.addEventListener('click', (e) => this.handleInputButtonClick(e)));

        const enterButton = getElementsByClassName(calculatorElement, ENTER_BUTTON_CLASS_NAME)[0];
        enterButton.addEventListener('click', (e) => this.handleEnter());
    }

    handleInputButtonClick(event){
        const button = event.currentTarget;
        this.inputField.value += button.textContent;
    }

    handleEnter(){
        this.inputField.value = this.computeFunction(this.inputField.value);
    }
}


function main(){
    const calclulatorElement = document.getElementsByClassName(CALCULATOR_CLASS_NAME)[0];
    const calclulator = new Calculator(calclulatorElement, () => 42);
}
main();