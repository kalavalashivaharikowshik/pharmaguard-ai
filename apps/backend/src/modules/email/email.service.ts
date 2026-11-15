import { Injectable, Logger } from '@nestjs/common';

import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {

  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailer: MailerService,
  ) {}

  /**
   * Sends mail when SMTP is configured. Without SMTP (or if sending fails) the
   * message is logged instead, so flows like registration approval and
   * password reset never fail because of email.
   */
  private async send(options: { to: string; subject: string; html: string }) {
    if (!process.env.SMTP_HOST) {
      const link = options.html.match(/href="([^"]+)"/)?.[1];
      this.logger.warn(`[Email disabled] "${options.subject}" to ${options.to}${link ? ` link: ${link}` : ''}`);
      return;
    }
    try {
      await this.mailer.sendMail(options);
    } catch (err) {
      this.logger.error(`Email to ${options.to} failed: ${(err as Error).message}`);
    }
  }

  async sendActivationEmail(
    email: string,
    token: string,
  ) {

    const url =
      `${process.env.FRONTEND_URL}/activate?token=${token}`;

    await this.send({

      to: email,

      subject:
        'Activate your PharmaGuard AI Account',

      html: `

      <div style="
        font-family:Arial,sans-serif;
        max-width:600px;
        margin:auto;
        padding:30px;
        border:1px solid #E5E7EB;
        border-radius:10px;
      ">

      <h2 style="color:#0F766E;">
        PharmaGuard AI
      </h2>

      <p>

        Your registration has been approved.

      </p>

      <p>

        Click below to activate your account.

      </p>

      <a
        href="${url}"
        style="
          background:#0F766E;
          color:white;
          padding:12px 20px;
          text-decoration:none;
          border-radius:6px;
          display:inline-block;
        "
      >

        Activate Account

      </a>

      <p style="margin-top:20px;">

        This activation link expires in 24 hours.

      </p>

      <hr>

      <small>

        PharmaGuard AI

      </small>

      </div>

      `,

    });

  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
  ) {

    const url =
      `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.send({

      to: email,

      subject:
        'Reset Your Password',

      html: `

      <h2>Password Reset</h2>

      <p>

      Click below to reset your password.

      </p>

      <a href="${url}">

      Reset Password

      </a>

      `,

    });

  }

  async sendRegistrationApprovedEmail(
    email: string,
  ) {

    await this.send({

      to: email,

      subject:
        'Registration Approved',

      html: `

      <h2>

      Congratulations!

      </h2>

      <p>

      Your organization registration has been approved.

      </p>

      `,

    });

  }

  async sendRegistrationRejectedEmail(
    email: string,
    reason: string,
  ) {

    await this.send({

      to: email,

      subject:
        'Registration Rejected',

      html: `

      <h2>

      Registration Rejected

      </h2>

      <p>

      Reason:

      ${reason}

      </p>

      `,

    });

  }

  async sendRecallNotificationEmail(
    email: string,
    message: string,
  ) {

    await this.send({

      to: email,

      subject:
        'Drug Recall Alert',

      html: `<p>${message}</p>`,

    });

  }

  async sendExpiryNotificationEmail(
    email: string,
    message: string,
  ) {

    await this.send({

      to: email,

      subject:
        'Batch Expiry Alert',

      html: `<p>${message}</p>`,

    });

  }

  async sendComplianceReportEmail(
    email: string,
    reportUrl: string,
  ) {

    await this.send({

      to: email,

      subject:
        'Compliance Report',

      html: `

      <p>

      Your compliance report is ready.

      </p>

      <a href="${reportUrl}">

      View Report

      </a>

      `,

    });

  }

}