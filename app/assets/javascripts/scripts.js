$(function () {
    var socket = null;

    $('.go-down').click(function () {
        $(this).parent().animate({ scrollTop: $(this).parent().height() }, 250);;
    });

    $('#messages').scroll(function (event) {
        if(this.scrollTop + $(this).innerHeight() === this.scrollHeight) {
            $('.go-down', this).hide();
        } else {
            $('.go-down', this).show();
        }
    });

    $('#formSendMessage').submit(function (event) {
        $('#msg').val(function (index, value) {
            if (socket) {
                socket.emit('chat_msg', { msg: value, to: 'all' });
            }

            return '';
        });

        event.preventDefault();
    });

    $('#formLogin').submit(function () {
        socket = io();

        socket.emit('auth', { username: $('#username').val(), password: $('#password').val() }, function (status, data) {
            if(status) {
                console.log('session_id = ' + data.session_id);
                $('#formLogin').hide();
                $('#chat').show();
            }
        });

        socket.on('chat_msg', function (data) {
            var msg = $(document.createElement('div'));
            msg.text(data.msg);
            msg.addClass('message');
            msg = $(document.createElement('div')).append(msg);
            msg.addClass('message-wrapper');

            if (data.from === 'admin') {
                msg.addClass('by-me');
            } else {
                msg.addClass('to-me');
            }

            var scrolldown = false;
            var elem = document.getElementById('messages');
            console.log(elem.scrollTop + $(elem).height);
            console.log(elem.scrollHeight);
            if(elem.scrollTop + $(elem).innerHeight() === elem.scrollHeight) {
                scrolldown = true;
            }

            $('#messages').append(msg);

            if(scrolldown) {
                elem.scrollTop = elem.scrollHeight;
            }
        });

        event.preventDefault();
    });
});