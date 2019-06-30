var mathjs = require("mathjs");
var svgPathInterpolator = require("svg-path-interpolator");
var interpolator = new svgPathInterpolator({
    joinPathData: true,
    minDistance: 0.5,
    roundToNearest: 0.1,
    sampleFrequency: 0.01
});

const WIDTH = 600;
const HEIGHT = 600;
const SCALE_X = 200;
const SCALE_Y = 200;

var ctx = undefined;
var pathData = undefined;
var depth = 100;
var weights = undefined;
var start = new Date();

function setDepth(value) {
    depth = value;
    findWeights();
}

window.onload = () => {
    canvas = document.getElementById("canvas");
    canvas.ondragover = e => {
        e.preventDefault();
        return false;
    };
    canvas.ondrop = dropHandler;

    file = document.getElementById("file");
    file.onchange = fileChangeHandler;

    reverse = document.getElementById("reverse");
    reverse.onclick = () => {
        pathData.reverse();
        findWeights();
    }

    depthRange = document.getElementById("depth");
    depthRange.onchange = () => setDepth(depthRange.value);

    loadSvg("<svg><path d=\"M213.1,6.7c-32.4-14.4-73.7,0-88.1,30.6C110.6,4.9,67.5-9.5,36.9,6.7C2.8,22.9-13.4,62.4,13.5,110.9,C33.3,145.1,67.5,170.3,125,217c59.3-46.7,93.5-71.9,111.5-106.1C263.4,64.2,247.2,22.9,213.1,6.7z\" /></svg>", true)
    window.requestAnimationFrame(draw);
}

function fileChangeHandler(e) {
    if (!e.target.files) {
        console.error("No file in drop")
    }
    loadSvgFile(e.target.files[0])
}

function dropHandler(e) {
    e.preventDefault();
    if (!e.dataTransfer.files) {
        console.error("No file in drop")
    }
    loadSvgFile(e.dataTransfer.files[0])
}

function loadSvgFile(file) {
    var reader = new FileReader();
    reader.onload = le => loadSvg(le.target.result);
    reader.readAsText(file)
}

function loadSvg(svgString, reverse = false) {
    var path = interpolator.processSvg(svgString);
    var pathXs = normalize(path.filter((item, index) => index % 2 === 0));
    var pathYs = normalize(path.filter((item, index) => index % 2 === 1));
    pathData = pathXs.map((x, index) => mathjs.complex(x, pathYs[index]));
    if(reverse) {
        pathData = pathData.reverse();
    }
    findWeights();
}

function findWeights() {
    weights = []
    for (var i = 0; i < depth; i++) {
        // Transform path data e^-i 2pi
        var newPath = pathData.map((value, index) =>
            mathjs.multiply(
                mathjs.pow(
                    mathjs.e,
                    mathjs.multiply(
                        -i * 2 * mathjs.pi * (index / pathData.length),
                        mathjs.i)),
                value));
        weights.push(mathjs.mean(...newPath))
    }
}

function normalize(values) {
    var min = Math.min(...values);
    var max = Math.max(...values);
    return values.map(item => (item - min) / (max - min) * 2 - 1)
}

function draw() {
    if (!ctx) {
        ctx = document.getElementById('canvas').getContext('2d');
        ctx.globalCompositeOperation = 'destination-over';
        ctx.strokeStyle = "#1f77b4";
        ctx.translate(WIDTH / 2, HEIGHT / 2)
    }

    var time = ((new Date() - start) / 10000.0) % 1.0;
    ctx.clearRect(-WIDTH / 2.0, -HEIGHT / 2.0, WIDTH, HEIGHT);

    var position = mathjs.complex(0, 0)
    ctx.beginPath()
    ctx.moveTo(0, 0);
    for (var i = 0; i < depth; i++) {
        // Offset : w * e^n 2pi it
        var exp = mathjs.multiply(i * 2 * mathjs.pi * time, mathjs.i);
        var pos = mathjs.multiply(weights[i], mathjs.pow(mathjs.e, exp));
        position = mathjs.add(position, pos);
        ctx.lineTo(position.re * SCALE_X, position.im * SCALE_Y);
    }
    ctx.stroke();
    ctx.fillStyle = "#17becf";
    ctx.fillRect(position.re * SCALE_X - 4, position.im * SCALE_Y - 4, 8, 8);

    ctx.fillStyle = "#ff7f0e";
    for (item of pathData || []) {
        ctx.fillRect(item.re * SCALE_X, item.im * SCALE_Y, 1, 1);
    }
    var current = pathData[Math.round((pathData.length - 1) * time)]
    ctx.fillRect(current.re * SCALE_X - 4, current.im * SCALE_Y - 4, 8, 8);

    window.requestAnimationFrame(draw);
}
