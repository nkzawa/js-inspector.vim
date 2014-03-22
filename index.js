var esprima = require('esprima');
var as = require('ast-scope');


var line = parseInt(process.argv[2], 10);
var column = parseInt(process.argv[3], 10);

var data = '';
process.stdin.on('data', function(chunk) {
  data += chunk;
});

process.stdin.on('end', function() {
  main(data);
});

function main(data) {
  try {
    var ast = esprima.parse(data, {loc: true, tolerant: true});
  } catch (e) {
    console.error(e.toString());
    process.exit(1);
  }

  var variable = findVariable(ast, line, column);
  if (!variable) {
    console.error('Variable not found');
    process.exit(1);
  }

  // locations of declarations and references
  var locs = [];
  if (variable.node) {
    locs.push(variable.node.loc);
  }
  variable.declarations.concat(variable.references).forEach(function(node) {
    if (!~locs.indexOf(node.id.loc)) {
      locs.push(node.id.loc);
    }
  });

  var positions = locs.sort(function(a, b) {
    a = a.start;
    b = b.start;
    return a.line === b.line ? a.column - b.column : a.line - b.line;
  }).map(function(loc) {
    var start = loc.start;
    // a column of vim starts from 1.
    return [start.line, start.column + 1];
  });

  process.stdout.write(JSON.stringify({name: variable.name, positions: positions}));
}

function findVariable(ast, line, column) {
  var scope = as.analyze(ast);
  var endColumn = Infinity;

  return find(scope);

  function test(node) {
    var loc = node.loc;
    if (loc.start.line === line && loc.end.column > column && loc.end.column < endColumn) {
      endColumn = loc.end.column;
      return true;
    }
    return false;
  }

  function find(scope) {
    var variable;

    // references on the line
    scope.references.forEach(function(ref) {
      if (test(ref.id)) {
        variable = ref.variable;
      }
    });

    // variables on the line
    Object.keys(scope.variables).map(function(k) {
      return scope.variables[k];
    }).forEach(function(v) {
      if (!v.node) return;

      if (test(v.node)) {
        variable = v;
        return;
      }

      v.declarations.some(function(node) {
        if (test(node.id)) {
          variable = v;
          return true;
        }
      });
    });

    if (!variable) {
      scope.children.some(function(scope) {
        variable = find(scope);
        return !!variable;
      });
    }
    return variable;
  }
}
