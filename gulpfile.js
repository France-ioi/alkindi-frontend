'use strict';

const gulp = require('gulp');
const gutil = require('gulp-util');
const chmod = require('gulp-chmod');
const eol = require('gulp-eol');
const eslint = require('gulp-eslint');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const cssnano = require('gulp-cssnano');
const rename = require('gulp-rename');
const browserify = require('browserify');
const watchify = require('watchify');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');
const cp = require('child_process');

function updatePythonPackage (min) {
    const opt = ('build_data' + (min ? ' --min' : '')) + ' build';
    cp.exec('cd dist_python; ./setup.py ' + opt, function (err, stdout, stderr) {
        if (err) {
            gutil.log(gutil.colors.red('Failed'), 'to update python package\n', stderr);
            return;
        }
        gutil.log(gutil.colors.green('Finished'), 'updating python package');
    });
}

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
    let output = options.output;
    if (options.uglify)
        output = output.replace(/.js$/, '.min.js');
    const rebundle = function () {
        let p = bundler.bundle()
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))
            .pipe(source(output))
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
        updatePythonPackage(options.uglify);
    });
    rebundle();
}

function buildCss(options) {
    var stream = gulp.src(options.entry);
    let output = options.output;
    if (options.uglify) {
        output = output.replace(/.css$/, '.min.css');
        stream = stream
            .pipe(sourcemaps.init())
            .pipe(rename(output))
            .pipe(cssnano())
            .pipe(sourcemaps.write("."));
    }
    stream = stream.pipe(gulp.dest('dist'));
    stream.on('end', function () {
        updatePythonPackage(options.uglify);
    });
}

function modifiedBuild (mod) {
    return function () {
        buildScript(mod({entry: 'src/main.js', output: 'main.js'}));
    };
}

function plain (opts) {
    return opts;
}

function watched (opts) {
    return Object.assign({}, opts, {watch: true, uglify: true});
}

function uglified (opts) {
    return Object.assign({}, opts, {uglify: true});
}

gulp.task('build_css', function () {
    buildCss({entry: 'src/main.css', output: 'main.css'});
});
gulp.task('build_css_min', function () {
    buildCss({entry: 'src/main.css', output: 'main.css', uglify: true});
});
gulp.task('watch_css', function () {
    gulp.watch('src/**/*.css', ['build_css']);
});

gulp.task('build', ['build_css'], modifiedBuild(plain));
gulp.task('build_min', ['build_css_min'], modifiedBuild(uglified));
gulp.task('watch', ['watch_css'], modifiedBuild(watched));

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

gulp.task('default', ['build_min']);
