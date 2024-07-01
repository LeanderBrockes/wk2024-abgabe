var express = require('express');
var router = express.Router();

/* GET impressum page. */
router.get('/', function(req, res, next) {
  res.render('impressum', { title: 'Impressum' })
});

module.exports = router;
