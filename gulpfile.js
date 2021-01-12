/* Dependencies */
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const autoprefixer = require('gulp-autoprefixer');
const fileinclude = require('gulp-file-include');
const sass = require('gulp-sass');
const filter = require('gulp-filter')
const minimist = require('minimist');
const del = require('del');
const gulpAmpValidator = require('gulp-amphtml-validator');
const bs = require('browser-sync').create();
const reload = bs.reload;
const replace = require('gulp-replace');
const noop = require('gulp-noop');
const through2 = require('through2');
const mergeMediaQuery = require('gulp-merge-media-queries');
const AmpOptimizer = require('@ampproject/toolbox-optimizer');
const log = require('fancy-log')
const tap = require('gulp-tap')

const ampOptimizer = AmpOptimizer.create();

// Build type is configurable such that some options can be changed e.g. whether
// to minimise CSS. Usage 'gulp <task> --env development'.
const knownOptions = {
    string: 'env',
    default: { env: process.env.NODE_ENV || 'dist' }
};

const options = minimist(process.argv.slice(2), knownOptions);

const paths = {
    css: {
        src: 'src/sass/**/*.scss',
        dest: 'src/css/'
    },
    html: {
        src: 'src/html/pages/*.html',
        dest: 'dist/'
    },
    images: {
        src: 'src/img/**/*.{gif,jpg,png,svg,jpeg}',
        dest: 'dist/img'
    },
    // favicon: {
    //     src: 'src/favicon/*',
    //     dest: 'dist/'
    // },
};

/**
 * Builds the styles, bases on SASS files taken from src. The resulting CSS is
 * used as partials that are included in the final AMP HTML.
 * When SASS sees a non-ASCII character in a file, it starts the CSS file it builds with "@charset "UTF-8";".
 * That's great in CSS files, but not accepted within <style> tags.
 * So unless the SASS team takes on https://github.com/sass/sass/issues/2288, we need to remove it.
 */

gulp.task('styles', function buildStyles() {
    const cssEncodingDirective = '@charset "UTF-8";';
    
    return gulp.src(paths.css.src)
        .pipe(plumber())
        .pipe(sass(options.env === 'dist' ? { outputStyle: 'compressed' } : {}))
        .pipe(options.env === 'dev' ? replace(cssEncodingDirective, '') : noop())
        .pipe(autoprefixer('last 10 versions'))
        .pipe(mergeMediaQuery({log: true}))
        .pipe(gulp.dest(paths.css.dest));
});

/**
 * Copies the images to the distribution.
 */
gulp.task('images', function buildImages() {
    return gulp.src(paths.images.src)
        .pipe(gulp.dest(paths.images.dest));
});

/**
 * Copies the favicon to the distribution.
 */
// gulp.task('favicon', function buildImages() {
//     return gulp.src(paths.favicon.src)
//         .pipe(gulp.dest(paths.favicon.dest));
// });

/**
 * Builds the HTML files. Only files from 'pages' are built.
 * We don't want to build partials!
 * Use the AMP Optimizer to add any scripts required by AMP components,
 * and to perform the optimizations done by AMP caches right here in our HTML,
 * greatly speeding up our AMP pages when served from our origin.
 */
gulp.task('html', gulp.series('styles', function buildHtml() {
    const pageFilter = filter(['**/pages/*.html']);
    
    return gulp.src(paths.html.src)
        .pipe(pageFilter)
        .pipe(fileinclude({
            prefix: '%%',
            basepath: '@file'
        }))
        .pipe(through2.obj(async (file, _, cb) => {
            if (file.isBuffer()) {
                const optimizedHtml = await ampOptimizer.transformHtml(file.contents.toString())
                file.contents = Buffer.from(optimizedHtml)
            }
            cb(null, file);
        }))
        .pipe(tap(function(file) {
        
            const regex = /[^/]+$/
            let href = 'index.html'
            if (regex.test(file.path) && file.path.match(regex) && file.path.match(regex).length) {
                href = file.path.match(regex)[0]
            }
            // get current contents
            let contents = file.contents.toString();
        
            // do your conditional processing
            // eg deal with each tag in a loop & only change those without the attribute
            contents = contents.replace(/href="Canonical"/, `href="https://www.triple13.io/${href}"`);
        
            // set new contents to flow through the gulp stream
            file.contents = Buffer.from(contents)
        }))
        .pipe(gulp.dest(paths.html.dest));
}));

/**
 * Checks resulting output AMP HTML for validity.
 */
gulp.task('validate', function validate() {
    return gulp.src(paths.html.dest + '/**/*.html')
        .pipe(gulpAmpValidator.validate())
        .pipe(gulpAmpValidator.format())
        .pipe(gulpAmpValidator.failAfterError());
});

/**
 * Removes all files from the distribution directory, and also the CSS build
 * directory.
 */
gulp.task('clean', function clean() {
    return del([
        paths.html.dest + '/**/*',
        paths.css.dest + '/**/*'
    ]);
});

/**
 * Builds the output from sources.
 */
gulp.task('build', gulp.series('images',
    // 'favicon',
    'html',
    // 'validate'
));

/**
 * First rebuilds the output then triggers a reload of the browser.
 */
gulp.task('rebuild', gulp.series('build', function rebuild(done) {
    bs.reload();
    done();
}));

gulp.task('browserSync', function sync (done) {
    bs.init({
        server: {
            baseDir: "dist",
            index: "./index.html"
        },
    })
    done();
})

/**
 * Sets up live-reloading: Changes to HTML or CSS trigger a rebuild, changes to
 * images, favicon, root config files and server only result in images, favicon, root config files, server and helper classes being copied again to dist.
 */
gulp.task('watch', function watch(done) {
    gulp.watch(paths.images.src, gulp.series('images'));
    gulp.watch('src/html/**/*.html', gulp.series('rebuild'));
    gulp.watch(paths.css.src, gulp.series('rebuild'));
    done();
});

/**
 * Prepares a clean build.
 */
gulp.task('prepare', gulp.series('clean', 'build'));

/**
 * Default task is to perform a clean build then set up browser sync for live
 * reloading.
 */
gulp.task('default', gulp.series('build',
    'browserSync',
    'watch'
));
