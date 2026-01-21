import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { API } from '../App';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Heart, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const FirstAidDetailPage = () => {
  const { topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopic();
  }, [topicId]);

  const fetchTopic = async () => {
    try {
      const response = await axios.get(`${API}/first-aid/${topicId}`);
      setTopic(response.data);
    } catch (error) {
      toast.error('Failed to load topic');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Topic not found</p>
          <Button onClick={() => navigate('/first-aid')}>Back to First Aid</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="first-aid-detail-page">
      {/* Navigation */}
      <nav className="glass-card mx-auto max-w-7xl my-4 p-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-primary" style={{fontFamily: 'Merriweather'}}>OTCwise</span>
          </Link>
          <Button onClick={() => navigate('/first-aid')} variant="ghost" data-testid="back-to-topics-btn">
            ← All Topics
          </Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4" style={{fontFamily: 'Merriweather'}} data-testid="topic-title">
            {topic.title}
          </h1>
          <p className="text-lg text-foreground/80" data-testid="topic-description">{topic.description}</p>
        </div>

        {/* Steps */}
        <Card className="p-8 mb-8" data-testid="steps-container">
          <h2 className="text-2xl font-semibold text-primary mb-6" style={{fontFamily: 'Merriweather'}}>
            Step-by-Step Instructions
          </h2>
          <div className="space-y-6">
            {topic.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-4" data-testid={`step-${index}`}>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-primary">{step.step_order}</span>
                </div>
                <div className="flex-1">
                  <p className="text-base text-foreground/90 leading-relaxed">{step.instruction}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Emergency Note */}
        <div className="bg-destructive/10 p-6 rounded-xl border-2 border-destructive/20" data-testid="emergency-note">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-destructive mb-2">When to Seek Medical Help</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">{topic.emergency_note}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button
            size="lg"
            onClick={() => navigate('/locator')}
            className="rounded-full"
            data-testid="find-care-btn"
          >
            Find Nearby Care
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/first-aid')}
            className="rounded-full"
            data-testid="back-topics-btn"
          >
            View Other Topics
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FirstAidDetailPage;