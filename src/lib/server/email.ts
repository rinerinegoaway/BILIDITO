import { dev } from '$app/env';
import { EMAIL_FROM, SMTP_URL } from '$app/env/private';
import nodemailer, { type Transporter } from 'nodemailer';

export interface EmailMessage {
	to: string;
	subject: string;
	text: string;
}

let transporter: Transporter | undefined;

/**
 * Sends a transactional email over SMTP (any provider; configured by SMTP_URL).
 * In development without SMTP_URL the message is printed to the server console so flows like
 * password reset can be tested locally. In production a missing SMTP_URL is a configuration error.
 */
export async function sendEmail(message: EmailMessage): Promise<void> {
	if (!SMTP_URL) {
		if (dev) {
			console.info(
				`\n[dev email] to=${message.to}\nsubject: ${message.subject}\n\n${message.text}\n`
			);
			return;
		}
		throw new Error('SMTP_URL is not configured; cannot send email.');
	}

	transporter ??= nodemailer.createTransport(SMTP_URL);
	await transporter.sendMail({ from: EMAIL_FROM, ...message });
}
