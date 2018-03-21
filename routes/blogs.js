var express = require('express');
var router = express.Router();


// Require our controllers.
var blog_controller = require('../controllers/blogController'); 

/// Blog ROUTES ///

// GET blogs home page.
router.get('/', blog_controller.index);  

// GET request for creating a Blog. NOTE This must come before routes that display Blog (uses id).
router.get('/blog/create', blog_controller.blog_create_get);

// POST request for creating Blog.
router.post('/blog/create', blog_controller.blog_create_post);

// GET request to delete Blog.
router.get('/blog/:id/delete', blog_controller.blog_delete_get);

// POST request to delete Blog.
router.post('/blog/:id/delete', blog_controller.blog_delete_post);

// GET request to update Blog.
router.get('/blog/:id/update', blog_controller.blog_update_get);

// POST request to update Blog.
router.post('/blog/:id/update', blog_controller.blog_update_post);

// GET request for one Blog.
router.get('/blog/:id', blog_controller.blog_detail);

// GET request for list of all Blog.
router.get('/blogs', blog_controller.blog_list);

module.exports = router;