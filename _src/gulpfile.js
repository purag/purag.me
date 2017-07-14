const gulp = require('gulp');
const data = require('gulp-data');
const path = require('path');
const fs = require('fs');
const pug = require('gulp-pug');
const del = require('del');
const sass = require('gulp-sass');
const yaml = require('node-yaml');
const concat = require('gulp-concat');
const uglify = require('uglify-es');
const composer = require('gulp-uglify/composer');
const compressJS = composer(uglify, console);

// Set the destination directory for the build
let SRC = '.';
let DEST = '..';

const paths = {
  html: {
    src: [`${SRC}/views/**/*.pug`, `!${SRC}/views/includes/*`],
    dst: DEST,
  },
  css: {
    src: [`${SRC}/sass/*.sass`],
    dst: `${DEST}/assets/css`,
  },
  js: {
    src: [`${SRC}/js/*.js`],
    dst: `${DEST}/assets/js`,
  },
  dest: [`${DEST}/**/*.html`, `${DEST}/assets/`]
};

const from = gulp.src;
const to = gulp.dest;

// Compile the SASS and copy to build directory
gulp.task('css', () => {
  from(paths.css.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(to(paths.css.dst));
});

// Render the pug templates w/ their respective locals
gulp.task('html', () => {
  from(paths.html.src)
    .pipe(data((f) => {
      f = path.relative(`${SRC}/views`, f.path).slice(0, -4);
      return Object.assign({}, yaml.readSync(`${SRC}/data/global`),
        yaml.readSync(`${SRC}/data/${f}`));
    }))
    .pipe(pug())
    .pipe(to(paths.html.dst));
});

// Concatenate and ugify the JavaScript
gulp.task('js', () => {
  from(paths.js.src)
    .pipe(concat('all.js'))
    .pipe(compressJS())
    .pipe(to(paths.js.dst));
});

// Wipe everything if necessary
gulp.task('clean', () => {
  del(paths.dest);
});

gulp.task('default', ['html', 'css', 'js']);