import { Injectable, Logger } from '@nestjs/common';

/**
 * Email service
 * Handles sending emails (verification, password reset, notifications)
 * 
 * TODO: Integrate with email provider (SendGrid, AWS SES, Mailgun, etc.)
 */
@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    /**
     * Send email verification code
     */
    async sendVerificationEmail(email: string, code: string): Promise<void> {
        this.logger.log(`Sending verification email to ${email} with code: ${code}`);

        // TODO: Implement email sending
        // Example with SendGrid:
        // await this.sendgrid.send({
        //   to: email,
        //   from: 'noreply@yourapp.com',
        //   subject: 'Verify your email',
        //   html: `Your verification code is: ${code}`,
        // });
    }

    /**
     * Send password reset code
     */
    async sendPasswordResetEmail(email: string, code: string): Promise<void> {
        this.logger.log(`Sending password reset email to ${email} with code: ${code}`);

        // TODO: Implement email sending
    }

    /**
     * Send welcome email
     */
    async sendWelcomeEmail(email: string, name: string): Promise<void> {
        this.logger.log(`Sending welcome email to ${email}`);

        // TODO: Implement email sending
    }

    /**
     * Send generic notification email
     */
    async sendNotification(
        email: string,
        subject: string,
        message: string,
    ): Promise<void> {
        this.logger.log(`Sending notification to ${email}: ${subject}`);

        // TODO: Implement email sending
    }
}
