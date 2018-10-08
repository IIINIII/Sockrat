$(function () {
    var socket = null;

    $('.go-down').click(function () {
        $(this).parent().animate({scrollTop: $(this).parent().innerHeight()}, 250);
    });

    $('#messages').scroll(function () {
        if (this.scrollTop + $(this).innerHeight() === this.scrollHeight) {
            $('.go-down', this).hide();
        } else {
            $('.go-down', this).show();
        }
    });

    $('#formLogin').submit(function () {
        socket = io();
        var user = null;

        socket.emit('auth', {username: $('#username').val(), password: $('#password').val()}, function (status, data) {
            if (status) {
                console.log('session_id = ' + data.session_id);
                $('#formLogin').hide();
                $('#chat').show();
                user = data;
            } else {
                var err = $('#login_err_msg');
                err.text(data.msg);
                err.show();
            }
        });

        socket.on('chat_msg', function (data) {
            var msg = $(document.createElement('div'));
            msg.text(data.msg);
            msg.addClass('message');
            msg = $(document.createElement('div')).append(msg);
            msg.addClass('message-wrapper');

            if (data.from === user.username) {
                msg.addClass('by-me');
            } else {
                msg.addClass('to-me');
            }

            var scrolldown = false;
            var elem = document.getElementById('messages');
            console.log(elem.scrollTop + $(elem).height);
            console.log(elem.scrollHeight);
            if (elem.scrollTop + $(elem).innerHeight() === elem.scrollHeight) {
                scrolldown = true;
            }

            $('#messages').append(msg);

            if (scrolldown) {
                elem.scrollTop = elem.scrollHeight;
            }
        });

        socket.on('disconnect', function () {
            $('#chat').hide();
            $('#formLogin').show();
            $('#messages').text('');
            user = null;
        });

        event.preventDefault();
    });

    $('#formSendMessage').submit(event => {
        $('#msg').val((index, value) => {
            if (socket.connected) {
                socket.emit('chat_msg', {
                    msg: value,
                    to: $('#msg_to').val(),
                    from: $('#username').val()
                });
            }

            return '';
        });

        event.preventDefault();
    });
});