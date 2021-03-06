var docProcessorFactory = require('../lib/doc-processor');
var tagParser = jasmine.createSpyObj('tagParser', ['parse', 'getTags']);
var tagDefs = [];

describe("doc-processor", function() {

  it("should throw error if the config is invalid", function() {
    expect(function() {
      docProcessorFactory({});
    }).toThrow('Invalid config - you must provide a config object with a "processing" property');
  });

  it("should call each of the processors in turn, passing the docs object to each", function() {
    var log = [], docs = [ { content: 'a'}, { content: 'b'}];
    before = { name: 'before', before: function(docs) { log.push('before'); return docs; } };
    each = { name:'each', each: function(doc) { log.push('each:' + doc.content); } };
    after = { name: 'after', after: function(docs) { log.push('after'); return docs; } };


    var config = {
      processing: {
        processors: [before, each, after]
      }
    };

    var process = docProcessorFactory(config);
    var processedDocs = process(docs);
    expect(log).toEqual(['before', 'each:a', 'each:b', 'after']);
    expect(processedDocs).toEqual(docs);
  });

  it("should wrap and rethrow exceptions thrown by processors", function() {
    var badProcessor = {
      name: 'bad-processor',
      each: function() { throw new Error('processor failed'); }
    };
    var process = docProcessorFactory({ processing: { processors: [badProcessor]} });
    var doc = {};
    expect(function() { process([doc]); }).toThrow('Error processing document "unknown" with processor "bad-processor": Error: processor failed');
    doc.name = 'doc-name';
    expect(function() { process([doc]); }).toThrow('Error processing document "doc-name" with processor "bad-processor": Error: processor failed');
    doc.name = 'doc-id';
    expect(function() { process([doc]); }).toThrow('Error processing document "doc-id" with processor "bad-processor": Error: processor failed');
  });

  it("should order the processors by dependency", function() {
    var log = [], docs = { content: 'x' };
    var config = { processing: {
      processors: [
        { name: 'a', requires: ['c'], each: function(doc) { log.push('a'); } },
        { name: 'b', requires: ['c','e','a'], each: function(doc) { log.push('b'); } },
        { name: 'c', requires: ['e'], each: function(doc) { log.push('c'); } },
        { name: 'd', requires: ['a'], each: function(doc) { log.push('d'); } },
        { name: 'e', requires: [], each: function(doc) { log.push('e'); } }
      ]
    } };
    var process = docProcessorFactory(config);
    process(docs);
    expect(log).toEqual(['e', 'c', 'a', 'b', 'd']);
  });

});
