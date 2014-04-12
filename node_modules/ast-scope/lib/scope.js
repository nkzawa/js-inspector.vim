var Variable = require('./variable');
var Assignment = require('./assignment');
var Reference = require('./reference');
var utils = require('./utils');


module.exports = Scope;

function Scope(node, parent) {
  this.node = node;
  this.parent = parent;
  this.children = [];
  this.variables = [];
  this.assignments = [];
  this.references = [];
  this._variableMap = {};

  if (parent) {
    parent.children.push(this);
    return;
  }

  this.unscopedVariables = [];
  this._unscopedVariableMap = {};
  this.getUnscopedVariable = function(name) {
    return this._unscopedVariableMap['$' + name];
  };
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

  var variable = this.getVariable(name);
  if (variable) {
    return variable;
  }

  variable = new Variable(node || name, this);
  this.variables.push(variable);
  // add the prefix to avoid reserved keys like "constructor" or "__proto__"
  this._variableMap['$' + name] = variable;
  return variable;
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
  var variable = scope.getUnscopedVariable(name);
  if (variable) {
    return variable;
  }

  variable = new Variable(name);
  scope.unscopedVariables.push(variable);
  scope._unscopedVariableMap['$' + name] = variable;
  return variable;
};

Scope.prototype.getVariable = function(name) {
  return this._variableMap['$' + name];
};

Scope.prototype.resolveVariable = function(name) {
  if (typeof name !== 'string') {
    name = utils.extractName(name);
  }

  var scope = this;
  var variable;
  while (!(variable = scope.getVariable(name)) && scope.parent) {
    scope = scope.parent;
  }
  return variable || scope.getUnscopedVariable(name);
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
