import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API } from '../App';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Heart, MapPin, Phone, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const LocatorPage = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(loc);
          fetchLocations(loc);
        },
        (error) => {
          toast.error('Could not get your location. Using default location.');
          const defaultLoc = { lat: 40.7128, lng: -74.0060 }; // NYC
          setLocation(defaultLoc);
          fetchLocations(defaultLoc);
        }
      );
    } else {
      toast.error('Geolocation not supported');
      const defaultLoc = { lat: 40.7128, lng: -74.0060 };
      setLocation(defaultLoc);
      fetchLocations(defaultLoc);
    }
  };

  const fetchLocations = async (loc) => {
    try {
      const [pharmaciesRes, doctorsRes] = await Promise.all([
        axios.get(`${API}/locator/pharmacies?lat=${loc.lat}&lng=${loc.lng}`),
        axios.get(`${API}/locator/doctors?lat=${loc.lat}&lng=${loc.lng}`)
      ]);
      setPharmacies(pharmaciesRes.data);
      setDoctors(doctorsRes.data);
    } catch (error) {
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = (address) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.openstreetmap.org/search?query=${encodedAddress}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading nearby locations...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="locator-page">
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
            Find Care Providers
          </h1>
          <p className="text-lg text-foreground/90 max-w-2xl mx-auto" data-testid="page-subtitle">
            Locate nearby pharmacies and doctors for professional healthcare
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="pharmacies" className="w-full" data-testid="locator-tabs">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pharmacies" data-testid="tab-pharmacies">Pharmacies ({pharmacies.length})</TabsTrigger>
              <TabsTrigger value="doctors" data-testid="tab-doctors">Doctors ({doctors.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pharmacies" className="mt-6">
              <div className="grid gap-4" data-testid="pharmacies-list">
                {pharmacies.map((pharmacy) => (
                  <Card key={pharmacy.id} className="p-6" data-testid={`pharmacy-${pharmacy.id}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-primary mb-2">{pharmacy.name}</h3>
                        <div className="space-y-2 text-sm text-foreground/80">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{pharmacy.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <a href={`tel:${pharmacy.phone}`} className="text-primary hover:underline">
                              {pharmacy.phone}
                            </a>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openInMaps(pharmacy.address)}
                        className="rounded-full"
                        data-testid={`map-btn-${pharmacy.id}`}
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Map
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="doctors" className="mt-6">
              <div className="grid gap-4" data-testid="doctors-list">
                {doctors.map((doctor) => (
                  <Card key={doctor.id} className="p-6" data-testid={`doctor-${doctor.id}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-primary mb-1">{doctor.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{doctor.specialty}</p>
                        <div className="space-y-2 text-sm text-foreground/80">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{doctor.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <a href={`tel:${doctor.phone}`} className="text-primary hover:underline">
                              {doctor.phone}
                            </a>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openInMaps(doctor.address)}
                        className="rounded-full"
                        data-testid={`map-btn-${doctor.id}`}
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Map
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default LocatorPage;