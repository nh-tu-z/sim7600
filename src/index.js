const express = require('express')
const handlebars = require('express-handlebars')
const path = require('path')
const app = express()
const port = 3000

/* Config static files */
app.use(express.static(path.join(__dirname,'public')))

/* Set views path */
app.set('views', path.join(__dirname,'resource','views'))

// /*Template Engine: handlebars*/ 
app.engine('hbs', handlebars(
  {extname: ".hbs"}
))
app.set('view engine', 'hbs')

app.get('/', (req, res) => {
  res.render('home')
})

/* Run App */
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})