import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Heart, AlertCircle, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const SymptomCheckerPage = () => {
  const [symptom, setSymptom] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const addSymptom = () => {
    if (!symptom.trim()) return;
    if (symptoms.includes(symptom.trim())) {
      toast.error('Symptom already added');
      return;
    }
    setSymptoms([...symptoms, symptom.trim()]);
    setSymptom('');
  };

  const removeSymptom = (index) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (symptoms.length === 0) {
      toast.error('Please add at least one symptom');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('otcwise_token');
      const response = await axios.post(
        `${API}/symptoms/check`,
        { symptoms },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.emergency) {
        navigate('/emergency');
      } else {
        setResult(response.data);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Please accept consent first');
        navigate('/consent');
      } else {
        toast.error('Failed to analyze symptoms');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'Low': return 'bg-green-100 text-green-800 border-green-300';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'High': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="symptom-checker-page">
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
            Check My Health
          </h1>
          <p className="text-lg text-foreground/90 max-w-2xl mx-auto" data-testid="page-subtitle">
            Get educational insights about your symptoms. Not a diagnosis.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Disclaimer */}
          <div className="bg-accent/30 p-6 rounded-xl mb-8 flex items-start gap-3" data-testid="symptom-disclaimer">
            <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-primary mb-2">Important Notice</h4>
              <p className="text-sm text-foreground/80 leading-relaxed">
                This tool provides educational information only and does not diagnose medical conditions. 
                Emergency symptoms will trigger an immediate alert. Always seek professional medical advice for health concerns.
              </p>
            </div>
          </div>

          {/* Input Form */}
          {!result && (
            <Card className="p-8" data-testid="symptom-input-card">
              <h2 className="text-2xl font-semibold text-primary mb-6" style={{fontFamily: 'Merriweather'}}>
                Tell Us Your Symptoms
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Add Symptoms</label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="e.g., headache, fever, cough..."
                      value={symptom}
                      onChange={(e) => setSymptom(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSymptom())}
                      className="flex-1 rounded-xl"
                      data-testid="symptom-input"
                    />
                    <Button type="button" onClick={addSymptom} variant="outline" className="rounded-full" data-testid="add-symptom-btn">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {symptoms.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Symptoms ({symptoms.length})</label>
                    <div className="flex flex-wrap gap-2" data-testid="symptom-list">
                      {symptoms.map((s, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1.5" data-testid={`symptom-badge-${index}`}>
                          {s}
                          <button
                            type="button"
                            onClick={() => removeSymptom(index)}
                            className="ml-2 hover:text-destructive"
                            data-testid={`remove-symptom-${index}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || symptoms.length === 0}
                  className="w-full rounded-full"
                  size="lg"
                  data-testid="check-symptoms-btn"
                >
                  {loading ? 'Analyzing...' : 'Get Insights'}
                </Button>
              </form>
            </Card>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-6" data-testid="symptom-results">
              {/* Risk Level */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-primary">Risk Level</h3>
                  <Badge className={`${getRiskColor(result.risk_level)} px-4 py-2 text-base font-semibold`} data-testid="risk-level-badge">
                    {result.risk_level}
                  </Badge>
                </div>
              </Card>

              {/* Summary */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-primary mb-4">Summary</h3>
                <p className="text-base text-foreground/90 leading-relaxed" data-testid="summary-text">{result.summary}</p>
              </Card>

              {/* Possible Associations */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-primary mb-4">May Be Associated With</h3>
                <ul className="space-y-2" data-testid="associations-list">
                  {result.possible_associations.map((association, index) => (
                    <li key={index} className="flex items-start gap-2 text-foreground/90">
                      <span className="text-primary mt-1">•</span>
                      <span>{association}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Next Steps */}
              <Card className="p-6 bg-accent/10">
                <h3 className="text-xl font-semibold text-accent-foreground mb-4">Recommended Next Steps</h3>
                <ul className="space-y-2" data-testid="next-steps-list">
                  {result.next_steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2 text-foreground/90">
                      <span className="text-accent-foreground mt-1">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Disclaimer */}
              <div className="bg-accent/30 p-4 rounded-xl" data-testid="result-disclaimer">
                <p className="text-sm text-foreground/80 italic">{result.disclaimer}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/locator')}
                  className="rounded-full"
                  data-testid="find-care-btn"
                >
                  Find Healthcare Provider
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => { setResult(null); setSymptoms([]); }}
                  className="rounded-full"
                  data-testid="check-again-btn"
                >
                  Check Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SymptomCheckerPage;