import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API } from '../App';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Heart, AlertCircle, Droplet, Wind, Bone } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const FirstAidPage = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const iconMap = {
    flame: AlertCircle,
    droplet: Droplet,
    wind: Wind,
    bone: Bone,
    'alert-triangle': AlertCircle
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await axios.get(`${API}/first-aid/topics`);
      setTopics(response.data);
    } catch (error) {
      toast.error('Failed to load first aid topics');
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

  return (
    <div className="min-h-screen bg-background" data-testid="first-aid-page">
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
            First Aid Guidance
          </h1>
          <p className="text-lg text-foreground/90 max-w-2xl mx-auto" data-testid="page-subtitle">
            Step-by-step instructions for common emergencies. Always seek professional medical help when needed.
          </p>
        </div>
      </section>

      {/* Topics Grid */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => {
              const IconComponent = iconMap[topic.icon] || AlertCircle;
              return (
                <Card
                  key={topic.id}
                  className="card-interactive p-6 cursor-pointer"
                  onClick={() => navigate(`/first-aid/${topic.id}`)}
                  data-testid={`first-aid-topic-${topic.id}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-primary mb-2" style={{fontFamily: 'Merriweather'}}>
                        {topic.title}
                      </h3>
                      <p className="text-sm text-foreground/80">{topic.description}</p>
                      <div className="mt-4 text-primary font-medium text-sm">
                        View Guide →
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Disclaimer */}
          <div className="mt-12 bg-accent/30 p-6 rounded-xl" data-testid="first-aid-disclaimer">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-primary mb-2">Important Notice</h4>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  This first aid guidance is for educational purposes only. In case of serious injury or medical emergency, 
                  always call emergency services immediately. This information does not replace professional medical training or advice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FirstAidPage;