ast-scope
=============

[![Build Status](https://travis-ci.org/nkzawa/ast-scope.png?branch=master)](https://travis-ci.org/nkzawa/ast-scope)

A JavaScript AST scope analyzer. The module is heavily inspired by [escope](https://github.com/Constellation/escope).

## Installation
    $ npm install ast-scope

## Usage

```js
var esprima = require('esprima');
var as = require('ast-scope');

var ast = esprima.parse('var foo = function() {};');
var topScope = as.analyze(ast);
```

## License

MIT
