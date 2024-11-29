const watch = require('node-watch');
const { buildLess } = require('./build.js');

watch('less', { recursive: true }, function (evt, name) {
    console.log('%s changed.', name);
    buildLess();
});