import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string | string[];
    subject: string;
    html: string;
}) {
    try {
        const data = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'DailyDesign <noreply@mail.radhagarine.com>',
            to,
            subject,
            html,
        });
        return { success: true, data };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error };
    }
}
