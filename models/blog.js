var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var BlogSchema = new Schema({
    title: {type: String, required: true},
    summary: {type: String, required: true},
    content: {type: String, required: true},
});

// Virtual for this book instance URL.
BlogSchema
.virtual('url')
.get(function () {
  return '/blogs/blog/'+this._id;
});

// Export model.
module.exports = mongoose.model('Blog', BlogSchema);
