var fromEvent = require('graphcool-lib').fromEvent;
function getUser(api, userId) {
    return api.request("\n    query {\n      User(id: \"" + userId + "\"){\n        id\n      }\n    }")
        .then(function (userQueryResult) {
        console.log(userQueryResult);
        return userQueryResult.User;
    })
        .catch(function (error) {
        // Log error but don't expose to caller
        console.log(error);
        return { error: "An unexpected error occured" };
    });
}
module.exports = function loggedInUser(event) {
    if (!event.context.auth || !event.context.auth.nodeId) {
        return { data: { id: null } };
    }
    var userId = event.context.auth.nodeId;
    var graphcool = fromEvent(event);
    var api = graphcool.api('simple/v1');
    return getUser(api, userId)
        .then(function (user) {
        if (!user) {
            return { error: "No user with id: " + userId };
        }
        return { data: user };
    })
        .catch(function (error) {
        // Log error but don't expose to caller
        console.log(error);
        return { error: "An unexpected error occured" };
    });
};
