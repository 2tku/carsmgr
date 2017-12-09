var bcrypt = require('bcryptjs');
var Q = require('q');

var User = require('../models/User.js');

//used in local-signup strategy
exports.localReg = function (userName, password, fullName, roleUser) {
    var deferred = Q.defer();
    var returnObj = {errorMsg: '', user: null};
  
    User.findOne({'user_name': userName}, function (err, users) {
        if (err) {
            console.log(err);
            returnObj.errorMsg = 'Không tạo được người dùng';
            returnObj.user = false;

            return deferred.resolve(returnObj);
        }
        
        if(users != null) {
            console.log("USERNAME ALREADY EXISTS:", userName);
            returnObj.errorMsg = 'Người dùng đã tồn tại';
            returnObj.user = false;
            
            return deferred.resolve(returnObj);
        } else {
            console.log(password);
            var hash = bcrypt.hashSync(password, 8);
            var user = {
                "user_name"   : userName,
                "full_name"   : fullName,
                "password"    : hash,
                "role"        : roleUser
            }

            console.log("CREATING USER:");
            console.log(user);

            User.create(user, function (err, post) {
                if (err) {
                    console.log(err);
                    returnObj.errorMsg = 'Không tạo được người dùng';
                    returnObj.user = false;
                    
                    return deferred.resolve(returnObj);
                }

                returnObj.errorMsg = null;
                returnObj.user = user;
                
                return deferred.resolve(returnObj);
            });
        }
    });

    return deferred.promise;
};

exports.localAuth = function (username, password) {
    var deferred = Q.defer();
  
    User.findOne({ 'user_name': username }, function (err, users) {
        if (err) return deferred.resolve(false);
        
        if(users == null) {
            console.log("USERNAME NOT FOUND: ", username);
            deferred.resolve(false);
        } else {
            var hash = users.password;

            console.log("FOUND USER: " + users.user_name);

            if (bcrypt.compareSync(password, hash)) {
                deferred.resolve(users);
            } else {
                console.log("AUTHENTICATION FAILED");
                deferred.resolve(false);
            }
        }
    });

    return deferred.promise;
}