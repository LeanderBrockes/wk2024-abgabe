const express = require('express')
const router = express.Router()
const path = require('path')

router.use(express.static(path.join(__dirname, '/public')))

// define the impressum page route
router.get('/', (req, res) => {
    html_static_impressum_file = 'impressum.html'
    console.log(html_static_impressump_file)
    res.sendFile(html_static_impressum_file, {root: "./public"})
})

module.exports = router