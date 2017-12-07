var mongoose = require('mongoose');

// Create a schema
var TaskSchema = new mongoose.Schema({
    user_name           : String,
    full_name           : String,
    password            : String,
    role                : String,
    create_date         : { type: Date, default: Date.now },
});

// Create a model based on the schema
module.exports = mongoose.model('Users', TaskSchema);