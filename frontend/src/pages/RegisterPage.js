import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext, API } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Heart, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!ageConfirmed) {
      toast.error('You must be 18+ to register');
      return;
    }

    if (!disclaimerAccepted) {
      toast.error('Please accept the disclaimer');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/register`, {
        email,
        password,
        age_confirmed: ageConfirmed
      });
      login(response.data.token);
      toast.success('Welcome to OTCwise!');
      navigate('/consent');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-6" data-testid="register-page">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-3xl" style={{fontFamily: 'Merriweather'}} data-testid="register-title">Join OTCwise</CardTitle>
          <CardDescription data-testid="register-subtitle">Create your account for personalized health insights</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="register-email-input"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="register-password-input"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                data-testid="register-confirm-password-input"
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-4 pt-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="age"
                  checked={ageConfirmed}
                  onCheckedChange={setAgeConfirmed}
                  data-testid="age-confirm-checkbox"
                />
                <Label htmlFor="age" className="text-sm font-normal leading-relaxed">
                  I confirm that I am 18 years or older
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="disclaimer"
                  checked={disclaimerAccepted}
                  onCheckedChange={setDisclaimerAccepted}
                  data-testid="disclaimer-checkbox"
                />
                <Label htmlFor="disclaimer" className="text-sm font-normal leading-relaxed">
                  I understand that OTCwise provides educational information only and does not replace professional medical advice
                </Label>
              </div>
            </div>

            <div className="bg-accent/50 p-4 rounded-xl flex items-start gap-3" data-testid="info-disclaimer">
              <AlertCircle className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
              <p className="text-sm text-accent-foreground">
                By registering, you agree that OTCwise is an educational platform and not a medical service.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full rounded-full"
              disabled={loading}
              data-testid="register-submit-btn"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline" data-testid="login-link">
                Login
              </Link>
            </p>
          </div>
          
          <div className="mt-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary" data-testid="back-home-link">
              ← Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;