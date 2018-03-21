var express = require('express');
var router = express.Router();


// Require our controllers.
var blog_controller = require('../controllers/blogController'); 
var blog_instance_controller = require('../controllers/bloginstanceController');


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

// /// BOOKINSTANCE ROUTES ///

// // GET request for creating a BlogInstance. NOTE This must come before route that displays BlogInstance (uses id).
// router.get('/bloginstance/create', blog_instance_controller.bloginstance_create_get);

// // POST request for creating BlogInstance.
// router.post('/bloginstance/create', blog_instance_controller.bloginstance_create_post);

// // GET request to delete BlogInstance.
// router.get('/bloginstance/:id/delete', blog_instance_controller.bloginstance_delete_get);

// // POST request to delete BlogInstance.
// router.post('/bloginstance/:id/delete', blog_instance_controller.bloginstance_delete_post);

// // GET request to update BlogInstance.
// router.get('/bloginstance/:id/update', blog_instance_controller.bloginstance_update_get);

// // POST request to update BlogInstance.
// router.post('/bloginstance/:id/update', blog_instance_controller.bloginstance_update_post);

// // GET request for one BlogInstance.
// router.get('/bloginstance/:id', blog_instance_controller.bloginstance_detail);

// // GET request for list of all BlogInstance.
// router.get('/bloginstances', blog_instance_controller.bloginstance_list);



