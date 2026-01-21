import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext, API } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Heart, Search, Upload, Pill } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const MedicinePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [searching, setSearching] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await axios.get(`${API}/medicines/search?query=${searchQuery}`);
      setMedicines(response.data);
      if (response.data.length === 0) {
        toast.info('No medicines found. Try a different search term.');
      }
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!user) {
      toast.error('Please login to use image identification');
      navigate('/login');
      return;
    }

    setUploadedFile(file);
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('otcwise_token');
      const response = await axios.post(`${API}/medicines/identify`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.medicines && response.data.medicines.length > 0) {
        setMedicines(response.data.medicines);
        toast.success('Medicine identified!');
      } else {
        toast.info('No medicines identified. Try searching by name.');
      }
    } catch (error) {
      toast.error('Failed to identify medicine');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="medicine-page">
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
            Know Your Medicine
          </h1>
          <p className="text-lg text-foreground/90 max-w-2xl mx-auto" data-testid="page-subtitle">
            Search for medicines to understand their uses, interactions, and safety information.
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 mb-8" data-testid="search-card">
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Search by Name</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter brand or generic name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 rounded-xl"
                    data-testid="medicine-search-input"
                  />
                  <Button type="submit" disabled={searching} className="rounded-full" data-testid="search-btn">
                    <Search className="w-4 h-4 mr-2" />
                    {searching ? 'Searching...' : 'Search'}
                  </Button>
                </div>
              </div>

              {user && (
                <div className="pt-6 border-t">
                  <label className="block text-sm font-medium mb-2">Upload Medicine Image {!user && '(Login Required)'}</label>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      data-testid="medicine-upload-input"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-foreground/80 mb-2">
                        {uploading ? 'Processing...' : uploadedFile ? uploadedFile.name : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    Upload a clear image of the medicine strip or bottle for identification
                  </p>
                </div>
              )}
            </form>
          </Card>

          {/* Results */}
          {medicines.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-primary mb-6" style={{fontFamily: 'Merriweather'}} data-testid="results-title">
                Search Results
              </h2>
              <div className="grid gap-4" data-testid="medicine-results">
                {medicines.map((medicine) => (
                  <Card
                    key={medicine.id}
                    className="card-interactive p-6 cursor-pointer"
                    onClick={() => navigate(`/medicines/${medicine.id}`)}
                    data-testid={`medicine-item-${medicine.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <Pill className="w-6 h-6 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-primary mb-1">{medicine.brand_name || medicine.generic_name}</h3>
                        <p className="text-sm text-muted-foreground">{medicine.generic_name}</p>
                        {medicine.drug_class && <p className="text-sm text-foreground/80 mt-1">{medicine.drug_class}</p>}
                        <div className="mt-3 text-primary font-medium text-sm">
                          View Details →
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MedicinePage;