var assert = require('chai').assert,
Stream = require('stream'),

Igelkott = require('igelkott');

describe('Help', function() {

  var igelkott,
  config,
  s,
  server,
  TestPluginContructor;

  beforeEach(function () {
    s = new Stream.PassThrough({objectMode: true});

    config = {
      trigger: '!',
      pluginPath: '',
      plugins: {
      },
      'adapter': s, 'connect': function() { this.server.emit('connect'); }
    };
    igelkott = new Igelkott(config);
    igelkott.load('privmsg', {}, require('../node_modules/igelkott/test/fixtures/plugins/igelkott-privmsg.js').Plugin);
    igelkott.load('help');

    TestPluginContructor = function TestPlugin() {
      this.name = 'testplugin';
      this.help = {
        "default": "Hello",
        "foo": {
          "default": "bar"
        }
      };
    };
  });

  it('Should return list of loaded plugins if no plugin name is pased', function(done) {
    igelkott.once('PRIVMSG', function(message) {
      assert.equal(message.parameters[1], 'You have the following plugins to play with: help');
      done();
    });

    igelkott.connect();
    s.write(':jsmith!~jsmith@unaffiliated/jsmith PRIVMSG #channel :!help\r\n');
  });

  it('Should return the default help if no extra parameters are pasts', function(done) {
    igelkott.once('PRIVMSG', function(message) {
      assert.equal(message.parameters[1], 'Help for testplugin: Hello');
      done();
    });

    igelkott.plugin.load('testplugin', {}, TestPluginContructor);

    igelkott.connect();
    s.write(':jsmith!~jsmith@unaffiliated/jsmith PRIVMSG #channel :!help testplugin\r\n');
  });


  it('Should return the foos help for testplugin', function(done) {
    igelkott.once('PRIVMSG', function(message) {
      assert.equal(message.parameters[1], 'Help for testplugin->foo: bar');
      done();
    });

    igelkott.plugin.load('testplugin', {}, TestPluginContructor);

    igelkott.connect();
    s.write(':jsmith!~jsmith@unaffiliated/jsmith PRIVMSG #channel :!help testplugin foo\r\n');
  });

  it('Should return error message on missing plugin', function(done) {
    igelkott.once('PRIVMSG', function(message) {
      assert.equal(message.parameters[1], 'No plugin named noplugin');
      done();
    });

    igelkott.plugin.load('testplugin', {}, TestPluginContructor);

    igelkott.connect();
    s.write(':jsmith!~jsmith@unaffiliated/jsmith PRIVMSG #channel :!help noplugin\r\n');
  });

  it('Should return info about missing help text', function(done) {
    igelkott.once('PRIVMSG', function(message) {
      assert.equal(message.parameters[1], 'No help for testplugin->foo->bar');
      done();
    });

    igelkott.plugin.load('testplugin', {}, TestPluginContructor);

    igelkott.connect();
    s.write(':jsmith!~jsmith@unaffiliated/jsmith PRIVMSG #channel :!help testplugin foo bar\r\n');
  });

});
