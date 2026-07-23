"use client";

import emailjs from "@emailjs/browser";
import { useEffect } from "react";

const configurationMessage =
  "Email service is not configured yet. Please contact me through email or WhatsApp.";
const successMessage = "Message sent successfully. I’ll get back to you soon.";
const failureMessage =
  "Message could not be sent. Please try email or WhatsApp instead.";

export function EmailJsContactBridge() {
  useEffect(() => {
    const form = document.querySelector<HTMLFormElement>("#conversationForm");
    const status = document.querySelector<HTMLElement>("#formStatus");
    const submitButton = form?.querySelector<HTMLButtonElement>(
      "button[type='submit']",
    );
    if (!form || !status || !submitButton) return;

    const honeypotField = document.createElement("div");
    honeypotField.className = "honeypot-field";
    honeypotField.setAttribute("aria-hidden", "true");
    const honeypotLabel = document.createElement("label");
    honeypotLabel.htmlFor = "companyWebsite";
    honeypotLabel.textContent = "Company website";
    const honeypot = document.createElement("input");
    honeypot.id = "companyWebsite";
    honeypot.type = "text";
    honeypot.name = "companyWebsite";
    honeypot.tabIndex = -1;
    honeypot.autocomplete = "off";
    honeypotField.append(honeypotLabel, honeypot);
    form.append(honeypotField);

    const originalButtonMarkup = submitButton.innerHTML;
    let startedAt = 0;
    let sending = false;
    const markStarted = () => {
      if (!startedAt) startedAt = performance.now();
    };

    const submit = async (event: SubmitEvent) => {
      event.preventDefault();
      if (sending || honeypot.value) return;

      if (!form.checkValidity()) {
        form.reportValidity();
        status.textContent = "Please complete all fields.";
        return;
      }
      if (!startedAt || performance.now() - startedAt < 1_800) {
        status.textContent = "Please take a moment to review your message.";
        return;
      }

      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
      if (!serviceId || !templateId || !publicKey) {
        status.textContent = configurationMessage;
        return;
      }

      const values = new FormData(form);
      sending = true;
      submitButton.disabled = true;
      submitButton.textContent = "Sending…";
      form.setAttribute("aria-busy", "true");
      status.textContent = "Sending…";

      try {
        await emailjs.send(
          serviceId,
          templateId,
          {
            from_name: String(values.get("name") || "").trim(),
            reply_to: String(values.get("email") || "").trim(),
            submitted_at: new Date().toISOString(),
            source_page: window.location.href,
            message: String(values.get("message") || "").trim(),
          },
          {
            publicKey,
          },
        );
        form.reset();
        startedAt = 0;
        status.textContent = successMessage;
      } catch (error: unknown) {
        status.textContent = failureMessage;
        if (process.env.NODE_ENV === "development") {
          const statusCode =
            typeof error === "object" &&
            error !== null &&
            "status" in error &&
            typeof error.status === "number"
              ? error.status
              : undefined;
          console.error("EmailJS request failed.", {
            status: statusCode,
            text: "EmailJS request failed",
          });
        }
      } finally {
        sending = false;
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonMarkup;
        form.removeAttribute("aria-busy");
      }
    };

    form.addEventListener("focusin", markStarted);
    form.addEventListener("input", markStarted);
    form.addEventListener("submit", submit);
    return () => {
      form.removeEventListener("focusin", markStarted);
      form.removeEventListener("input", markStarted);
      form.removeEventListener("submit", submit);
      honeypotField.remove();
    };
  }, []);

  return null;
}
