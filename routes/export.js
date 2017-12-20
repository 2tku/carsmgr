var express = require('express');
var passport = require('passport');  
var router = express.Router();
var Excel = require('exceljs');
var moment = require('moment'); 

var mongoose = require('mongoose');
var Task = require('../models/Task.js');

function sortByAttribute(array, ...attrs) {
    // generate an array of predicate-objects contains
    // property getter, and descending indicator
    let predicates = attrs.map(pred => {
      let descending = pred.charAt(0) === '-' ? -1 : 1;
      pred = pred.replace(/^-/, '');
      return {
        getter: o => o[pred],
        descend: descending
      };
    });
    // schwartzian transform idiom implementation. aka: "decorate-sort-undecorate"
    return array.map(item => {
      return {
        src: item,
        compareValues: predicates.map(predicate => predicate.getter(item))
      };
    })
    .sort((o1, o2) => {
      let i = -1, result = 0;
      while (++i < predicates.length) {
        if (o1.compareValues[i] < o2.compareValues[i]) result = -1;
        if (o1.compareValues[i] > o2.compareValues[i]) result = 1;
        if (result *= predicates[i].descend) break;
      }
      return result;
    })
    .map(item => item.src);
}

/* GET home page. */
router.get('/', /*isLoggedIn,*/ function(req, res, next) {
    var workbook = new Excel.Workbook();

    workbook.creator = 'CarsMgr';
    //workbook.lastModifiedBy = 'Her';
    workbook.created = new Date();
    //workbook.modified = new Date();
    //workbook.lastPrinted = new Date(2016, 9, 27);
    // Set workbook dates to 1904 date system
    workbook.properties.date1904 = true;
    workbook.views = [{
        x: 0, y: 0, width: 10000, height: 20000,
        firstSheet: 0, activeTab: 1, visibility: 'visible'
    }];

// {
    var wsTasks = workbook.addWorksheet('Tasks');
    // create a sheet with the first row and column frozen
    // var sheet = workbook.addWorksheet('My Sheet', {views:[{xSplit: 1, ySplit:1}]});

    // , topLeftCell: 'G10', activeCell: 'A1'
    wsTasks.views = [
        {state: 'frozen', xSplit: 0, ySplit: 2}
    ];

    var cFont       = { name: 'Arial', size: 11 };
    var cBorder     = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
    var headerFont  = { name: 'Arial', size: 11, bold: true};

    wsTasks.columns = [
        { header: ['Ngày',''], 										    key: 'create_date', 	width: 20 , style: {border: cBorder, font: cFont, numFmt: 'dd/mm/yyyy'}},
        { header: ['Phương tiện',''], 								    key: 'vehicle', 		width: 15 , style: {border: cBorder, font: cFont}},
        { header: ['Nội dung SC',''], 								    key: 'tast_content', 	width: 40 , style: {border: cBorder, font: cFont}},
        { header: ['Nhân viên','NV1'], 					                key: 'staff0', 			width: 15 , style: {border: cBorder, font: cFont}},
        { header: ['','NV2'], 							                key: 'staff1', 			width: 15 , style: {border: cBorder, font: cFont}},
        { header: ['','NV3'], 							                key: 'staff2', 			width: 15 , style: {border: cBorder, font: cFont}},
        { header: ['','NV4'], 							                key: 'staff3', 			width: 15 , style: {border: cBorder, font: cFont}},
        { header: ['Thời gian thực hiện', 'Bắt đầu'], 					key: 'begin_time', 		width: 20 , style: {border: cBorder, font: cFont, numFmt: 'dd/mm/yyyy h:mm'}},
        { header: ['', 'Kết thúc'], 									key: 'end_time', 		width: 20 , style: {border: cBorder, font: cFont, numFmt: 'dd/mm/yyyy h:mm'}},
        { header: ['HSKT(Giờ)',''], 									key: '', 				width: 10 , style: {border: cBorder, font: cFont}},
        { header: ['NC thực tế',''], 								    key: '', 				width: 10 , style: {border: cBorder, font: cFont}},
        { header: ['Hệ số',''], 										key: '', 				width: 10 , style: {border: cBorder, font: cFont}},
        { header: ['TG thực tế',''], 								    key: 'task_real_hour', 	width: 10 , style: {border: cBorder, font: cFont/*, numFmt: '0.00'*/}},
        { header: ['TG chờ vật tư',''], 							  key: 'wait_material_hour',width: 10 , style: {border: cBorder, font: cFont}},
        { header: ['Nguyên nhân - biên pháp khắc phục về sau',''], 	    key: 'problem', 		width: 20 , style: {border: cBorder, font: cFont}},
        { header: ['Biện pháp xử lý',''], 							    key: 'handling', 		width: 20 , style: {border: cBorder, font: cFont}},
        { header: ['Số Km',''], 										key: 'km', 				width: 10 , style: {border: cBorder, font: cFont}},
        { header: ['Ghi chú',''], 									    key: 'note', 			width: 30 , style: {border: cBorder, font: cFont}}
    ];

    // format Header
    for (var i = 1; i <= 2; i++) {
        wsTasks.getRow(i).font = headerFont;

        wsTasks.getRow(i).eachCell(function(cell, rowNumber) {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            /*cell.fill = {
                type: 'pattern',
                pattern:'darkVertical',
                bgColor:{argb:'ffb6b2b2'}
            };*/
        });
    }

    wsTasks.mergeCells('D1:G1');
    wsTasks.mergeCells('H1:I1');

    var colMerge = 'ABCJKLMNOPQR';
    for (var i=0; i < colMerge.length; i++) {
        wsTasks.mergeCells(colMerge[i] + '1:' + colMerge[i] + '2');
    }
//}
//{
    var wsUsers = workbook.addWorksheet('Users');
    
    wsUsers.views = [
        {state: 'frozen', xSplit: 0, ySplit: 1}
    ];

    wsUsers.columns = [
        { header: ['Ngày'],         key: 'create_date', 	width: 20 , style: {border: cBorder, font: cFont, numFmt: 'dd/mm/yyyy'}},
        { header: ['Phương tiện'],  key: 'vehicle', 		width: 15 , style: {border: cBorder, font: cFont}},
        { header: ['Nhân viên'],    key: 'staff', 	        width: 40 , style: {border: cBorder, font: cFont}},
        { header: ['Công việc'],    key: 'task_content', 	width: 15 , style: {border: cBorder, font: cFont}},
        { header: ['Bắt đầu'],      key: 'begin_time', 		width: 20 , style: {border: cBorder, font: cFont, numFmt: 'dd/mm/yyyy h:mm'}},
        { header: ['Kết thúc'],     key: 'end_time', 		width: 20 , style: {border: cBorder, font: cFont, numFmt: 'dd/mm/yyyy h:mm'}}        
    ];
    
    // format Header
    for (var i = 1; i <= 1; i++) {
        wsUsers.getRow(i).font = headerFont;

        wsUsers.getRow(i).eachCell(function(cell, rowNumber) {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
    }
//}

    var d = new Date();
    var fileName = d.getFullYear() + d.getMonth() + d.getDate() 
        + '_' + d.getHours() + d.getMinutes() + d.getSeconds() 
        + '_' + d.getMilliseconds() + '.xlsx';
    var fullPath = G_APP_ROOT + "/public/exports/" + fileName;

    var query = Task.find({});

    if (req.query.vehicle != undefined && req.query.vehicle != null && req.query.vehicle != '') {
        var regexVehicle = new RegExp(["^", req.query.vehicle.toLowerCase(), "$"].join(""), "i");
        query.where('vehicle').equals(regexVehicle);
    }
    
    if (req.query.completeDate != undefined && req.query.completeDate != null && req.query.completeDate != '') {
        query.or([{ end_time: {$gte: req.query.completeDate} }, {end_time: null}]);
    }
    
    if (req.query.user != undefined && req.query.user != null && req.query.user != '') {
        query.where('assign_staffs').elemMatch({ staff: req.query.user});
    }

    // if (req.query.createDateFrom != undefined && req.query.createDateFrom != null) {
    //     query.where('create_date').gt(req.query.createDateFrom);
    // }

    // if (req.query.createDateTo != undefined && req.query.createDateTo != null) {
    //     query.where('create_date').lt(req.query.createDateTo);
    // }

    if (req.query.createDateFrom != undefined && req.query.createDateFrom != null) {
        // remove time
        var fCDate = moment(req.query.createDateFrom).startOf('day');
      
        query.where('create_date').gt(fCDate.toDate());
    }
  
    if (req.query.createDateTo != undefined && req.query.createDateTo != null) {
        // remove time
        var tCDate = moment(req.query.createDateTo).startOf('day').add(1, 'days');
  
        query.where('create_date').lt(tCDate.toDate());
    }

    if (req.query.isNotComplete == true) {
        // ngay ket thuc khac null
        query.where("end_time").ne(null);
    }

    // check not null
    // .where("end_time").ne(null)

    query.sort({ begin_time: -1,  vehicle: 'asc'});

    // execute the query at a later time
    query.exec(function (err, tasks) {
        if (err) return next(err);

        // push in worksheet
        var staffs = [];
        var tasksNew = [];

        for (i = 0; i< tasks.length; i++) {
            task = tasks[i];
            taskNew = {
                create_date         : task.create_date,
                vehicle             : task.vehicle,
                own_org             : task.own_org,
                process_type        : task.process_type,
                tast_content        : task.tast_content,
                begin_time          : task.begin_time,
                end_time            : task.end_time,
                task_real_hour      : task.task_real_hour,
                wait_material_hour  : task.wait_material_hour,
                km                  : task.km,
                note                : task.note,
                estimates_date      : task.estimates_date,
                done_percent        : task.done_percent
            };

            if (task.problems.length > 0) {
                taskNew.problem  = task.problems[0].problem,
                taskNew.handling = task.problems[0].handling
            }

            // console.log(task);
            for (j = 0; j<task.assign_staffs.length;j++){
                staff = task.assign_staffs[j];
                var staffTask = {
                    create_date : task.create_date,
                    vehicle     : task.vehicle,
                    staff       : staff.staff,
                    begin_time  : staff.begin_time,
                    end_time    : staff.end_time,
                    task_content: staff.task_content
                }
                staffs.push(staffTask);
                
                taskNew['staff' + j] = staff.staff;
            }

            tasksNew.push(taskNew);
        }
        //console.log(staffs);
        // sortByAttribute(staffs, 'create_date', 'staff', 'begin_time', 'vehicle');
        //console.log(staffs);
        
        /*staffs.sort(function(a, b){
            var x = a.type.toLowerCase();
            var y = b.type.toLowerCase();
            if (x < y) {return -1;}
            if (x > y) {return 1;}
            return 0;
        });*/
        
        wsUsers.addRows(staffs);
        wsTasks.addRows(tasksNew);

        workbook.xlsx.writeFile(fullPath)
            .then(function() {
                res.status(200);
                res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
                res.setHeader('Content-type', 'application/vnd.ms-excel');
                // res.setHeader("x-filename", fileName);
                
                res.download(fullPath, fileName);
            });
    });
});

module.exports = router;

function isLoggedIn(req, res, next) {
  console.log('check authen');
  if (req.isAuthenticated()) return next();

  res.redirect('/authen/login');
}