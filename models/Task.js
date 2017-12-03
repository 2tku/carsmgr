var mongoose = require('mongoose');

// Create a schema
var TaskSchema = new mongoose.Schema({
    create_date         : { type: Date, default: Date.now },
    vehicle             : String,
    own_org             : String,
    process_type        : String,
    tast_content        : String,
    begin_time          : Date,
    end_time            : Date,
    task_real_hour      : Number,
    wait_material_hour  : Number,
    km                  : Number,
    note                : String,
    assign_staffs:[{
        staff       : String,
        begin_time  : Date,
        end_time    : Date,
        task_content: String
    }],
    problems: [{
      problem : String,
      handling: String
    }]
});

// Create a model based on the schema
module.exports = mongoose.model('Task', TaskSchema);