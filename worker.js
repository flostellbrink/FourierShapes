var mathjs = require("mathjs");

const MAX_DEPTH = 500;

module.exports = function (self) {
    self.addEventListener('message', function (e) {
        findWeights(e.data)
    });

    function findWeights(pathData) {
        for (var i = 0; i < MAX_DEPTH; i++) {
            // Transform path data e^-i 2pi t
            var newPath = pathData.map((value, index) =>
                mathjs.multiply(
                    mathjs.pow(
                        mathjs.e,
                        mathjs.multiply(
                            -i * 2 * mathjs.pi * (index / pathData.length),
                            mathjs.i)),
                    mathjs.complex(value.re, value.im)));
            self.postMessage({index: i, weight: mathjs.mean(...newPath)});
        }
    }
};
