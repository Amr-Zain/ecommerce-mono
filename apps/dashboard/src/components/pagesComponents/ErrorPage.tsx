import { useNavigate, useRouter } from "@tanstack/react-router";
import serverDownJson from "@/assets/icons/animated/Livechatbot.json";
import { t } from "i18next";
import { Button } from "@ecommerce/ui/components/button";
import ThemeAwareLottie from "../common/uiComponents/ThemeAwareLottie";

const ErrorPage = ({ error }: { error: unknown }) => {
  const navigate = useNavigate();
  const router = useRouter();

  let message = "حصل خطأ غير متوقع.";
  if (error && typeof error === "object") {
    if ("message" in error && typeof (error as any).message === "string") {
      message = (error as any).message;
    } else if (
      "response" in error &&
      typeof (error as any).response?.data?.message === "string"
    ) {
      message = (error as any).response.data.message;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center  text-center">
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center">
        <ThemeAwareLottie
          animationData={serverDownJson}
          loop
          className="w-72 h-72 mb-6"
        />
        <h1 className="text-3xl font-bold mb-4 text-red-600">
          {t("server_error_page.title")}
        </h1>
        <p className="text-foreground mb-6">{message}</p>
        <Button
          onClick={() => window.location.replace("/")}
        >
          {t("server_error_page.back_to_home_button")}
        </Button>
      </div>
    </div>
  );
};

export default ErrorPage;
