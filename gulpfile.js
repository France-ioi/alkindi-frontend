'use strict';

const gulp = require('gulp');
const gutil = require('gulp-util');
const chmod = require('gulp-chmod');
const eol = require('gulp-eol');
const eslint = require('gulp-eslint');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const browserify = require('browserify');
const watchify = require('watchify');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');
const cp = require('child_process');

function buildScript (options) {
    let browserifyOpts = {
        entries: [options.entry],
        debug: true,
        transform: [
            ['babelify', {
                presets: ["es2015", "react"],
                plugins: ["transform-object-rest-spread"]
            }],
            'browserify-css'
        ]
    };
    if (options.watch)
        browserifyOpts = Object.assign({}, watchify.args, browserifyOpts);
    let bundler = browserify(browserifyOpts);
    if (options.watch)
        bundler = watchify(bundler);
    const rebundle = function () {
        let p = bundler.bundle()
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))
            .pipe(source(options.output))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}));
        if (options.uglify)
            p = p.pipe(uglify());
        return p
            .pipe(sourcemaps.write("."))
            .pipe(chmod(644))
            .pipe(eol("\n"))
            .pipe(gulp.dest("dist"));
    };
    bundler.on('log', gutil.log);
    bundler.on('update', rebundle);
    bundler.on('bytes', function () {
        cp.exec('cd dist_python; ./setup.py build', function (err, stdout, stderr) {
            gutil.log('python package updated');
        });
    });
    rebundle();
}


function modifiedBuild (mod) {
    return function () {
        buildScript(mod({entry: 'src/main.js', output: 'main.js'}));
    };
}

function watched(opts) {
    return Object.assign({}, opts, {watch: true});
}

function uglified(opts) {
    const output = opts.output.replace(/.js$/, '.min.js');
    return Object.assign({}, opts, {uglify: true, output: output});
}

gulp.task('build', [], modifiedBuild(function (opts) { return opts; }));
gulp.task('build_min', [], modifiedBuild(uglified));
gulp.task('watch', [], modifiedBuild(watched));

gulp.task('lint', function() {
  return gulp.src('./src/**/*.js')
    .pipe(eslint({
        extends: "eslint:recommended",
        ecmaFeatures: {
            blockBindings: true,
            jsx: true,
            modules: true,
            experimentalObjectRestSpread: true
        },
        plugins: [
            "react"
        ],
        envs: [
            'browser',
            'commonjs'
        ]
    }))
    .pipe(eslint.format());
});

gulp.task('default', ['build']);
