import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  Loader2, 
  FileText,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// API
import apiClient from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';

export default function NoteBuilder() {
  const { itemId } = useParams(); // URL: /admin/notes/:itemId
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Note State
  const [note, setNote] = useState({
    title: '',
    content: '' // HTML or Markdown string
  });

  // --- FETCH EXISTING NOTE (If any) ---
  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        // Try to fetch existing note
        const response = await apiClient.get(ENDPOINTS.NOTES.GET(itemId));
        if (response.data.data) {
            setNote({
                title: response.data.data.title,
                content: response.data.data.content
            });
        }
      } catch (error) {
        // 404 is fine (means new note), other errors are bad
        if (error.response?.status !== 404) {
            toast.error("Failed to load note data");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [itemId]);

  // --- SAVE NOTE ---
  const handleSave = async () => {
    if (!note.content) {
        toast.error("Content cannot be empty");
        return;
    }

    try {
      setSaving(true);
      await apiClient.post(ENDPOINTS.NOTES.SAVE, {
        itemId,
        title: note.title,
        content: note.content
      });
      toast.success("Note saved successfully!");
      // Optional: Navigate back or stay here
    } catch (error) {
      console.error(error);
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container max-w-4xl py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Note Editor</h1>
              <p className="text-xs text-muted-foreground">ID: {itemId}</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Note
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="container max-w-4xl py-8">
        <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0 space-y-6">
                
                <div className="space-y-2">
                    <Label>Note Title</Label>
                    <Input 
                        value={note.title} 
                        onChange={(e) => setNote({...note, title: e.target.value})}
                        placeholder="e.g. Approach for Two Sum" 
                        className="text-lg font-medium"
                    />
                </div>

                <Tabs defaultValue="edit" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="edit" className="gap-2"><FileText className="w-4 h-4"/> Edit Markdown/HTML</TabsTrigger>
                        <TabsTrigger value="preview" className="gap-2"><Eye className="w-4 h-4"/> Preview</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="edit">
                        <Textarea 
                            value={note.content} 
                            onChange={(e) => setNote({...note, content: e.target.value})}
                            placeholder="Write your explanation here... (Supports basic HTML tags like <h1>, <p>, <pre>)" 
                            className="min-h-[500px] font-mono text-sm leading-relaxed p-6"
                        />
                    </TabsContent>
                    
                    <TabsContent value="preview">
                        <div className="min-h-[500px] border rounded-md p-8 prose dark:prose-invert max-w-none bg-card">
                            {note.content ? (
                                <div dangerouslySetInnerHTML={{ __html: note.content }} />
                            ) : (
                                <p className="text-muted-foreground text-center italic">Nothing to preview yet.</p>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

            </CardContent>
        </Card>
      </div>
    </div>
  );
}