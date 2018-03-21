const gulp = require('gulp');
const flatten = require('gulp-flatten');
const runSequence = require('run-sequence');
const browserSync = require('browser-sync');
const historyApiFallback = require('connect-history-api-fallback')
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
const cssnano = require('gulp-cssnano');
const fs = require("fs");
const inject = require('gulp-inject-string');
const reload = browserSync.reload;
const include = require('gulp-html-tag-include');


var assets = function () {
    gulp.src("./src/assets/**/*")
        .pipe(flatten())
        .pipe(gulp.dest('docs/assets'));
}

var html = function () {
    var cssContent1 = fs.readFileSync("./docs/main.css", "utf8");
    var cssContent2 = fs.readFileSync("./docs/page.css", "utf8");
    gulp.src("./src/html/*.html")
        .pipe(include())
        .pipe(inject.after('style amp-custom>', cssContent2))
        .pipe(inject.after('style amp-custom>', cssContent1))
        .pipe(gulp.dest("./docs")).on('end', assets)
        .pipe(reload({
            stream: true
        }));
}



gulp.task('compile', function () {
    gulp.src('./src/sass/*.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(cssnano())
        .pipe(gulp.dest('./docs')).on('end', html);
});



const gulpAmpValidator = require('gulp-amphtml-validator');

gulp.task('amphtml', () => {
    gulp.src('src/**/*.html')
        // Validate the input and attach the validation result to the "amp" property
        // of the file object. 
        .pipe(gulpAmpValidator.validate())
        // Print the validation results to the console.
        .pipe(gulpAmpValidator.format())
        // Exit the process with error code (1) if an AMP validation error
        // occurred.
        .pipe(gulpAmpValidator.failAfterError());
});


// watch files for changes and reload
gulp.task('serve', function () {
    browserSync({
        server: {
            baseDir: ['.tmp', 'docs'],
            middleware: [historyApiFallback()]
        },
        notify: false
    });

    gulp.watch(['src/**/*'], function (callback) { runSequence('compile', reload) });
});

gulp.task('default', function (callback) { runSequence('compile', 'serve') });