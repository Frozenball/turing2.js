# Turing2.js
Transpiles Turing machines to Javascript. Works with the syntax specified [here](http://morphett.info/turing/turing.html). This has some bugs at the moment but the prime checker should work.

## Install

````bash
git clone https://github.com/Frozenball/turing2.js.git
cd turing2.js/
git submodule init
git submodule update
npm install
````

## Usage

````bash
node --harmony-destructuring --harmony_default_parameters turing.js jsturing/machines/primetest.txt 101010
````
