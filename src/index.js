import dotenv from 'dotenv'
import { app } from './app.js'

dotenv.config({
    path: './.env'
})

/* This line of code is setting the value of the `PORT` constant. It is using the logical OR (`||`)
operator to check if the `process.env.PORT` variable has a value. If `process.env.PORT` has a value
(is truthy), then `PORT` will be set to that value. If `process.env.PORT` does not have a value (is
falsy), then `PORT` will default to 5000. This allows the server to run on the port specified in the
environment variable `PORT`, or default to port 5000 if no specific port is provided. */
const PORT = process.env.PORT || 5000 // 5000 is the default port

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})