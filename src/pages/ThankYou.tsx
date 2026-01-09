import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, ArrowLeft } from "lucide-react";

const ThankYou = () => {
  const navigate = useNavigate();

  return (
    <div className="erp-gradient-bg flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 text-center animate-fade-in">
        {/* Success Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/20 mb-6">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-heading font-bold text-card-foreground mb-2">
          Thank You!
        </h1>
        <p className="text-muted-foreground mb-8">
          Your action has been completed successfully. We appreciate your time and effort.
        </p>

        {/* Details Card */}
        <div className="bg-muted/30 rounded-xl p-4 mb-8">
          <p className="text-sm text-muted-foreground">
            A confirmation has been sent to your registered email address.
            Please check your inbox for further details.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button size="lg" onClick={() => navigate("/")}>
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          © 2025{" "}
          <span className="text-primary font-medium">Dhaanish Connect ERP</span>
        </p>
      </div>
    </div>
  );
};

export default ThankYou;
