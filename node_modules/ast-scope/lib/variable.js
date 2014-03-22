var utils = require('./utils');


module.exports = Variable;

function Variable(node, scope) {
  var name;

  if ('string' === typeof node) {
    name = node;
    node = null;
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

  this.name = name;
  this.node = node;
  this.scope = scope;
  this.declarations = [];
  this.assignments = [];
  this.references = [];
}
