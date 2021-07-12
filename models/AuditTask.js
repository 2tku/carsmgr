var mongoose = require('mongoose');

// Create a schema
var AuditTaskSchema = new mongoose.Schema({
    create_date         : { type: Date, default: Date.now },
    vehicle             : String,
    own_org             : String,
    process_type        : String,
    tast_content        : String,
    begin_time          : Date,
    end_time            : Date,
    task_real_hour      : Number,
    wait_material_hour  : Number,
    note                : String,
    estimates_date      : Number, // so ngay du kien, dung cho SCC
    done_percent        : Number, // tien do hoan thanh, dung cho SCC
    fuel                : { type: Number, default: 0}, // nhien lieu, type ~ lit
    cost                : { type: Number, default: 0}, // chi phi, type ~ VND
    material: [{
        name  : String
    }],
    assign_staffs:[{
        staff       : String,
        begin_time  : Date,
        end_time    : Date,
        task_content: String
    }],
    problems: [{
      problem : String,
      handling: String
    }],
    // extra info
    action_date : { type: Date, default: Date.now },
    action_user : String
});

// Create a model based on the schema
module.exports = mongoose.model('AuditTask', AuditTaskSchema);