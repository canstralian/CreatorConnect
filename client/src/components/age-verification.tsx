import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AgeVerificationProps {
  children: React.ReactNode;
}

export default function AgeVerification({ children }: AgeVerificationProps) {
  const [verified, setVerified] = useState<boolean>(false);

  useEffect(() => {
    // Check if age has been verified in this session
    const ageVerified = sessionStorage.getItem("ageVerified");
    if (ageVerified) {
      setVerified(true);
    }
  }, []);

  const handleVerify = () => {
    sessionStorage.setItem("ageVerified", "true");
    setVerified(true);
  };

  const handleExit = () => {
    window.location.href = "https://www.google.com";
  };

  if (verified) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <Card className="max-w-md w-full mx-4 shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Age Verification</h2>
            <p className="text-accent mb-6">
              This website contains adult content and is only suitable for those who are 18 years or older.
              By entering, you confirm that you are at least 18 years of age.
            </p>
          </div>
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={handleVerify}
              className="bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-lg font-medium transition duration-300"
            >
              I am 18 or older - Enter
            </Button>
            <Button 
              onClick={handleExit}
              variant="outline"
              className="bg-white border border-accent text-accent py-3 px-6 rounded-lg font-medium transition duration-300 hover:bg-muted"
            >
              I am under 18 - Exit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
