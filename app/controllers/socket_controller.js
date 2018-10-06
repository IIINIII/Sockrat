exports.init = function (io) {
    var users = {};

    function validator(action, data) {
        var isValid = false;
        switch (action) {
            case 'chat_msg':

        }
    }

    io.on('connection', function (socket) {
        var uniqueId = guidGenerator();

        function checkAuth() {
            if (users[uniqueId] == null || !users[uniqueId].authenticated) {
                logout();
            }
        }

        function logout() {
            if (users[uniqueId]) {
                users[uniqueId].socket.disconnect();
                delete users[uniqueId];
            }
        }

        function guidGenerator() {
            var S4 = function () {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            };
            return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
        }

        console.log('[' + uniqueId + '] Connected! Waiting for auth!');

        users[uniqueId] = {
            id: uniqueId,
            socket: socket,
            authenticated: false,
            authentication: null,
            authAttempt: 0
        };

        // Check authentication after 3 seconds
        setTimeout(function () {
            checkAuth(uniqueId);
        }, 5000);

        socket.on('auth', function (data, cb) {
            if (data.username === 'admin' && data.password === '123e45') {
                users[uniqueId].authenticated = true;
                users[uniqueId].authentication = {
                    username: data.username,
                    password: data.password
                };

                cb(true, {session_id: uniqueId});

                console.log('[' + uniqueId + '] User Authenticated!');
            } else {
                users[uniqueId].authAttempt++;
            }
        });

        socket.on('chat_msg', function (data) {
            if (data.msg.length > 0) {
                console.log('message to ' + data.to + ': ' + data.msg);
                switch (data.to) {
                    case 'sys':
                        // do something
                        break;
                    case 'all':
                        io.emit('chat_msg', {from: 'sys', msg: data.msg, to: data.to});
                        break;
                    default:
                        // do something else
                        break;
                }
            }
        });

        socket.on('disconnect', function () {
            logout();
            console.log('[' + uniqueId + '] Disconnected!');
        });
    });
};