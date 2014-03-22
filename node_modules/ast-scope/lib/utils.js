
exports.extractId = function(node) {
  switch (node.type) {
  case 'Identifier':
  case 'ThisExpression':
    return node;
  case 'MemberExpression':
    return exports.extractId(node.object);
  case 'CallExpression':
  case 'NewExpression':
    return exports.extractId(node.callee);
  }
};

exports.extractName = function(node) {
  switch (node.type) {
  case 'Identifier':
    return node.name;
  case 'ThisExpression':
    return 'this';
  }
};
