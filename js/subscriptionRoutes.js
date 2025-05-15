const express = require('express');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');

const router = express.Router();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_CODE,
    }
});

async function sendWelcomeEmail(to) {
    const unsubscribeUrl = `https://rockytracker.onrender.com/unsubscribe?email=${encodeURIComponent(to)}`;

    await transporter.sendMail({
        from: '"RockyTracker" <no-reply@rockytracker.com>',
        to,
        subject: '🎉 Welcome to RockyTracker!',
        html: `
     <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html dir="ltr" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns="http://www.w3.org/1999/xhtml" lang="en">
     <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="x-apple-disable-message-reformatting">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="format-detection" content="telephone=no">
      <title>New Message 2</title><!--[if (mso 16)]>
          <style type="text/css">
             a {text-decoration: none;}
          </style>
          <![endif]--><!--[if gte mso 9]>
          <style>sup { font-size: 100% !important; }</style>
          <![endif]--><!--[if gte mso 9]>
          <noscript>
             <xml>
               <o:OfficeDocumentSettings>
               <o:AllowPNG></o:AllowPNG>
               <o:PixelsPerInch>96</o:PixelsPerInch>
               </o:OfficeDocumentSettings>
             </xml>
          </noscript>
          <![endif]--><!--[if mso]><xml>
        <w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word">
          <w:DontUseAdvancedTypographyReadingMail/>
        </w:WordDocument>
        </xml><![endif]-->
      <style type="text/css">
    .rollover:hover .rollover-first {
      max-height:0px!important;
      display:none!important;
    }
    .rollover:hover .rollover-second {
      max-height:none!important;
      display:block!important;
    }
    .rollover span {
      font-size:0px;
    }
    u + .body img ~ div div {
      display:none;
    }
    #outlook a {
      padding:0;
    }
    span.MsoHyperlink,
    span.MsoHyperlinkFollowed {
      color:inherit;
      mso-style-priority:99;
    }
    a.es-button {
      mso-style-priority:100!important;
      text-decoration:none!important;
    }
    a[x-apple-data-detectors],
    #MessageViewBody a {
      color:inherit!important;
      text-decoration:none!important;
      font-size:inherit!important;
      font-family:inherit!important;
      font-weight:inherit!important;
      line-height:inherit!important;
    }
    .es-desk-hidden {
      display:none;
      float:centre;
      overflow:hidden;
      width:0;
      max-height:0;
      line-height:0;
      mso-hide:all;
    }
    @media only screen and (max-width:600px) {.es-p-default { } *[class="gmail-fix"] { display:none!important } p, a { line-height:150%!important } h1, h1 a { line-height:120%!important } h2, h2 a { line-height:120%!important } h3, h3 a { line-height:120%!important } h4, h4 a { line-height:120%!important } h5, h5 a { line-height:120%!important } h6, h6 a { line-height:120%!important } .es-header-body p { } .es-content-body p { } .es-footer-body p { } .es-infoblock p { } h1 { font-size:22px!important; text-align:centre} h2 { font-size:32px!important; text-align:centre} h3 { font-size:28px!important; text-align:centre} h4 { font-size:24px!important; text-align:centre} h5 { font-size:20px!important; text-align:centre} h6 { font-size:16px!important; text-align:centre} .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:40px!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:32px!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:28px!important } .es-header-body h4 a, .es-content-body h4 a, .es-footer-body h4 a { font-size:24px!important } .es-header-body h5 a, .es-content-body h5 a, .es-footer-body h5 a { font-size:20px!important } .es-header-body h6 a, .es-content-body h6 a, .es-footer-body h6 a { font-size:16px!important } .es-menu td a { font-size:14px!important } .es-header-body p, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body a { font-size:14px!important } .es-infoblock p, .es-infoblock a { font-size:12px!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3, .es-m-txt-c h4, .es-m-txt-c h5, .es-m-txt-c h6 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3, .es-m-txt-r h4, .es-m-txt-r h5, .es-m-txt-r h6 { text-align:right!important } .es-m-txt-j, .es-m-txt-j h1, .es-m-txt-j h2, .es-m-txt-j h3, .es-m-txt-j h4, .es-m-txt-j h5, .es-m-txt-j h6 { text-align:justify!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3, .es-m-txt-l h4, .es-m-txt-l h5, .es-m-txt-l h6 { text-align:centre!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-m-txt-r .rollover:hover .rollover-second, .es-m-txt-c .rollover:hover .rollover-second, .es-m-txt-l .rollover:hover .rollover-second { display:inline!important } .es-m-txt-r .rollover span, .es-m-txt-c .rollover span, .es-m-txt-l .rollover span { line-height:0!important; font-size:0!important; display:block } .es-spacer { display:inline-table } a.es-button, button.es-button { font-size:14px!important; padding:10px 20px 10px 20px!important; line-height:120%!important } a.es-button, button.es-button, .es-button-border { display:inline-block!important } .es-m-fw, .es-m-fw.es-fw, .es-m-fw .es-button { display:block!important } .es-m-il, .es-m-il .es-button, .es-social, .es-social td, .es-menu { display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .adapt-img { width:100%!important; height:auto!important } .es-mobile-hidden, .es-hidden { display:none!important } .es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } .h-auto { height:auto!important } .es-text-6380 .es-text-mobile-size-22, .es-text-6380 .es-text-mobile-size-22 * { font-size:22px!important; line-height:150%!important } .es-text-5064 .es-text-mobile-size-12, .es-text-5064 .es-text-mobile-size-12 * { font-size:12px!important; line-height:150%!important } }
    @media screen and (max-width:384px) {.mail-message-content { width:414px!important } }
    </style>
     </head>
     <body class="body" style="width:100%;height:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
      <div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#F6F6F6"><!--[if gte mso 9]>
             <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
                <v:fill type="tile" color="#f6f6f6"></v:fill>
             </v:background>
             <![endif]-->
       <table width="100%" cellspacing="0" cellpadding="0"  class="es-wrapper" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-color:#F6F6F6">
         <tr>
          <td valign="top" style="padding:30px;Margin:0">
           <table cellspacing="0" cellpadding="0" align="center" class="es-header" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent">
           </table>
           <table cellspacing="0" cellpadding="0" align="center" class="es-content" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
             <tr>
              <td align="center" style="padding:0;Margin:0">
               <table bgcolor="#ffffff" align="center" cellspacing="0" cellpadding="0" class="es-content-body" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">

               </table></td>
             </tr>
           </table>
           <table cellpadding="0" align="center" cellspacing="0" class="es-content" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
             <tr>
              <td align="center" bgcolor="transparent" style="padding:0;Margin:0">
               <table cellpadding="0" cellspacing="0" bgcolor="#ffffff" align="center" class="es-content-body" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
                 <tr>
                  <td align="left" style="padding:30px;Margin:0">
                   <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="left" style="padding:0;Margin:0;width:540px">
                       <table width="100%" role="presentation" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr>
                         <h1 class="es-text-mobile-size-22" style="Margin:0;font-family:arial, 'helvetica neue', helvetica, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:22px;font-style:normal;font-weight:normal;line-height:26.4px;color:#333333;text-align:center">🎉 Welcome to RockyTracker!</h1>
                         </tr>
                         <tr>
                          <td align="center" style="padding:20px;Margin:0;font-size:0">
                           <table width="100%" height="100%" cellpadding="0" cellspacing="0" border="0" class="es-spacer" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr>
                              <td style="padding:0;Margin:0;width:100%;margin:0px;border-bottom:1px solid #cccccc;background:none;height:0px"></td>
                             </tr>
                           </table></td>
                         </tr>
                         <tr>
                          <td align="center" style="padding-top:10px;Margin:0"><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:25px;letter-spacing:0;color:#333333;font-size:14px"><strong>Thank you for signing up!</strong></p><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:25px;letter-spacing:0;color:#333333;font-size:14px"><strong><br></strong></p></td>
                         </tr>
                         <tr>
                          <td align="left" style="padding:0;Margin:0"><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:0;letter-spacing:0;color:#333333;font-size:14px"><br></p><p class="es-m-txt-c es-m-txt-l" style="padding-right: 60px;padding-left: 60px;Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:25px;letter-spacing:0;color:#333333;font-size:14px;text-align:center">You will now receive instant alerts whenever a rockfall is detected on roads or railways across Slovenia.</p><p class="es-m-txt-c es-m-txt-l" style="padding-right: 60px;padding-left: 60px;Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:25px;letter-spacing:0;color:#333333;font-size:14px;text-align:center">These notifications are here to help you stay safe and make smarter travel decisions.</p><p class="es-m-txt-c es-m-txt-l" style="padding-right: 70px;padding-left: 70px;Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:25px;letter-spacing:0;color:#333333;font-size:14px;text-align:center">Whether you're commuting or planning a road trip, we’ve got you covered.</p><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;letter-spacing:0;color:#333333;font-size:14px"><br></p><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:25px;letter-spacing:0;color:#333333;font-size:14px"><br></p><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:25px;letter-spacing:0;color:#333333;font-size:14px;;text-align:center">Stay safe out there,</p></td>
                         </tr>
                         <tr>
                          <td align="center" style="padding:0;Margin:0"><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:25px;letter-spacing:0;color:#333333;font-size:14px"><strong>🪨The RockyTracker Team</strong></p></td>
                         </tr>
                         <tr>
                          <td align="center" style="padding:20px;Margin:0;font-size:0">
                           <table height="100%" cellpadding="0" cellspacing="0" border="0" width="100%" class="es-spacer" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                             <tr>
                              <td style="padding:0;Margin:0;width:100%;margin:0px;border-bottom:1px solid #cccccc;background:none;height:0px"></td>
                             </tr>
                           </table></td>
                         </tr>
                         <tr>
                          <td align="center" class="es-text-5064" style="padding:0;Margin:0"><p class="es-text-mobile-size-12" style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:18px;letter-spacing:0;color:#666666;font-size:12px">If you didn’t sign up for these alerts, feel free to ignore this email or <a target="_blank" href="${unsubscribeUrl}" style="mso-line-height-rule:exactly;text-decoration:underline;color:#666666;font-size:12px">unsubscribe</a>.</p></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table>
           <table cellspacing="0" cellpadding="0" align="center" class="es-footer" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent">
           </table></td>
         </tr>
       </table>
      </div>
     </body>
    </html>
    `
    });
}


router.post('/api/subscribe', async (req, res) => {
    const { email, consent } = req.body;
    if (!email || !consent) {
        return res.status(400).send('Email + consent required');
    }

    try {
        const check = await pool.query(
            'SELECT 1 FROM subscription_list WHERE email = $1',
            [email]
        );

        if (check.rowCount > 0) {
            return res.status(200).send('You are already subscribed.');
        }

        await pool.query(
            'INSERT INTO subscription_list(email) VALUES ($1)',
            [email]
        );

        res.send('Subscribed! Welcome email will be sent.');

        sendWelcomeEmail(email).catch(err =>
            console.error('Failed to send email:', err)
        );

    } catch (err) {
        console.error('DB error:', err);
        res.status(500).send('DB error');
    }
});

module.exports = router;

