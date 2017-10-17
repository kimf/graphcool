var fromEvent = require('graphcool-lib').fromEvent;
var bcrypt = require('bcryptjs');
var validator = require('validator');
function getGraphcoolUser(api, email) {
    return api.request("\n    query {\n      User(email: \"" + email + "\") {\n        id\n      }\n    }")
        .then(function (userQueryResult) {
        if (userQueryResult.error) {
            return Promise.reject(userQueryResult.error);
        }
        else {
            return userQueryResult.User;
        }
    });
}
function createGraphcoolUser(api, email, passwordHash) {
    return api.request("\n    mutation {\n      createUser(\n        email: \"" + email + "\",\n        password: \"" + passwordHash + "\"\n      ) {\n        id\n      }\n    }")
        .then(function (userMutationResult) {
        return userMutationResult.createUser.id;
    });
}
module.exports = function (event) {
    if (!event.context.graphcool.pat) {
        console.log('Please provide a valid root token!');
        return { error: 'Email Signup not configured correctly.' };
    }
    var email = event.data.email;
    var password = event.data.password;
    var graphcool = fromEvent(event);
    var api = graphcool.api('simple/v1');
    var SALT_ROUNDS = 10;
    var salt = bcrypt.genSaltSync(SALT_ROUNDS);
    if (validator.isEmail(email)) {
        return getGraphcoolUser(api, email)
            .then(function (graphcoolUser) {
            if (graphcoolUser === null) {
                return bcrypt.hash(password, salt)
                    .then(function (hash) { return createGraphcoolUser(api, email, hash); });
            }
            else {
                return Promise.reject("Email already in use");
            }
        })
            .then(function (graphcoolUserId) {
            return graphcool.generateAuthToken(graphcoolUserId, 'User')
                .then(function (token) {
                return { data: { id: graphcoolUserId, token: token } };
            });
        })
            .catch(function (error) {
            console.log(error);
            // don't expose error message to client!
            return { error: 'An unexpected error occured.' };
        });
    }
    else {
        return { error: "Not a valid email" };
    }
};
