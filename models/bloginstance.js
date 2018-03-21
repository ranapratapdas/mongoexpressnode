var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var BlogInstanceSchema = new Schema({
    book: { type: Schema.ObjectId, ref: 'Blog', required: true }, // Reference to the associated book.
    imprint: {type: String, required: true},
    status: {type: String, required: true, enum:['Available', 'Maintenance', 'Loaned', 'Reserved'], default:'Maintenance'},
    due_back: { type: Date, default: Date.now },
});

// Virtual for this bookinstance object's URL.
BlogInstanceSchema
.virtual('url')
.get(function () {
  return '/blogs/bookinstance/'+this._id;
});


BlogInstanceSchema
.virtual('due_back_formatted')
.get(function () {
  return moment(this.due_back).format('MMMM Do, YYYY');
});

BlogInstanceSchema
.virtual('due_back_yyyy_mm_dd')
.get(function () {
  return moment(this.due_back).format('YYYY-MM-DD');
});


// Export model.
module.exports = mongoose.model('BlogInstance', BlogInstanceSchema);
