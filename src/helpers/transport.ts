import nodemailer from 'nodemailer'

const transport = nodemailer.createTransport( {
  service: 'gmail',
  auth: {
    user: 'devkorbantech@gmail.com',
    pass: 'K0rb@nt3ch@1502'
  }
} )

export default transport
