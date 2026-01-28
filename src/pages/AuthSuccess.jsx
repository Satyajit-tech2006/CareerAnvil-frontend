import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setAccessToken } from "@/lib/api"; // Update path if needed

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (accessToken) {
      // 1. Save Token
      setAccessToken(accessToken);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // 2. Redirect to Dashboard (Now that token is saved)
      navigate("/dashboard");
    } else {
      // If no token, go back to login
      navigate("/login");
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Logging you in...</p>
    </div>
  );
};

export default AuthSuccess;