var fromEvent = require('graphcool-lib').fromEvent;
var bcrypt = require('bcryptjs');
function getGraphcoolUser(api, email) {
    return api.request("\n    query {\n      User(email: \"" + email + "\"){\n        id\n        password\n      }\n    }")
        .then(function (userQueryResult) {
        if (userQueryResult.error) {
            return Promise.reject(userQueryResult.error);
        }
        else {
            return userQueryResult.User;
        }
    });
}
module.exports = function (event) {
    if (!event.context.graphcool.pat) {
        console.log('Please provide a valid root token!');
        return { error: 'Email Authentication not configured correctly.' };
    }
    var email = event.data.email;
    var password = event.data.password;
    var graphcool = fromEvent(event);
    var api = graphcool.api('simple/v1');
    return getGraphcoolUser(api, email)
        .then(function (graphcoolUser) {
        if (graphcoolUser === null) {
            return Promise.reject("Invalid Credentials"); //returning same generic error so user can't find out what emails are registered.
        }
        else {
            return bcrypt.compare(password, graphcoolUser.password)
                .then(function (passwordCorrect) {
                if (passwordCorrect) {
                    return graphcoolUser.id;
                }
                else {
                    return Promise.reject("Invalid Credentials");
                }
            });
        }
    })
        .then(function (graphcoolUserId) {
        return graphcool.generateAuthToken(graphcoolUserId, 'User');
    })
        .then(function (token) {
        return { data: { token: token } };
    })
        .catch(function (error) {
        console.log("Error: " + JSON.stringify(error));
        // don't expose error message to client!
        return { error: "An unexpected error occured" };
    });
};
