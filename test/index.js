var exec = require('child_process').exec;
var util = require('util');
var expect = require('expect.js');

var script = __dirname + '/../bin/js-inspector';

describe('js-inspector.vim', function() {
  it('should detect a variable and positions', function(done){
    var code = 'foo;';
    var cmd = util.format('%s %d %d', script, 1, 0);
    var child = exec(cmd, function(err, stdout, stderr) {
      expect(JSON.parse(stdout)).to.eql({
        name: 'foo',
        positions: [[1, 1]]
      });
      done(err);
    });
    child.stdin.end(code);
  });

  it('should detect all variables', function(done){
    var code = 'foo;\nfunction foo() {\nconsole.log(foo);\n}';
    var cmd = util.format('%s %d %d', script, 1, 0);
    var child = exec(cmd, function(err, stdout, stderr) {
      expect(JSON.parse(stdout)).to.eql({
        name: 'foo',
        positions: [[1, 1], [2, 10], [3, 13]]
      });
      done(err);
    });
    child.stdin.end(code);
  });

  it('should handle shebang', function(done){
    var code = '#!/usr/bin/env node\nfoo;';
    var cmd = util.format('%s %d %d', script, 2, 0);
    var child = exec(cmd, function(err, stdout, stderr) {
      expect(JSON.parse(stdout)).to.eql({
        name: 'foo',
        positions: [[2, 1]]
      });
      done(err);
    });
    child.stdin.end(code);
  });

  it('should fail on invalid code', function(done){
    var code = 'foo bar';
    var cmd = util.format('%s %d %d', script, 1, 0);
    var child = exec(cmd, function(err, stdout, stderr) {
      expect(err).to.be.a(Error);
      expect(stderr).to.be.ok();
      done();
    });
    child.stdin.end(code);
  });

  it('should fail when no variable found', function(done){
    var code = '\'foo\';';
    var cmd = util.format('%s %d %d', script, 1, 0);
    var child = exec(cmd, function(err, stdout, stderr) {
      expect(err).to.be.a(Error);
      expect(stderr).to.be('No variable under cursor');
      done();
    });
    child.stdin.end(code);
  });
});
