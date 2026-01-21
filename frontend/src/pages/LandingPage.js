import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Heart, ShieldCheck, Pill, AlertCircle, MapPin, MessageSquare } from 'lucide-react';

const LandingPage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass-card mx-auto max-w-7xl my-4 p-4" data-testid="main-navigation">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-primary" style={{fontFamily: 'Merriweather'}}>OTCwise</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button variant="ghost" onClick={() => navigate('/first-aid')} data-testid="nav-first-aid-btn">First Aid</Button>
                <Button variant="ghost" onClick={() => navigate('/medicines')} data-testid="nav-medicines-btn">Medicines</Button>
                <Button variant="ghost" onClick={() => navigate('/symptoms')} data-testid="nav-symptoms-btn">Symptoms</Button>
                <Button variant="ghost" onClick={() => navigate('/locator')} data-testid="nav-locator-btn">Find Care</Button>
                <Button onClick={logout} data-testid="logout-btn" className="rounded-full">Logout</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/first-aid')} data-testid="guest-first-aid-btn">First Aid</Button>
                <Button variant="outline" onClick={() => navigate('/login')} data-testid="login-nav-btn" className="rounded-full">Login</Button>
                <Button onClick={() => navigate('/register')} data-testid="register-nav-btn" className="rounded-full">Get Started</Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-gradient py-24 px-6" data-testid="hero-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">Trusted Health Information</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-primary" style={{fontFamily: 'Merriweather'}} data-testid="hero-title">
                Informed Care.<br/>Safer Choices.
              </h1>
              <p className="text-lg md:text-xl leading-relaxed text-foreground/90" data-testid="hero-subtitle">
                Your trusted companion for medicine information, first-aid guidance, and health awareness. Educational resources to help you make informed decisions.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => navigate(user ? '/symptoms' : '/register')} data-testid="hero-cta-btn" className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                  {user ? 'Check Symptoms' : 'Get Started Free'}
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/first-aid')} data-testid="hero-first-aid-btn" className="rounded-full">
                  View First Aid
                </Button>
              </div>
              <p className="text-sm text-muted-foreground italic" data-testid="hero-disclaimer">
                * This application provides educational information only and does not replace professional medical advice.
              </p>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/5765761/pexels-photo-5765761.jpeg" 
                alt="Healthcare professional" 
                className="rounded-2xl shadow-2xl"
                data-testid="hero-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-white" data-testid="features-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4" style={{fontFamily: 'Merriweather'}} data-testid="features-title">
              Your Health, Your Knowledge
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="features-subtitle">
              Access reliable health information whenever you need it
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* First Aid */}
            <div className="card-interactive p-8" onClick={() => navigate('/first-aid')} data-testid="feature-first-aid">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-primary mb-4" style={{fontFamily: 'Merriweather'}}>First Aid Guidance</h3>
              <p className="text-base text-foreground/80 leading-relaxed">
                Step-by-step instructions for common emergencies. Learn how to respond to burns, bleeding, choking, and more.
              </p>
              <div className="mt-6">
                <span className="text-primary font-medium">Learn More →</span>
              </div>
            </div>

            {/* Know Your Medicine */}
            <div className="card-interactive p-8" onClick={() => navigate('/medicines')} data-testid="feature-medicines">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                <Pill className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-semibold text-primary mb-4" style={{fontFamily: 'Merriweather'}}>Know Your Medicine</h3>
              <p className="text-base text-foreground/80 leading-relaxed">
                Search medicines, understand uses, interactions, and side effects. Upload images to identify medications.
              </p>
              <div className="mt-6">
                <span className="text-primary font-medium">Search Now →</span>
              </div>
            </div>

            {/* Symptom Insights */}
            <div className="card-interactive p-8" onClick={() => navigate(user ? '/symptoms' : '/register')} data-testid="feature-symptoms">
              <div className="w-16 h-16 rounded-full bg-accent/50 flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-semibold text-primary mb-4" style={{fontFamily: 'Merriweather'}}>Health Insights</h3>
              <p className="text-base text-foreground/80 leading-relaxed">
                Get educational insights about symptoms. Understand when to seek professional care. {!user && '(Login required)'}
              </p>
              <div className="mt-6">
                <span className="text-primary font-medium">{user ? 'Check Now' : 'Sign Up'} →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 hero-gradient" data-testid="cta-section">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6" style={{fontFamily: 'Merriweather'}} data-testid="cta-title">
            Find Healthcare Providers Near You
          </h2>
          <p className="text-lg text-foreground/90 mb-8" data-testid="cta-subtitle">
            Locate nearby pharmacies and doctors when you need professional care
          </p>
          <Button size="lg" onClick={() => navigate('/locator')} data-testid="cta-locator-btn" className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
            <MapPin className="w-5 h-5 mr-2" />
            Find Care Providers
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 px-6" data-testid="footer">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-6 h-6" />
                <span className="text-xl font-bold" style={{fontFamily: 'Merriweather'}}>OTCwise</span>
              </div>
              <p className="text-primary-foreground/80">Informed Care. Safer Choices.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/first-aid" className="text-primary-foreground/80 hover:text-primary-foreground">First Aid</Link></li>
                <li><Link to="/medicines" className="text-primary-foreground/80 hover:text-primary-foreground">Medicines</Link></li>
                <li><Link to="/locator" className="text-primary-foreground/80 hover:text-primary-foreground">Find Care</Link></li>
                <li><Link to="/feedback" className="text-primary-foreground/80 hover:text-primary-foreground">Feedback</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Disclaimer</h4>
              <p className="text-sm text-primary-foreground/80">
                OTCwise provides educational information only. It does not replace professional medical advice, diagnosis, or treatment.
              </p>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/80">
            <p>© 2025 OTCwise. Educational health information platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;