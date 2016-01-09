'use strict';

const gulp = require('gulp');
const gutil = require('gulp-util');
const chmod = require('gulp-chmod');
const eol = require('gulp-eol');
const eslint = require('gulp-eslint');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const browserify = require('browserify');
const watchify = require('watchify');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');
const cp = require('child_process');

function updatePythonPackage (options) {
    const opt =
        'build_data' + (options.min ? ' --min' : '') + ' build';
    cp.exec('cd dist_python; ./setup.py ' + opt, function (err, stdout, stderr) {
        if (err) {
            gutil.log(gutil.colors.red('Failed'), 'to update python package\n', stderr);
            return;
        }
        gutil.log(gutil.colors.green('Finished'), 'updating python package');
    });
}

function watchScript (options) {
    let browserifyOpts = {
        entries: [options.entry],
        debug: false,
        transform: [
            ['babelify', {
                presets: ["es2015", "react"],
                plugins: ["transform-object-rest-spread"]
            }]
        ]
    };
    browserifyOpts = Object.assign({}, watchify.args, browserifyOpts);
    let bundler = watchify(browserify(browserifyOpts));
    const rebundle = function () {
        return bundler.bundle()
            .on('error', function (err) {
                console.log(err.message);
                console.log(err.codeFrame);
                this.emit('end');
            })
            .pipe(source(options.output))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write("./"))
            .pipe(chmod(644))
            .pipe(eol("\n"))
            .pipe(gulp.dest("dist"));
    };
    bundler.on('log', gutil.log);
    bundler.on('update', rebundle);
    if (options.updatePython) {
        bundler.on('bytes', function (count) {
            updatePythonPackage({min: false});
        });
    }
    rebundle();
}

function buildScript (options) {
    const bundler = browserify({
        entries: [options.entry],
        transform: [
            ['babelify', {
                presets: ["es2015", "react"],
                plugins: ["transform-object-rest-spread"]
            }]
        ]
    });
    let stream = bundler.bundle()
        .pipe(source(options.output))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}));
    if (options.uglify)
        stream = stream.pipe(uglify());
     return stream
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist'));
}

function buildCss(options) {
    const processors = [
        require('postcss-import')({from: options.entry})
    ];
    if (options.uglify)
        processors.push(require('cssnano'));
    var stream = gulp.src(options.entry)
        .pipe(rename(options.output))
        .pipe(sourcemaps.init())
        .pipe(postcss(processors))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest('dist'));
}

gulp.task('build_js', function () {
    return buildScript({entry: 'src/main.js', output: 'main.js'})
});
gulp.task('build_css', function () {
    return buildCss({entry: 'src/main.css', output: 'main.css'});
});
gulp.task('build', ['build_js', 'build_css'], function () {
    return updatePythonPackage({min: false});
});

gulp.task('build_js_min', function () {
    return buildScript({entry: 'src/main.js', output: 'main.min.js', uglify: true});
});
gulp.task('build_css_min', function () {
    return buildCss({entry: 'src/main.css', output: 'main.min.css', uglify: true});
});
gulp.task('build_min', ['build_js_min', 'build_css_min'], function () {
    return updatePythonPackage({min: true});
});

// Run 'gulp build' before 'gulp watch'.
gulp.task('watch_js', function () {
    watchScript({entry: 'src/main.js', output: 'main.js', updatePython: true});
});
gulp.task('build_css_py', ['build_css'], function () {
    return updatePythonPackage({min: false});
});
gulp.task('watch_css', function () {
    gulp.watch('src/**/*.css', ['build_css_py']);
});
gulp.task('watch', ['watch_js', 'watch_css']);

gulp.task('lint', function() {
  return gulp.src('./src/**/*.js')
    .pipe(eslint({
        extends: "eslint:recommended",
        ecmaFeatures: {
            arrowFunctions: true,
            blockBindings: true,
            destructuring: true,
            modules: true,
            jsx: true,
            objectLiteralComputedProperties: true,
            unicodeCodePointEscapes: true,
            experimentalObjectRestSpread: true
        },
        plugins: [
            "react"
        ],
        envs: [
            'browser',
            'commonjs'
        ],
        globals: {
            'Alkindi': false
        },
        'rules': {
            // jsx-quotes
            "no-unused-vars": [2, {"args": "after-used", "argsIgnorePattern": "^_"}],
            "react/jsx-uses-react": 1,
            "react/jsx-uses-vars": 1,
            "react/jsx-no-bind": 1,
            "react/jsx-no-duplicate-props": 1,
            "react/jsx-no-undef": 1,
            "react/jsx-pascal-case": 1,
            // "react/no-danger": 1,
            "react/no-deprecated": 1,
            "react/no-did-mount-set-state": 1,
            "react/no-did-update-set-state": 1,
            "react/no-direct-mutation-state": 1,
            "react/no-is-mounted": 1,
            // "react/no-string-refs": 1,
            "react/no-unknown-property": 1,
            "react/self-closing-comp": 1,
            "react/wrap-multilines": 1
        }
    }))
    .pipe(eslint.format());
});

gulp.task('playfair', function () {
    watchScript({entry: 'src/playfair/main.js', output: 'playfair.js'});
});

gulp.task('default', ['build_min']);
