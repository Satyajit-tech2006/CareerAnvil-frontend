import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import apiClient from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';

export default function NoteViewer() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(ENDPOINTS.NOTES.GET(itemId));
        setNote(response.data.data);
      } catch (err) {
        console.error(err);
        setError("Note not found or hasn't been written yet.");
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [itemId]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

  if (error) return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <h2 className="text-xl font-semibold text-destructive">{error}</h2>
        <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Sticky Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container max-w-4xl py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                {note.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container max-w-4xl py-8">
        <Card>
            <CardContent className="p-8 prose dark:prose-invert max-w-none">
                {/* Render the HTML content safely */}
                <div dangerouslySetInnerHTML={{ __html: note.content }} />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}