export const COLORS = {
  primary: "#2F6FA7",
  secondary: "#ff865c",
  third: "#00cce0",
};

export const envName = `${process.env.APP_CODE || "strongvpn"}-${
  process.env.APP_ENV || "dev"
}`;

export const EMAIL = process.env.EMAIL;
