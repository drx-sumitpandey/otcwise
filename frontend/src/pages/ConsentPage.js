import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../App';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const ConsentPage = () => {
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAccept = async () => {
    if (!consentAccepted) {
      toast.error('Please accept the consent to continue');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('otcwise_token');
      await axios.post(
        `${API}/consent/accept`,
        { age_confirmed: true, consent_version: '1.0' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Consent recorded');
      navigate('/symptoms');
    } catch (error) {
      toast.error('Failed to record consent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-6" data-testid="consent-page">
      <Card className="w-full max-w-3xl glass-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-3xl" style={{fontFamily: 'Merriweather'}} data-testid="consent-title">
            Important Information
          </CardTitle>
          <CardDescription data-testid="consent-subtitle">
            Please read and accept the following before proceeding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-accent/30 p-6 rounded-xl space-y-4" data-testid="consent-content">
            <h3 className="font-semibold text-lg text-primary">Medical Disclaimer</h3>
            <ul className="space-y-3 text-sm leading-relaxed text-foreground/80">
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                <span>OTCwise provides <strong>educational information only</strong> and does not diagnose, treat, or prescribe.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                <span>All health insights are <strong>non-diagnostic</strong> and for informational purposes.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                <span>This platform <strong>does not replace</strong> professional medical advice from doctors or pharmacists.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                <span>In case of emergency or severe symptoms, <strong>seek immediate medical attention</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                <span>Medicine information is for reference only and <strong>not personalized</strong> to your condition.</span>
              </li>
            </ul>
          </div>

          <div className="flex items-start space-x-2 p-4 bg-white rounded-xl">
            <Checkbox
              id="consent"
              checked={consentAccepted}
              onCheckedChange={setConsentAccepted}
              data-testid="consent-accept-checkbox"
            />
            <label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
              I have read and understood the disclaimer. I acknowledge that OTCwise is an educational platform and does not provide medical diagnosis, treatment, or prescription services.
            </label>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex-1 rounded-full"
              data-testid="consent-decline-btn"
            >
              Decline
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!consentAccepted || loading}
              className="flex-1 rounded-full"
              data-testid="consent-accept-btn"
            >
              {loading ? 'Processing...' : 'Accept & Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsentPage;