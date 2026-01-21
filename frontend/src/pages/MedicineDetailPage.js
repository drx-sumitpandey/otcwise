import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { API } from '../App';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Heart, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const MedicineDetailPage = () => {
  const { medicineId } = useParams();
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMedicine();
  }, [medicineId]);

  const fetchMedicine = async () => {
    try {
      const response = await axios.get(`${API}/medicines/${medicineId}`);
      setMedicine(response.data);
    } catch (error) {
      toast.error('Failed to load medicine information');
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

  if (!medicine) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Medicine not found</p>
          <Button onClick={() => navigate('/medicines')}>Back to Search</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="medicine-detail-page">
      {/* Navigation */}
      <nav className="glass-card mx-auto max-w-7xl my-4 p-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-primary" style={{fontFamily: 'Merriweather'}}>OTCwise</span>
          </Link>
          <Button onClick={() => navigate('/medicines')} variant="ghost" data-testid="back-to-search-btn">
            ← Back to Search
          </Button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2" style={{fontFamily: 'Merriweather'}} data-testid="medicine-name">
                {medicine.brand_name || medicine.generic_name}
              </h1>
              <p className="text-lg text-muted-foreground" data-testid="generic-name">{medicine.generic_name}</p>
              {medicine.drug_class && <p className="text-base text-foreground/80 mt-1" data-testid="drug-class">{medicine.drug_class}</p>}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-accent/30 p-4 rounded-xl flex items-start gap-3" data-testid="medicine-disclaimer">
            <AlertTriangle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/80">
              This information is for educational purposes only. It is not personalized medical advice. 
              Always consult a healthcare professional before starting, stopping, or changing any medication.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full" data-testid="medicine-tabs">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="indications" data-testid="tab-indications">Uses</TabsTrigger>
            <TabsTrigger value="contraindications" data-testid="tab-contraindications">Contraindications</TabsTrigger>
            <TabsTrigger value="interactions" data-testid="tab-interactions">Interactions</TabsTrigger>
            <TabsTrigger value="side-effects" data-testid="tab-side-effects">Side Effects</TabsTrigger>
            <TabsTrigger value="cautions" data-testid="tab-cautions">Cautions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-primary mb-4">General Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Generic Name</p>
                  <p className="text-base text-foreground/90">{medicine.generic_name}</p>
                </div>
                {medicine.brand_name && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Brand Name</p>
                    <p className="text-base text-foreground/90">{medicine.brand_name}</p>
                  </div>
                )}
                {medicine.drug_class && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Drug Class</p>
                    <p className="text-base text-foreground/90">{medicine.drug_class}</p>
                  </div>
                )}
                {medicine.standard_adult_dose && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Standard Adult Dose (Reference Only)</p>
                    <p className="text-base text-foreground/90">{medicine.standard_adult_dose}</p>
                    <p className="text-xs text-muted-foreground mt-1 italic">Not personalized. Refer to package or consult a professional.</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="indications" className="mt-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-primary mb-4">General Indications</h3>
              <ul className="space-y-2">
                {medicine.indications.map((indication, index) => (
                  <li key={index} className="flex items-start gap-2 text-foreground/90">
                    <span className="text-primary mt-1">•</span>
                    <span>{indication}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </TabsContent>

          <TabsContent value="contraindications" className="mt-6">
            <Card className="p-6 border-destructive/30">
              <h3 className="text-xl font-semibold text-destructive mb-4">Contraindications</h3>
              <ul className="space-y-2">
                {medicine.contraindications.map((contraindication, index) => (
                  <li key={index} className="flex items-start gap-2 text-foreground/90">
                    <span className="text-destructive mt-1">•</span>
                    <span>{contraindication}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </TabsContent>

          <TabsContent value="interactions" className="mt-6">
            <Card className="p-6 border-secondary/30">
              <h3 className="text-xl font-semibold text-secondary mb-4">Drug & Food Interactions</h3>
              <ul className="space-y-2">
                {medicine.interactions.map((interaction, index) => (
                  <li key={index} className="flex items-start gap-2 text-foreground/90">
                    <span className="text-secondary mt-1">•</span>
                    <span>{interaction}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </TabsContent>

          <TabsContent value="side-effects" className="mt-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-primary mb-4">Common Adverse Effects</h3>
              <ul className="space-y-2">
                {medicine.adverse_effects.map((effect, index) => (
                  <li key={index} className="flex items-start gap-2 text-foreground/90">
                    <span className="text-primary mt-1">•</span>
                    <span>{effect}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </TabsContent>

          <TabsContent value="cautions" className="mt-6">
            <Card className="p-6 bg-accent/10">
              <h3 className="text-xl font-semibold text-accent-foreground mb-4">Caution Notes</h3>
              <ul className="space-y-2">
                {medicine.cautions.map((caution, index) => (
                  <li key={index} className="flex items-start gap-2 text-foreground/90">
                    <span className="text-accent-foreground mt-1">•</span>
                    <span>{caution}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button
            size="lg"
            onClick={() => navigate('/locator')}
            className="rounded-full"
            data-testid="find-pharmacist-btn"
          >
            Find Pharmacist
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/medicines')}
            className="rounded-full"
            data-testid="search-again-btn"
          >
            Search Another
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MedicineDetailPage;