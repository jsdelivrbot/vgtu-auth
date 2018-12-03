var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SomeModelSchema = new Schema({
    name: String,
    a: Number,
    b: Number,
    c: Number,
    d: Number,
    e: Number,
    cookie: String,
    email: String,
    password: String,
    challenge: String,
});

module.exports = mongoose.model('user', SomeModelSchema)
