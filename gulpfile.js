var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

// 清除目标代码
gulp.task('clean', function () {
  return gulp.src('dist', { read: false })
    .pipe(plugins.clean());
});

// 复制静态数据
gulp.task('copy', function() {
	gulp.src(['./src/images/*'], { base: 'src' })
		.pipe(gulp.dest('./dist'));
});

// 生产时复制并压缩html
gulp.task('html-prd', function() {
	var opts = {
		comments: true
	};
	var replaceOpts = {
		// 生产使用的css和js路径
		'css': ['styles.min.css'],
		'js': ['js/bundle.min.js']
	};

	gulp.src(['./src/index.html'])
		.pipe(plugins.htmlReplace(replaceOpts))
		.pipe(plugins.minifyHtml(opts))
		.pipe(gulp.dest('./dist'));
});

// 生产时复制、编译和压缩scss文件
gulp.task('css-prd', function() {
	var opts = {
		outputStyle: 'compressed'
	};

	gulp.src('./src/sass/*.scss')
	  .pipe(plugins.sass(opts))
	  .pipe(gulp.dest('./dist/styles'));
});

// 生产时对js进行校验、压缩、合并以及复制
gulp.task('js-prd', function() {
	gulp.src('./src/scripts/**/*.js', { base: 'src' })
		.pipe(plugins.jshint())
		.pipe(plugins.jshint.reporter(plugins.stylish))
		.pipe(plugins.jshint.reporter('fail'))
		.pipe(plugins.uglify())
		.pipe(plugins.concat('main.js'))
		.pipe(gulp.dest('./dist'));
});

// 开发时对html进行重载
gulp.task('html-dev', function() {
	gulp.src('./src/**/*.html')
		.pipe(plugins.plumber()) // 错误时不终止运行
	  .pipe(plugins.connect.reload());
});

// 开发时对sass进行编译到styles目录
gulp.task('sass-dev', function() {
	gulp.src('./src/sass/*.scss')
		.pipe(plugins.plumber()) // 错误时不终止运行
    .pipe(plugins.sass())
    .pipe(gulp.dest('./src/styles'))
    .pipe(plugins.connect.reload());
});

// 开发时对JS进行jshint校验
gulp.task('js-dev', function() {
	gulp.src('./src/scripts/**/*.js')
		.pipe(plugins.plumber()) // 错误时不终止运行
		.pipe(plugins.jshint())
		.pipe(plugins.jshint.reporter(plugins.stylish))
		.pipe(plugins.jshint.reporter('fail'))
		.pipe(plugins.connect.reload());
});

// 开发时实时对js和sass进行监控
gulp.task('watch', function() {
  gulp.watch('./src/sass/*.scss', ['sass-dev']);
  gulp.watch('./src/scripts/**/*.js', ['js-dev']);
  gulp.watch('./src/**/*.html', ['html-dev']);
});

// 开发时开启本地服务器
gulp.task('server', function() {
  return plugins.connect.server({
    root: './src',// 本地服务根路径
    port: 3000,
    livereload: true,
    fallback: 'src/index.html'
  });
});

// 自动开启浏览器
gulp.task('browser', function() {
	var opts = {
		app: 'chrome', //'google-chrome' -- Linux 'chrome' -- Windows 'google chrome' -- OSX  'firefox'
		url: 'http://localhost:3000' 
	};

  gulp.src('./src/index.html')
 		.pipe(plugins.open('', opts ));
});

// 实时开发
gulp.task('default', [ 'server', 'browser', 'watch', 'html-dev', 'js-dev', 'sass-dev' ]);

// 构建生产代码
gulp.task('prd', [ 'clean', 'js-prd', 'css-prd', 'html-prd', 'copy' ]);