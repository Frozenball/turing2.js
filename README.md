# Turing2.js
Transpiles Turing machines to Javascript. Works with the syntax specified [here](http://morphett.info/turing/turing.html). This has some bugs at the moment but the prime checker should work.

## Usage

````bash
node --harmony-destructuring --harmony_default_parameters turing.js jsturing/machines/primetest.txt > compiled.js
node -e "console.log(require('./compiled.js')('110', true)[1])"
````
