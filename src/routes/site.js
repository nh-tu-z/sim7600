const express = require('express')
const router = express.Router()
const siteController = require('../app/controllers/SiteController')

router.get('/login-form', siteController.showLogInForm)
router.get('/sign-up-form', siteController.showSignUpForm)
router.post('/login-form', siteController.checkSignUpForm)

module.exports = router