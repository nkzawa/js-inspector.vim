var Variable = require('./variable');
var utils = require('./utils');


module.exports = Reference;

function Reference(node, scope) {
  if (!Reference.isRequired(node)) {
    throw new Error('Invalid node type: ' + node.type);
  }

  this.node = node;
  this.scope = scope;
  this.id = utils.extractId(node);
  this.variable = scope.resolveVariable(this.id);
  if (!this.variable) {
    this.variable = scope.undefined(this.id);
  }
  this.variable.references.push(this);
}

Reference.isRequired = function(node) {
  return !!utils.extractId(node);
};

