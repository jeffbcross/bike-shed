var INPUT_TYPE = /input\[(.+)\]/;
var checkProperty = require('../../../lib/utils/check-property');

module.exports = {
  name: 'input-type',
  requires: ['doctrine-tag-extractor'],
  each: function(doc) {
    if ( doc.docType === 'input' ) {

      checkProperty(doc, 'name');
      var match = INPUT_TYPE.exec(doc.name);
      if ( !match ) {
        throw new Error('Invalid input directive name.  It should be of the form: "input[inputType]" but was "' + doc.name + '"');
      }
      doc.inputType = match[1];
    }
  }
};