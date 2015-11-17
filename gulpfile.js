
var gulp = require('gulp');
var gutil = require('gulp-util');
var chmod = require('gulp-chmod');
var eol = require('gulp-eol');
var eslint = require('gulp-eslint');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var watchify = require('watchify');
var assign = require('lodash.assign');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');

function buildScript (options) {
    var browserifyOpts = {
        entries: [options.entry],
        debug: true,
        transform: [
            ['babelify', {presets: ["es2015", "react"]}],
            'cssify'
        ]
    };
    if (options.watch)
        browserifyOpts = assign({}, watchify.args, browserifyOpts);
    var bundler = browserify(browserifyOpts);
    if (options.watch)
        bundler = watchify(bundler);

    function rebundle () {
        var p = bundler.bundle()
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
    }

    bundler.on('log', gutil.log);
    bundler.on('update', rebundle);
    return rebundle();
}

function watched(opts) {
    return assign({}, opts, {watch: true});
}

function uglified(opts) {
    var output = opts.output.replace(/.js$/, '.min.js');
    return assign({}, opts, {uglify: true, output: output});
}

var mainScriptOpts = {
    entry: 'src/app.js',
    output: 'app.js',
    watch: false,
    uglify: false
};

gulp.task('build', [], function () {
    buildScript(mainScriptOpts);
});

gulp.task('build_min', [], function () {
    buildScript(uglified(mainScriptOpts))
});

gulp.task('watch', [], function () {
    buildScript(watched(mainScriptOpts));
});

gulp.task('lint', function() {
  return gulp.src('./src/**/*.js')
    .pipe(eslint({
        extends: "eslint:recommended",
        ecmaFeatures: {
            jsx: true
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
