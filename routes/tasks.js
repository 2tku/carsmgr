var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Task = require('../models/Task.js');

/* GET /tasks listing. */
router.get('/', function(req, res, next) {
  console.log('req.query');
  console.log(req.query);
  console.log(req.query.vehicle);
  console.log(req.query != null && req.query.vehicle != null && req.query.vehicle != undefined);

  if (req.query != null && req.query.vehicle != null && req.query.vehicle != undefined) {
      // Creates a regex of: /^SomeStringToFind$/i
      var regexVehicle = new RegExp(["^", req.query.vehicle.toLowerCase(), "$"].join(""), "i");

      Task.find({
          vehicle: regexVehicle,
          //begin_time: {$lt: req.query.completeDate},
          //$or: [{end_time: {$gte: req.query.completeDate}}, {end_time: null}],
          //assign_staffs: {$elemMatch: {staff: req.query.user}}
      })
      .sort({ begin_time: -1 })
      .exec(function (err, tasks) {
          if (err) return next(err);
          res.json(tasks);
      });
  } else {
      Task.find()
      .sort({ begin_time: -1 })
      .exec(function (err, tasks) {
          if (err) return next(err);
          res.json(tasks);
      });
  }  
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
