import nodemailer from 'nodemailer'

export const transponder = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  auth: {
    user: 'adminfo@adminfo.com.br',
    pass: '3tiquet@',
  },
})
