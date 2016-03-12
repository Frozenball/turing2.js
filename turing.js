"use strict";

let indentString = require('indent-string');

let argv = require('minimist')(process.argv.slice(2));
let fs = require('fs')

function indent(str, i = 1) {
  return indentString(str, ' ', 2 * i);
}

function parseTuringSyntax(source) {
  let states = {};
  let startState = null;
  let successState = null;
  let lines = source.split("\n");
  for (let line of lines) {
    line = line.trim();
    if (line[0] === ';') { }
    else if (line === '') { }
    else {
      let [state, read, replace, move, nextState] = line.split(' ');
      if (states[state] === undefined) {
        states[state] = [];
      }
      states[state].push({
        read,
        replace,
        move,
        nextState
      })
    }
  }
  return {
    states,
    startState,
    successState
  }
}

function transpile(syntax) {
  let source = '';
  source += "var DEBUG = false;\n";
  source += "var input = input.split('');\n"// + JSON.stringify('110'.split('')) + ";\n";
  source += "var state = " + JSON.stringify(syntax.startState) + ";\n";
  source += "var tapePosition = " + JSON.stringify(0) + ";\n";
  source += `function goLeft() {
  if (DEBUG) console.log('Go left');
  tapePosition--;
  if (tapePosition === -1) {
    tapePosition += 1;
    input.unshift(' ');
  } else if (tapePosition < 0) {
    throw "Invalid tape position when going left";
  }
}
`;
  source += `function goRight() {
  if (DEBUG) console.log('Go right');
  tapePosition++;
  if (tapePosition === input.length) {
    input.push(' ');
  } else if (tapePosition > input.length) {
    throw "Invalid tape position when going right";
  }
}
`;
  source += `function replace(replace) {
  if (DEBUG) console.log('Replacing with ', replace);
  if (tapePosition >= 0 && tapePosition < input.length) {
    input[tapePosition] = replace;
  } else if (tapePosition === input.length) {
    input.push(replace);
  } else {
    throw "Invalid tape position when replacing";
  }
}
`;

  for (let state of Object.keys(syntax.states)) {
    let moves = syntax.states[state];

    source += "function state" + state + "() {\n";

    for (let move of moves) {
      if (move.read == '_') {
        source += indent("if (input[tapePosition] === ' ') {\n");
      } else if (move.read == '*') {
        source += indent("if (true) {\n");
      } else {
        source += indent("if (input[tapePosition] === " + JSON.stringify(move.read) + ") {\n");
      }
      if (move.replace !== '*') {
        if (move.replace === '_') {
          source += indent("replace(" + JSON.stringify(' ') + ");\n", 2);
        } else {
          source += indent("replace(" + JSON.stringify(move.replace) + ");\n", 2);
        }
      }
      if (move.move == 'l') {
        source += indent("goLeft();\n", 2);
      } else if (move.move == 'r') {
        source += indent("goRight();\n", 2);
      }
      source += indent("state = " + JSON.stringify(move.nextState) + ";\n", 2);
      source += indent("return;\n", 2);

      source += indent("}\n");
      //console.log(move);
    }
    source += indent("throw 'No transition found for state';\n");

    source += "}\n";
    //console.log(moves);
  }

  source += `
var i = 0;
while (true) {
  i++;
  if (DEBUG && i == 30) break;
  if (DEBUG) console.log('State is', state, 'Tape', input);
`;

  var firstLine = true;
  for (let state of Object.keys(syntax.states)) {
    source += indent((firstLine === true ? '' : 'else ') + "if (state === "+JSON.stringify(state)+") state" + state + "();\n");
    firstLine = false;
  }
  source += indent(`else if (state === 'halt') {
  if (includeTape) {
    return [false, input.join('').trim()];
  } else {
    return false;
  }
}
`);
source += indent(`else if (state === 'halt-accept') {
if (includeTape) {
  return [true, input.join('').trim()];
} else {
  return true;
}
}
`);
  source += indent("else { throw 'Should not happen'; }\n");

  source += `
}
`;
  return `(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
  }
}(this, function () {
  return function(input, includeTape) {
${indent(source, 2)}
  };
}));`;
}

if (argv._[0]) {
  console.log(argv);
  fs.readFile(argv._[0], 'utf8', function (err, data) {
    if (err) {
      return console.error(err);
    }
    let ast = parseTuringSyntax(data);
    ast.startState = '0';

    let source = transpile(ast);
    console.log(source);
  });
} else {
  console.error('No file specified.');
}
