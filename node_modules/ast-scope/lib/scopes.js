var VariableScope = require('./variable-scope');
var Scope = require('./scope');


exports.types = {
  Program: VariableScope,
  FunctionDeclaration: VariableScope,
  FunctionExpression: VariableScope,
  CatchClause: Scope,
  WithStatement: Scope
};

exports.create = function(node, parent) {
  return node ? new exports.types[node.type](node, parent) : new VariableScope();
};

exports.isRequired = function(node) {
  return node.type in exports.types;
};
