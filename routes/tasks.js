var express = require('express');
var router = express.Router();
var moment = require('moment'); 

var mongoose = require('mongoose');
var Task = require('../models/Task.js');

// /* GET /tasks listing. */
// router.get('/', function(req, res, next) {
//   // console.log(req.query != null && req.query.vehicle != null && req.query.vehicle != undefined);

//   if (req.query != null && req.query.vehicle != null && req.query.vehicle != undefined) {
//       // Creates a regex of: /^SomeStringToFind$/i
//       var regexVehicle = new RegExp(["^", req.query.vehicle.toLowerCase(), "$"].join(""), "i");

//       Task.find({
//           vehicle: regexVehicle,
//           //begin_time: {$lt: req.query.completeDate},
//           //$or: [{end_time: {$gte: req.query.completeDate}}, {end_time: null}],
//           //assign_staffs: {$elemMatch: {staff: req.query.user}}
//       })
//       .sort({ begin_time: -1 })
//       .exec(function (err, tasks) {
//           if (err) return next(err);
//           res.json(tasks);
//       });
//   } else {
//       Task.find()
//       .sort({ begin_time: -1 })
//       .exec(function (err, tasks) {
//           if (err) return next(err);
//           res.json(tasks);
//       });
//   }  
// });

/* GET /tasks listing. */
router.get('/', function(req, res, next) {
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

  if (req.query.createDateFrom != undefined && req.query.createDateFrom != null) {
      // remove time
      var fCDate = moment(req.query.createDateFrom).startOf('day');
      // console.log(fCDate.toDate());
    
      query.where('create_date').gt(fCDate.toDate());
  }

  if (req.query.createDateTo != undefined && req.query.createDateTo != null) {
      // remove time
      var tCDate = moment(req.query.createDateTo).startOf('day').add(1, 'days');

      query.where('create_date').lt(tCDate.toDate());
  }

  console.log(req.query);
  if (req.query.isNotComplete == 'true') {
      // ngay ket thuc == null
      //query.where("end_time").ne(null);
      query.where("end_time").equals(null);
  }

  // check not null
  // .where("end_time").ne(null)

  query.sort({ begin_time: -1,  vehicle: 'asc'});
  
  // execute the query at a later time
  query.exec(function (err, tasks) {
      if (err) return next(err);
      res.json(tasks);
  });
});

/* POST /task */
router.post('/', function(req, res, next) {
  Task.create(req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* GET /task/id */
router.get('/:id', function(req, res, next) {
  Task.findById(req.params.id, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* PUT /task/:id */
router.put('/:id', function(req, res, next) {
  Task.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* DELETE /task/:id */
router.delete('/:id', function(req, res, next) {
  Task.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

module.exports = router;
