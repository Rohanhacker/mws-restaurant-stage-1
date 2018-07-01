var gulp = require("gulp");
var $ = require("gulp-load-plugins")();

gulp.task("images", function() {
  return gulp
    .src("img/*.{jpg,png}")
    .pipe(
      $.responsive({
        // Convert all images to JPEG format
        "*": [
          {
            width: 300,
            rename: {
              extname: ".jpg"
            }
          },
          {
            width: 300 * 2,
            rename: {
              suffix: "@2x",
              extname: ".jpg"
            }
          },
          {
            width: 800,
            rename: {
              suffix: "@3x",
              extname: ".jpg"
            }
          },
        ]
      })
    )
    .pipe(gulp.dest("dist"));
});
