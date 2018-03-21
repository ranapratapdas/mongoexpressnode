var Blog = require('../models/blog');
var BlogInstance = require('../models/bloginstance');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

exports.index = function(req, res) {

    async.parallel({
        blog_count: function(callback) {
            Blog.count(callback);
        },
        blog_instance_count: function(callback) {
            BlogInstance.count(callback);
        },
        blog_instance_available_count: function(callback) {
            BlogInstance.count({status:'Available'},callback);
        },
    }, function(err, results) {
        res.render('index', { title: 'Blog Engine', error: err, data: results });
    });
};


// Display list of all blogs.
exports.blog_list = function(req, res, next) {

  Blog.find({}, 'title author ')
    .populate('author')
    .exec(function (err, list_blogs) {
      if (err) { return next(err); }
      // Successful, so render
      res.render('blog_list', { title: 'All Blogs', blog_list:  list_blogs});
    });

};

// Display detail page for a specific blog.
exports.blog_detail = function(req, res, next) {

    async.parallel({
        blog: function(callback) {

            Blog.findById(req.params.id)
              .exec(callback);
        },
        blog_instance: function(callback) {

          BlogInstance.find({ 'blog': req.params.id })
          .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.blog==null) { // No results.
            var err = new Error('Blog not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('blog_detail', { title: 'Blog Title', blog:  results.blog, blog_instances: results.blog_instance } );
    });

};

// Display blog create form on GET.
exports.blog_create_get = function(req, res, next) {

    // Get all authors and genres, which we can use for adding to our blog.
    async.parallel({
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('blog_form', { title: 'New Blog' });
    });

};

// Handle blog create on POST.
exports.blog_create_post = [
    // Convert the genre to an array.
    (req, res, next) => {
        next();
    },

    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('summary', 'Short description must not be empty.').isLength({ min: 1 }).trim(),
    body('content', 'Blog content must not be empty').isLength({ min: 1 }).trim(),
  
    // Sanitize fields.
    sanitizeBody('*').trim().escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Blog object with escaped and trimmed data.
        var blog = new Blog(
          { title: req.body.title,
            summary: req.body.summary,
            content: req.body.content
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
            }, function(err, results) {
                if (err) { return next(err); }
                res.render('blog_form', { title: 'New Blog', blog: blog, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save blog.
            blog.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new blog record.
                   res.redirect(blog.url);
                });
        }
    }
];



// Display blog delete form on GET.
exports.blog_delete_get = function(req, res, next) {

    async.parallel({
        blog: function(callback) {
            Blog.findById(req.params.id).exec(callback);
        },
        blog_bloginstances: function(callback) {
            BlogInstance.find({ 'blog': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.blog==null) { // No results.
            res.redirect('/blogs/blogs');
        }
        // Successful, so render.
        res.render('blog_delete', { title: 'Delete Blog', blog: results.blog, blog_instances: results.blog_bloginstances } );
    });

};

// Handle blog delete on POST.
exports.blog_delete_post = function(req, res, next) {

    // Assume the post has valid id (ie no validation/sanitization).

    async.parallel({
        blog: function(callback) {
            Blog.findById(req.params.id).exec(callback);
        },
        blog_bloginstances: function(callback) {
            BlogInstance.find({ 'blog': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.blog_bloginstances.length > 0) {
            // Blog has blog_instances. Render in same way as for GET route.
            res.render('blog_delete', { title: 'Delete Blog', blog: results.blog, blog_instances: results.blog_bloginstances } );
            return;
        }
        else {
            // Blog has no BlogInstance objects. Delete object and redirect to the list of blogs.
            Blog.findByIdAndRemove(req.body.id, function deleteBlog(err) {
                if (err) { return next(err); }
                // Success - got to blogs list.
                res.redirect('/blogs/blogs');
            });

        }
    });

};

// Display blog update form on GET.
exports.blog_update_get = function(req, res, next) {

    // Get blog, authors and genres for form.
    async.parallel({
        blog: function(callback) {
            Blog.findById(req.params.id).exec(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.blog==null) { // No results.
                var err = new Error('Blog not found');
                err.status = 404;
                return next(err);
            }
            res.render('blog_form', { title: 'Update Blog', blog: results.blog });
        });

};


// Handle blog update on POST.
exports.blog_update_post = [

    // Convert the genre to an array.
    (req, res, next) => {
        next();
    },
   
    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),
    body('summary', 'Short description must not be empty.').isLength({ min: 1 }).trim(),
    body('content', 'Blog content must not be empty').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('title').trim().escape(),
    sanitizeBody('author').trim().escape(),
    sanitizeBody('summary').trim().escape(),
    sanitizeBody('content').trim().escape(),
    

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Blog object with escaped/trimmed data and old id.
        var blog = new Blog(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            content: req.body.content,
            _id:req.params.id // This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form
            async.parallel({
            }, function(err, results) {
                if (err) { return next(err); }
                res.render('blog_form', { title: 'Update Blog',blog: blog, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Blog.findByIdAndUpdate(req.params.id, blog, {}, function (err,theblog) {
                if (err) { return next(err); }
                   // Successful - redirect to blog detail page.
                   res.redirect(theblog.url);
                });
        }
    }
];

