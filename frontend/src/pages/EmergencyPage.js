import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { AlertCircle, Phone } from 'lucide-react';

const EmergencyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-destructive/10 flex items-center justify-center p-6" data-testid="emergency-page">
      <Card className="w-full max-w-2xl p-8 border-destructive border-2">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center emergency-pulse">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-destructive" style={{fontFamily: 'Merriweather'}} data-testid="emergency-title">
            Emergency Situation Detected
          </h1>
          
          <p className="text-lg text-foreground/90" data-testid="emergency-message">
            Based on the symptoms you've reported, this may require immediate medical attention.
          </p>

          <div className="bg-destructive/10 p-6 rounded-xl space-y-4">
            <h2 className="text-xl font-semibold text-destructive">Immediate Actions:</h2>
            <ul className="text-left space-y-2 text-foreground/80">
              <li className="flex items-start gap-2">
                <span className="font-bold text-destructive">1.</span>
                <span>Call emergency services immediately (911 or your local emergency number)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-destructive">2.</span>
                <span>If possible, have someone stay with you</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-destructive">3.</span>
                <span>Do not drive yourself - wait for emergency services or have someone drive you</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-destructive">4.</span>
                <span>Follow any instructions given by emergency dispatchers</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-destructive hover:bg-destructive/90 rounded-full"
              onClick={() => window.location.href = 'tel:911'}
              data-testid="call-emergency-btn"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call Emergency (911)
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/locator')}
              className="rounded-full"
              data-testid="find-care-btn"
            >
              Find Nearby Hospital
            </Button>
          </div>

          <div className="pt-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              data-testid="back-home-btn"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmergencyPage;