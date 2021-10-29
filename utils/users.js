const users = [];

function userJoin(id, username, room, isAdmin, score,
                  hasAnswered, lastAns, isLastAnsCorrect) {
    let user = {id, username, room, isAdmin, score,
                hasAnswered, lastAns, isLastAnsCorrect};
    users.push(user);

    return user;
}

function getCurrentUser(id) {
    return users.find(user => user.id == id);
}

function userLeave(id) {
    const index = users.findIndex(user => user.id == id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

function getRoomUsers(room) {
    return users.filter(user => user.room == room);
}

function isFirstInRoom(room) {
    return users.find(user => user.room == room) == undefined;
}

function setNextUserAdmin(room) {
    let newAdminIndex = users.findIndex(user => user.room == room);
    users[newAdminIndex].isAdmin = true;
    return users[newAdminIndex];
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    isFirstInRoom,
    setNextUserAdmin
};