
import AuthGuard from "@/components/AuthGuard";
import AuthLogin from "@/components/AuthLogin";
import LicensingSystem from "@/pages/LicensingSystem";

const LicensingSystemWithAuth = () => {
  return (
    <AuthGuard fallback={<AuthLogin />}>
      <LicensingSystem />
    </AuthGuard>
  );
};

export default LicensingSystemWithAuth;
