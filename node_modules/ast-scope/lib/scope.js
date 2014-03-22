var Variable = require('./variable');
var Assignment = require('./assignment');
var Reference = require('./reference');
var utils = require('./utils');


module.exports = Scope;

function Scope(node, parent) {
  this.node = node;
  this.parent = parent;
  this.children = [];
  this.variables = {};
  this.assignments = [];
  this.references = [];

  if (parent) {
    parent.children.push(this);
  } else {
    this.unscopedVariables = [];
  }
}

Scope.prototype.createChild = function(node) {
  var scopes = require('./scopes');
  return scopes.create(node, this);
};

Scope.prototype.isVariableScope = function() {
  return false;
};

Scope.prototype.define = function(node) {
  var name;
  if (typeof node === 'string') {
    name = node;
    node = null;
  } else {
    name = utils.extractName(node);
  }

  return this.variables[name] = this.variables[name] || new Variable(node || name, this);
};

Scope.prototype.assign = function(node) {
  var assignment = new Assignment(node, this);
  this.assignments.push(assignment);
};

Scope.prototype.reference = function(node) {
  if (!node || !Reference.isRequired(node)) {
    return;
  }

  this.references.push(new Reference(node, this));
};

Scope.prototype.undefined = function(node) {
  var name;

  if (typeof node === 'string') {
    name = node;
  } else {
    switch (node.type) {
    case 'Identifier':
    case 'ThisExpression':
      name = utils.extractName(node);
      break;
    default:
      throw new Error('Invalid node type: ' + node.type);
    }
  }

  switch (name) {
  case 'this':
  case 'arguments':
    return this.resolveVariableScope().define(name);
  }

  var scope = this.ancestors().pop() || this;
  return scope.unscopedVariables[name] = scope.unscopedVariables[name] || new Variable(name);
};

Scope.prototype.resolveVariable = function(name) {
  if (typeof name !== 'string') {
    name = utils.extractName(name);
  }

  var scope = this;
  while (!(name in scope.variables) && scope.parent) {
    scope = scope.parent;
  }
  return scope.variables[name] || scope.unscopedVariables[name];
};

Scope.prototype.resolveVariableScope = function() {
  var scope = this;
  while (scope && !scope.isVariableScope()) {
    scope = scope.parent;
  }
  return scope;
};

Scope.prototype.ancestors = function() {
  var ancestors = [];
  var scope = this.parent;
  while (scope) {
    ancestors.push(scope);
    scope = scope.parent;
  }
  return ancestors;
};
