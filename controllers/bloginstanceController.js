var BlogInstance = require('../models/bloginstance')
var Book = require('../models/blog')
var async = require('async')

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all BlogInstances.
exports.bloginstance_list = function(req, res, next) {

  BlogInstance.find()
    .populate('blog')
    .exec(function (err, list_bloginstances) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('bloginstance_list', { title: 'Blog Instance List', bloginstance_list:  list_bloginstances});
    })

};

// Display detail page for a specific BlogInstance.
exports.bloginstance_detail = function(req, res, next) {

    BlogInstance.findById(req.params.id)
    .populate('blog')
    .exec(function (err, bloginstance) {
      if (err) { return next(err); }
      if (bloginstance==null) { // No results.
          var err = new Error('Book copy not found');
          err.status = 404;
          return next(err);
        }
      // Successful, so render.
      res.render('bloginstance_detail', { title: 'Book:', bloginstance:  bloginstance});
    })

};

// Display BlogInstance create form on GET.
exports.bloginstance_create_get = function(req, res, next) {

     Book.find({},'title')
    .exec(function (err, books) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('bloginstance_form', {title: 'Create BlogInstance', blog_list:books } );
    });

};

// Handle BlogInstance create on POST.
exports.bloginstance_create_post = [

    // Validate fields.
    body('blog', 'Book must be specified').isLength({ min: 1 }).trim(),
    body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
    
    // Sanitize fields.
    sanitizeBody('blog').trim().escape(),
    sanitizeBody('imprint').trim().escape(),
    sanitizeBody('status').trim().escape(),
    sanitizeBody('due_back').toDate(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BlogInstance object with escaped and trimmed data.
        var bloginstance = new BlogInstance(
          { book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Book.find({},'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('bloginstance_form', { title: 'Create BlogInstance', blog_list : books, selected_book : bloginstance.book._id , errors: errors.array(), bloginstance:bloginstance });
            });
            return;
        }
        else {
            // Data from form is valid
            bloginstance.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new record.
                   res.redirect(bloginstance.url);
                });
        }
    }
];



// Display BlogInstance delete form on GET.
exports.bloginstance_delete_get = function(req, res, next) {

    BlogInstance.findById(req.params.id)
    .populate('blog')
    .exec(function (err, bloginstance) {
        if (err) { return next(err); }
        if (bloginstance==null) { // No results.
            res.redirect('/blogs/bloginstances');
        }
        // Successful, so render.
        res.render('bloginstance_delete', { title: 'Delete BlogInstance', bloginstance:  bloginstance});
    })

};

// Handle BlogInstance delete on POST.
exports.bloginstance_delete_post = function(req, res, next) {
    
    // Assume valid BlogInstance id in field.
    BlogInstance.findByIdAndRemove(req.body.id, function deleteBlogInstance(err) {
        if (err) { return next(err); }
        // Success, so redirect to list of BlogInstance items.
        res.redirect('/blogs/bloginstances');
        });

};

// Display BlogInstance update form on GET.
exports.bloginstance_update_get = function(req, res, next) {

    // Get book, authors and genres for form.
    async.parallel({
        bloginstance: function(callback) {
            BlogInstance.findById(req.params.id).populate('blog').exec(callback)
        },
        books: function(callback) {
            Book.find(callback)
        },

        }, function(err, results) {
            if (err) { return next(err); }
            if (results.bloginstance==null) { // No results.
                var err = new Error('Book copy not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            res.render('bloginstance_form', { title: 'Update  BlogInstance', blog_list : results.books, selected_book : results.bloginstance.book._id, bloginstance:results.bloginstance });
        });

};

// Handle BlogInstance update on POST.
exports.bloginstance_update_post = [

    // Validate fields.
    body('blog', 'Book must be specified').isLength({ min: 1 }).trim(),
    body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
    
    // Sanitize fields.
    sanitizeBody('blog').trim().escape(),
    sanitizeBody('imprint').trim().escape(),
    sanitizeBody('status').trim().escape(),
    sanitizeBody('due_back').toDate(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BlogInstance object with escaped/trimmed data and current id.
        var bloginstance = new BlogInstance(
          { book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
            _id: req.params.id
           });

        if (!errors.isEmpty()) {
            // There are errors so render the form again, passing sanitized values and errors.
            Book.find({},'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('bloginstance_form', { title: 'Update BlogInstance', blog_list : books, selected_book : bloginstance.book._id , errors: errors.array(), bloginstance:bloginstance });
            });
            return;
        }
        else {
            // Data from form is valid.
            BlogInstance.findByIdAndUpdate(req.params.id, bloginstance, {}, function (err,thebloginstance) {
                if (err) { return next(err); }
                   // Successful - redirect to detail page.
                   res.redirect(thebloginstance.url);
                });
        }
    }
];
