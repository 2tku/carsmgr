var bcrypt = require('bcryptjs');
var Q = require('q');

var User = require('../models/User.js');

//used in local-signup strategy
exports.localReg = function (userName, password, fullName, roleUser) {
    var deferred = Q.defer();
  
    User.findOne({'user_name': userName}, function (err, users) {
        if (err) return handleError(err);
        
        if(users != null) {
            console.log("USERNAME ALREADY EXISTS:", result.userName);
            deferred.resolve(false); // username exists
        } else {
            var hash = bcrypt.hashSync(password, 8);
            var user = {
                "user_name"   : userName,
                "full_name"   : fullName,
                "password"    : hash,
                "role"        : roleUser
            }

            console.log("CREATING USER:", userName);
            
            user.save(function (err) {
                if (err) return handleError(err);
                // saved!
            });
        }
    });

    return deferred.promise;
};

exports.localAuth = function (username, password) {
    var deferred = Q.defer();
  
    User.findOne({ 'user_name': username }, function (err, users) {
        if (err) return handleError(err);
        
        if(users == null) {
            console.log("USERNAME NOT FOUND: ", username);
            deferred.resolve(false);
        } else {
            var hash = result.password;

            console.log("FOUND USER: " + result.user_name);

            if (bcrypt.compareSync(password, hash)) {
                deferred.resolve(result);
            } else {
                console.log("AUTHENTICATION FAILED");
                deferred.resolve(false);
            }
        }
    });

    return deferred.promise;
}