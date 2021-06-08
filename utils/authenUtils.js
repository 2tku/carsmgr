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
}

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

//used in local-changepass strategy
exports.localChangePass = function (userName, password, newPassword) {
    var deferred = Q.defer();
    var returnObj = {errorMsg: '', user: null};

    console.log("-- username: " + userName);
    console.log("-- newPassword: " + newPassword);
  
    User.findOne({'user_name': userName}, function (err, users) {
        if (err) {
            console.log(err);
            returnObj.errorMsg = 'Có lỗi khi cập nhật mật khẩu, vui lòng liên hệ người quản trị';

            return deferred.resolve(returnObj);
        }
        
        if(users != null) {
            var hash = bcrypt.hashSync(password, 8);

            bcrypt.compare(password, users.password, function(err, res) {
                if (err){
                    console.log(err);
                    returnObj.errorMsg = 'Có lỗi khi cập nhật mật khẩu, vui lòng liên hệ người quản trị';

                    return deferred.resolve(returnObj);
                }

                if (res) {
                    users.password = bcrypt.hashSync(newPassword, 8);
                    
                    User.findByIdAndUpdate(users.id, users, function (err, post) {
                        if (err) {
                            console.log(err);
                            returnObj.errorMsg = 'Không cập nhật được mật khẩu';
                            
                            return deferred.resolve(returnObj);
                        }
        
                        returnObj.errorMsg = null;
                        returnObj.user = users;
                        
                        return deferred.resolve(returnObj);
                    });
                } else {
                    returnObj.errorMsg = 'Mật khẩu cũ không đúng, vui lòng nhập lại';
                
                    return deferred.resolve(returnObj);
                }
            });
        } else {
            returnObj.errorMsg = 'Không tìm thấy người dùng có mã: ' + userName;

            return deferred.resolve(returnObj);
        }
    });

    return deferred.promise;
};