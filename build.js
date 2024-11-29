const less = require('less');
const fs = require('fs');

const buildLess = () => {
    fs.readFile('less/main.less', function (error, data) {
        data = data.toString();
        try {
            less.render(data, function (e, css) {
                if (!fs.existsSync('dist')) {
                    fs.mkdirSync('dist');
                }
                fs.writeFile('dist/main.css', css.css, function (err) {
                    console.log('Less compiled');
                });
            });
        } catch (err) {
            console.error('COULD NOT COMPILE LESS!');
        }
    });
}

module.exports = {
    buildLess
}