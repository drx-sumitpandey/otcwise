import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Heart, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const FeedbackPage = () => {
  const [type, setType] = useState('Feedback');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/feedback`, { type, message });
      toast.success('Thank you for your feedback!');
      setMessage('');
      setType('Feedback');
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="feedback-page">
      {/* Navigation */}
      <nav className="glass-card mx-auto max-w-7xl my-4 p-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-primary" style={{fontFamily: 'Merriweather'}}>OTCwise</span>
          </Link>
          <Button onClick={() => navigate('/')} variant="ghost" data-testid="back-home-btn">
            ← Home
          </Button>
        </div>
      </nav>

      {/* Header */}
      <section className="py-16 px-6 hero-gradient">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4" style={{fontFamily: 'Merriweather'}} data-testid="page-title">
            Feedback & Support
          </h1>
          <p className="text-lg text-foreground/90 max-w-2xl mx-auto" data-testid="page-subtitle">
            Help us improve OTCwise. Share your feedback or report issues.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-2xl" style={{fontFamily: 'Merriweather'}} data-testid="form-title">
                <MessageSquare className="inline w-6 h-6 mr-2" />
                Submit Feedback
              </CardTitle>
              <CardDescription data-testid="form-description">
                Your input helps us create a better experience for everyone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="rounded-xl" data-testid="feedback-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Feedback" data-testid="type-feedback">General Feedback</SelectItem>
                      <SelectItem value="Error" data-testid="type-error">Report Error</SelectItem>
                      <SelectItem value="AdverseEffect" data-testid="type-adverse">Report Adverse Effect</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Please share your thoughts, report an issue, or describe an adverse effect..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={8}
                    className="rounded-xl"
                    required
                    data-testid="feedback-message-textarea"
                  />
                  <p className="text-xs text-muted-foreground">
                    {type === 'AdverseEffect' && 'Note: This is for educational reporting only and does not constitute medical advice or consultation.'}
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-full"
                  size="lg"
                  disabled={loading}
                  data-testid="submit-feedback-btn"
                >
                  {loading ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              For urgent medical concerns, please contact a healthcare professional immediately.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeedbackPage;