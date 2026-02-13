const nodemailer = require("nodemailer");

function json(statusCode, bodyObj) {
    return {
        statusCode,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
        body: JSON.stringify(bodyObj),
    };
}

exports.handler = async (event) => {
    // Preflight
    if (event.httpMethod === "OPTIONS") return json(200, { ok: true });

    if (event.httpMethod !== "POST") {
        return json(405, { ok: false, message: "Method not allowed" });
    }

    let payload;
    try {
        payload = JSON.parse(event.body || "{}");
    } catch {
        return json(400, { ok: false, message: "Invalid JSON" });
    }

    const to = (payload.to || "").trim();
    const name = (payload.name || "love").trim();
    const summary = (payload.summary || "").trim();

    if (!to || !to.includes("@")) return json(400, { ok: false, message: "Invalid recipient email." });
    if (summary.length < 10) return json(400, { ok: false, message: "Summary too short." });

    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS; // Gmail App Password

    if (!EMAIL_USER || !EMAIL_PASS) {
        return json(500, { ok: false, message: "Missing EMAIL_USER / EMAIL_PASS in Netlify env vars." });
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });

    const subject = "💖 Valentine’s Date Reservation";
    const text =
        `Hi ${name} 💖

You have a Valentine's reservation!

${summary}

— Sent from the Valentine website ✨`;

    try {
        await transporter.sendMail({
            from: `"Kai 💘" <${EMAIL_USER}>`,
            to,
            subject,
            text,
        });
        return json(200, { ok: true, message: "Email sent successfully 💌" });
    } catch (err) {
        return json(500, { ok: false, message: "Email failed: " + err.message });
    }
};
