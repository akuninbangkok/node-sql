'use strict';

var Node = require(__dirname);
var ParameterNode = require('./parameter');
var DefaultNode = require('./default');

var Insert = Node.define({
  type: 'INSERT',
  constructor: function () {
    Node.call(this);
    this.names = [];
    this.columns = [];
    this.valueSets = [];
  }
});

module.exports = Insert;

Insert.prototype.add = function (nodes) {
  var self = this;
  var values = {};
  nodes.forEach(function (node) {
    var column = node.toNode();
    var name = column.name;
    var idx = self.names.indexOf(name);
    if (idx < 0) {
      self.names.push(name);
      self.columns.push(column);
    }
    values[name] = column;
  });
  this.valueSets.push(values);
  return self;
};

/*
 * Get paramters for all values to be inserted. This function
 * handles handles bulk inserts, where keys may be present
 * in some objects and not others. When keys are not present,
 * the insert should refer to the column value as DEFAULT.
 */
Insert.prototype.getParameters = function () {
  var self = this;
  return this.valueSets
    .map(function (nodeDict) {
      var set = [];
      self.names.forEach(function (name) {
        var node = nodeDict[name];
        if (node) {
          set.push(new ParameterNode(node.value));
        }
        else {
          set.push(new DefaultNode());
        }
      });
      return set;
    });
};
