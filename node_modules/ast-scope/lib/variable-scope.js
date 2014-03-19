var util = require('util');
var estraverse = require('estraverse');
var Scope = require('./scope');


module.exports = VariableScope;

util.inherits(VariableScope, Scope);

function VariableScope(node, parent) {
  Scope.call(this, node, parent);
}

VariableScope.isRequired = function(node) {
  switch (node.type) {
  case 'FunctionExpression':
  case 'FunctionDeclaration':
  case 'Program':
    return true;
  }
  return false;
};

VariableScope.prototype.hoist = function(ast) {
  var self = this;

  estraverse.traverse(ast || this.node, {
    enter: function(node, parent) {
      if (node === self.node) return;

      switch (node.type) {
      case 'VariableDeclarator':
      case 'FunctionDeclaration':
        self.declare(node);
        break;
      }

      if (VariableScope.isRequired(node)) {
        this.skip();
      }
    }
  });
};

VariableScope.prototype.isVariableScope = function() {
  return true;
};

VariableScope.prototype.declare = function(node) {
  var variable = this.define(node.id);
  variable.declarations.push(node);
};

VariableScope.prototype.resolveVariableScope = function() {
  return this;
};

