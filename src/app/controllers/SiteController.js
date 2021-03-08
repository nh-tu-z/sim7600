class SiteController {
    //[GET] /login-form
    showLogInForm(req,res) {
        res.render('login-form')
    }
    //[GET] /sign-up-form
    showSignUpForm(req,res) {
        res.render('sign-up-form')
    }

    //[POST] /sign-up-form
    checkSignUpForm(req,res) {
        res.send('Check Sign Up Form')
        console.log(req.body)
    }
}

module.exports = new SiteController