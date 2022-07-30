import {compute} from '../js/compute-function.mjs';


// TODO something with this
const sin = Math.sin;
const cos = Math.cos;
const inputs = [
    '1+1', '+2', 
    '35', 'sin(5)',
    '7*5 /4* + 7', '4-sin(5)+7', 
    '7*5 /4* sin(7 )', '0.5*8',
    '-0.7 * -0.3'];


for (const [i, input] of inputs.entries()) {
    test(`test #${i}`, () => {
        expect(compute(input)).toBe(eval(input));
    })
}    
