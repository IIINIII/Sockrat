var controller = {
    home: function(req,res) {
        res.render('index/home', { title: 'Express MVC' });
    }
};

module.exports = controller;