export const emailJsConfig = {
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
};

export const adminConfig = {
  email: import.meta.env.VITE_ADMIN_EMAIL || '',
  password: import.meta.env.VITE_ADMIN_PASSWORD || '',
};
