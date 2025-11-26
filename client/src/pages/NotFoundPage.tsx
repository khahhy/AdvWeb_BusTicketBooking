import { useNavigate } from "react-router-dom";
import logoImage from "@/assets/images/logo.png";
import backgroundImage from "@/assets/images/background.png";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative flex items-center justify-center"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundPosition: "center bottom",
      }}
    >
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => navigate("/dashboard")}
          className="hover:opacity-80 transition-opacity"
        >
          <img src={logoImage} alt="Logo" className="w-32" />
        </button>
      </div>

      <div className="max-w-2xl w-full mx-auto px-6 py-6 relative z-10">
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
            <h1 className="text-3xl font-bold text-foreground/80 mb-4">
              Page Not Found
            </h1>

            <p className="text-gray-600 mb-8 text-base leading-relaxed">
              The page you are looking for does not exist or has been moved
            </p>

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
            >
              Back to Dashboard
            </button>

            <div className="mt-4">
              <button
                onClick={() => navigate(-1)}
                className="text-sm text-primary font-semibold hover:underline"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
