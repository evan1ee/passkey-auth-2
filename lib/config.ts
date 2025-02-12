export const sessionConfig = {
    cookieName: "next-iron-session",
    password: "complex-password-at-least-32-characters-long",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
  };