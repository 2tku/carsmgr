var express = require('express');
var passport = require('passport');  
var router = express.Router();
var Excel = require('exceljs');

var mongoose = require('mongoose');
var Task = require('../models/Task.js');

/* GET home page. */
router.get('/', /*isLoggedIn,*/ function(req, res, next) {
    var workbook = new Excel.Workbook();

    workbook.creator = 'Me';
    workbook.lastModifiedBy = 'Her';
    workbook.created = new Date(1985, 8, 30);
    workbook.modified = new Date();
    workbook.lastPrinted = new Date(2016, 9, 27);
    // Set workbook dates to 1904 date system
    workbook.properties.date1904 = true;
    workbook.views = [{
        x: 0, y: 0, width: 10000, height: 20000,
        firstSheet: 0, activeTab: 1, visibility: 'visible'
    }];

    var worksheet = workbook.addWorksheet('Tasks');
    // create a sheet with the first row and column frozen
    // var sheet = workbook.addWorksheet('My Sheet', {views:[{xSplit: 1, ySplit:1}]});

    // , topLeftCell: 'G10', activeCell: 'A1'
    worksheet.views = [
        {state: 'frozen', xSplit: 0, ySplit: 2}
    ];

    var cFont       = { name: 'Arial', size: 11 };
    var cBorder     = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}};
    var headerFont  = { name: 'Arial', size: 11, bold: true};

    worksheet.columns = [
        { header: ['Ngày',''], 										    key: 'create_date', 	width: 20 , style: {border: cBorder, font: cFont, numFmt: 'dd/mm/yyyy'}},
        { header: ['Phương tiện',''], 								    key: 'vehicle', 		width: 15 , style: {border: cBorder, font: cFont}},
        { header: ['Nội dung SC',''], 								    key: 'tast_content', 	width: 40 , style: {border: cBorder, font: cFont}},
        { header: ['Nhân viên','NV1'], 								    key: 'staff1', 			width: 15 , style: {border: cBorder, font: cFont}},
        { header: ['','NV2'], 										    key: 'staff2', 			width: 15 , style: {border: cBorder, font: cFont}},
        { header: ['','NV3'], 										    key: 'staff3', 			width: 15 , style: {border: cBorder, font: cFont}},
        { header: ['','NV4'], 										    key: 'staff4', 			width: 15 , style: {border: cBorder, font: cFont}},
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
        worksheet.getRow(i).font = headerFont;

        worksheet.getRow(i).eachCell(function(cell, rowNumber) {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            /*cell.fill = {
                type: 'pattern',
                pattern:'darkVertical',
                bgColor:{argb:'ffb6b2b2'}
            };*/
        });
    }

    worksheet.mergeCells('D1:G1');
    worksheet.mergeCells('H1:I1');

    var colMerge = 'ABCJKLMNOPQR';
    for (var i=0; i < colMerge.length; i++) {
        worksheet.mergeCells(colMerge[i] + '1:' + colMerge[i] + '2');
    }

    var d = new Date();
    var fileName = d.getFullYear() + d.getMonth() + d.getDate() 
        + '_' + d.getHours() + d.getMinutes() + d.getSeconds() 
        + '_' + d.getMilliseconds() + '.xlsx';
    var fullPath = G_APP_ROOT + "\\public\\exports\\" + fileName;

    Task.find()
        .sort({ begin_time: -1 })
        .exec(function (err, tasks) {
            if (err) return next(err);

            worksheet.addRows(tasks);        
            workbook.xlsx.writeFile(fullPath)
                .then(function() {
                    console.log('export done');

                    res.status(200);
                    res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
                    //res.setHeader('Content-disposition', fileName);
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