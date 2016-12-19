/**
 * Created by Moiz.Kachwala on 08-06-2016.
 */
"use strict";

const gulp = require("gulp"),
    del = require("del"),
    tsc = require("gulp-typescript"),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    nodemon = require('gulp-nodemon'),
    webpack = require('gulp-webpack'),
    exec = require('child_process').exec,
    path = require('path');

/**
 * Remove build directory.
 */
gulp.task('clean', (cb) => {
    return del(["build"], cb);
});


/**
 * Compile TypeScript sources and create sourcemaps in build directory.
 */
var tsProject = tsc.createProject('tsconfig.json');
gulp.task("compile", () => {

    var tsResult = gulp.src(['./**/*.ts', '!./node_modules/**', '!./client/**', '!./build/**'])
        .pipe(sourcemaps.init())
        .pipe(tsProject());
    return tsResult.js
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./build'));
});


gulp.task('reload', reload);

/**
 * Watch for changes in TypeScript, HTML and CSS files.
 */
gulp.task('watch', function () {
    gulp.watch(["./**/*.ts", '!./node_modules/**', '!./client/**', '!./build/**'], ['compile']).on('change', function (e) {
        console.log('TypeScript file ' + e.path + ' has been changed. Compiling.');
    });
});

gulp.task('default', ['compile', 'watch'], function () {
});
