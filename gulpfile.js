const {series, watch, src, dest, parallel} = require('gulp');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const postCss = require('gulp-postcss');
const livereload = require('gulp-livereload');
const pump = require('pump');
var beeper = require('beeper');

// postcss plugins
var autoprefixer = require('autoprefixer');
var colorFunction = require('postcss-color-mod-function');
var cssnano = require('cssnano');
var easyimport = require('postcss-easy-import');

function serve(done)
{
    livereload.listen();
    done();
}

const handleError = (done) => {
    return function (err) {
        if (err) {
            beeper();
        }
        return done(err);
    };
};

function js(done)
{
    pump(
        [
            src('assets/js/*.js', {sourcemaps: true}),
            uglify(),
            dest('assets/built/', {sourcemaps: '.'}),
            livereload()
        ], handleError(done)
    );
}

function scss(done)
{
    var processors = [
        easyimport,
        colorFunction(),
        autoprefixer(),
        cssnano()
    ];
 
    pump(
        [
            src('assets/css/sass/*.scss', {sourcemaps: true}),
            sass(),
            postCss(processors),
            dest('assets/built/', {sourcemaps: '.'}),
            livereload()
        ], handleError(done)
    );
}

function css(done)
{
    var processors = [
        easyimport,
        colorFunction(),
        autoprefixer(),
        cssnano()
    ];

    pump(
        [
            src('assets/css/*.css', {sourcemaps: true}),
            postCss(processors),
            dest('assets/built/', {sourcemaps: '.'}),
            livereload()
        ], handleError(done)
    );
}

function hbs(done) {
    pump([
        src(['*.hbs', '**/**/*.hbs', '!node_modules/**/*.hbs']),
        livereload()
    ], handleError(done));
}

const sassWatcher = () => watch('assets/css/sass/*.scss', scss);
const cssWatcher = () => watch('assets/css/*.css', css);
const hbsWatcher = () => watch(['*.hbs', '**/**/*.hbs', '!node_modules/**/*.hbs'], hbs);
const watcher = parallel(sassWatcher, cssWatcher, hbsWatcher);
const build = series(scss, css, js);
const dev = series(build, serve, watcher);

exports.build = build;
exports.default = dev;
exports.scss = scss;