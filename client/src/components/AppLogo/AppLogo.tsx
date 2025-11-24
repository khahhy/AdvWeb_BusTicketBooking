import { useTheme } from "@/contexts/ThemeContext";
import Logo from "@/assets/images/logo.svg";
import LogoWhite from "@/assets/images/logo-white.svg";

export const AppLogo = (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
  const { theme } = useTheme();

  const src = theme === "dark" ? LogoWhite : Logo;

  return <img src={src} alt="logo" {...props} />;
};
