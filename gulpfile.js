var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var sass        = require('gulp-sass');

// Static Server + watching scss/html files
gulp.task('serve', ['sass'], function() {


    browserSync.init({
        port: 8081,
        notify: false,

        server: {

            baseDir: ['./', ''],
            routes: {
                '/bower_components': 'bower_components',
                '/node_modules': 'node_modules'
            }
        }
    });

    gulp.watch("./assets/scss/**/*.scss", ['sass']);
    gulp.watch("./*.html").on('change', browserSync.reload);
});

gulp.task('sass', function() {
    return gulp.src("./assets/scss/**/*.scss")
        .pipe(sass())
        .pipe(gulp.dest("./assets/css"))
        .pipe(browserSync.stream());
});

gulp.task('default', ['serve']);
