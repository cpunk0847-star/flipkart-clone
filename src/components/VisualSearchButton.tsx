import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const VisualSearchButton = () => {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSearch = async () => {
    if (!preview) return;

    setUploading(true);
    try {
      // Convert base64 to blob
      const response = await fetch(preview);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('image', blob, 'search-image.jpg');
      
      // Get active budget from localStorage
      const budgetFilter = localStorage.getItem('budget_filter');
      if (budgetFilter) {
        formData.append('budget', budgetFilter);
      }

      // Store image in sessionStorage for results page
      sessionStorage.setItem('visualSearchImage', preview);
      
      // Navigate to results page immediately for better UX
      setOpen(false);
      navigate('/visual-search-results', { state: { uploading: true } });
      
      // Upload in background
      const uploadResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/visual-search`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || 'Search failed');
      }

      const data = await uploadResponse.json();
      
      // Store results in sessionStorage
      sessionStorage.setItem('visualSearchResults', JSON.stringify(data));
      
      // Trigger a custom event to notify the results page
      window.dispatchEvent(new CustomEvent('visualSearchComplete', { detail: data }));
      
    } catch (error) {
      console.error('Visual search error:', error);
      toast.error(error instanceof Error ? error.message : 'Search failed');
      navigate('/');
    } finally {
      setUploading(false);
      setPreview(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Camera className="w-4 h-4" />
          <span className="hidden sm:inline">Visual Search</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Visual Search</DialogTitle>
        </DialogHeader>
        
        {!preview ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload or capture an image to find similar products and complementary items
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-32 flex-col gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8" />
                <span>Upload Photo</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-32 flex-col gap-2"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="w-8 h-8" />
                <span>Take Photo</span>
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
            
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => setPreview(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <Button
              className="w-full"
              onClick={handleSearch}
              disabled={uploading}
            >
              {uploading ? 'Searching...' : 'Search Similar Items'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VisualSearchButton;
