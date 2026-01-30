import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Loader2, 
  Video, 
  FileCode,
  ExternalLink,
  GripVertical,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// API
import apiClient from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';

export default function AdminSheetBuilder() {
  const { id } = useParams(); // Sheet ID
  const navigate = useNavigate();

  // --- STATE ---
  const [sheet, setSheet] = useState(null);
  const [sections, setSections] = useState([]);
  const [itemsMap, setItemsMap] = useState({}); // { sectionId: [items] }
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  
  // Active selection for adding items
  const [activeSectionId, setActiveSectionId] = useState(null);

  // Form Data
  const [sectionTitle, setSectionTitle] = useState('');
  
  // Item Form
  const [itemForm, setItemForm] = useState({
    title: '',
    externalLink: '', 
    youtubeLink: '', 
    articleLink: '', 
    difficulty: 'medium', 
    type: 'problem' 
  });

  // --- DATA FETCHING ---
  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Sheet Details
      const sheetRes = await apiClient.get(ENDPOINTS.SHEETS.GET_ALL); 
      const foundSheet = sheetRes.data.data.sheets 
        ? sheetRes.data.data.sheets.find(s => s._id === id) 
        : sheetRes.data.data.find(s => s._id === id);
      
      if (!foundSheet) throw new Error("Sheet not found");
      setSheet(foundSheet);

      // 2. Fetch Sections
      const sectionsRes = await apiClient.get(ENDPOINTS.SECTIONS.GET_BY_SHEET(id));
      const sectionsData = sectionsRes.data.data || [];
      setSections(sectionsData);

      // 3. Fetch Items for all sections
      const itemsPromises = sectionsData.map(section => 
        apiClient.get(ENDPOINTS.ITEMS.GET_BY_SECTION(section._id))
          .then(res => ({ sectionId: section._id, items: res.data.data }))
      );

      const itemsResults = await Promise.all(itemsPromises);
      const newItemsMap = {};
      itemsResults.forEach(res => {
        newItemsMap[res.sectionId] = res.items;
      });
      setItemsMap(newItemsMap);

    } catch (error) {
      console.error(error);
      toast.error("Failed to load sheet data");
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS: SECTIONS ---
  const handleCreateSection = async () => {
    if (!sectionTitle.trim()) return;
    try {
      await apiClient.post(ENDPOINTS.SECTIONS.CREATE, {
        title: sectionTitle,
        sheetId: id,
        order: sections.length + 1 
      });
      toast.success("Section added");
      setSectionTitle('');
      setIsSectionModalOpen(false);
      fetchData(); 
    } catch (error) {
      console.error(error);
      toast.error("Failed to add section");
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm("Delete this section and all its items?")) return;
    try {
      await apiClient.delete(ENDPOINTS.SECTIONS.DELETE(sectionId));
      toast.success("Section deleted");
      setSections(prev => prev.filter(s => s._id !== sectionId));
      const newMap = { ...itemsMap };
      delete newMap[sectionId];
      setItemsMap(newMap);
    } catch (error) {
      toast.error("Failed to delete section");
    }
  };

  // --- ACTIONS: ITEMS ---
  const openAddItemModal = (sectionId) => {
    setActiveSectionId(sectionId);
    setItemForm({ 
        title: '', 
        externalLink: '', 
        youtubeLink: '', 
        articleLink: '', 
        difficulty: 'medium', 
        type: 'problem' 
    });
    setIsItemModalOpen(true);
  };

  const handleCreateItem = async () => {
    // UPDATED: Only Title is necessary now
    if (!itemForm.title) {
        toast.error("Title is required");
        return;
    }

    try {
      const currentItems = itemsMap[activeSectionId] || [];
      const newOrder = currentItems.length + 1;

      await apiClient.post(ENDPOINTS.ITEMS.CREATE, {
        sheetId: id,
        sectionId: activeSectionId,
        title: itemForm.title,
        type: itemForm.type,
        difficulty: itemForm.difficulty,
        externalLink: itemForm.externalLink,
        youtubeLink: itemForm.youtubeLink,
        articleLink: itemForm.articleLink,
        order: newOrder,
        tags: [] 
      });

      toast.success("Item added");
      setIsItemModalOpen(false);
      fetchData(); 
    } catch (error) {
      console.error(error);
      toast.error("Failed to add item");
    }
  };

  const handleDeleteItem = async (itemId, sectionId) => {
    if (!confirm("Remove this item?")) return;
    try {
      await apiClient.delete(ENDPOINTS.ITEMS.DELETE(itemId));
      toast.success("Item removed");
      
      setItemsMap(prev => ({
        ...prev,
        [sectionId]: prev[sectionId].filter(i => i._id !== itemId)
      }));
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* --- HEADER --- */}
      <div className="border-b border-border bg-card sticky top-0 z-10 shadow-sm">
        <div className="container max-w-5xl py-4">
          <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground hover:text-foreground" onClick={() => navigate('/admin/sheets')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sheets
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{sheet?.title}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Builder Mode</p>
            </div>
            <div className="flex items-center gap-3">
                <Badge variant="secondary">{sections.length} Sections</Badge>
                <Badge variant="outline">{Object.values(itemsMap).flat().length} Total Items</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* --- BUILDER AREA --- */}
      <div className="container max-w-5xl py-8 space-y-8">
        
        {/* Sections List */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <Card key={section._id} className="border-border/60 shadow-sm overflow-hidden group/card">
              <CardHeader className="bg-muted/30 py-3 px-4 flex flex-row items-center justify-between border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-background border text-xs font-medium text-muted-foreground">
                    {index + 1}
                  </span>
                  <CardTitle className="text-base font-semibold">{section.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover/card:opacity-100 transition-opacity">
                  <Button size="sm" variant="outline" onClick={() => openAddItemModal(section._id)} className="h-8 text-xs bg-background">
                    <Plus className="w-3 h-3 mr-1" /> Add Item
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteSection(section._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-0 bg-card">
                {(itemsMap[section._id] || []).length === 0 ? (
                  <div className="py-8 flex flex-col items-center justify-center text-muted-foreground border-dashed">
                    <p className="text-sm mb-2">This section is empty</p>
                    <Button variant="ghost" size="sm" onClick={() => openAddItemModal(section._id)} className="text-primary">Add your first problem</Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {(itemsMap[section._id] || []).map((item) => (
                      <div key={item._id} className="flex items-center justify-between p-3 px-4 hover:bg-muted/40 group/item transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                          {item.type === 'video' ? (
                              <div className="p-1.5 bg-blue-500/10 rounded-md"><Video className="w-4 h-4 text-blue-500" /></div>
                          ) : (
                              <div className="p-1.5 bg-orange-500/10 rounded-md"><FileCode className="w-4 h-4 text-orange-500" /></div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium truncate text-sm text-foreground">{item.title}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <a href={item.externalLink} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1 truncate max-w-[200px]">
                                  {item.externalLink} <ExternalLink className="w-3 h-3" />
                                </a>
                                {(item.youtubeLink || item.articleLink) && <span className="text-[10px] border px-1 rounded bg-muted">Has Resources</span>}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                           <Button 
                             size="sm" 
                             variant="outline" 
                             className={`h-7 text-xs gap-1 border-dashed ${item.hasNote ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-muted-foreground'}`}
                             onClick={() => navigate(`/admin/notes/${item._id}`)}
                           >
                             <FileText className="w-3 h-3" /> 
                             {item.hasNote ? 'Edit Note' : 'Add Note'}
                           </Button>

                           <Badge variant="outline" className={`text-[10px] h-5 capitalize ${
                               item.difficulty === 'easy' ? 'text-green-600 border-green-200 bg-green-50' : 
                               item.difficulty === 'medium' ? 'text-yellow-600 border-yellow-200 bg-yellow-50' : 
                               'text-red-600 border-red-200 bg-red-50'
                           }`}>
                             {item.difficulty}
                           </Badge>
                           
                           <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover/item:opacity-100 transition-opacity text-muted-foreground hover:text-destructive" onClick={() => handleDeleteItem(item._id, section._id)}>
                             <Trash2 className="w-3.5 h-3.5" />
                           </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Button size="lg" variant="outline" className="w-full h-20 border-dashed border-2 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 gap-2 text-lg font-medium" onClick={() => setIsSectionModalOpen(true)}>
          <Plus className="w-6 h-6" /> Add New Section
        </Button>
      </div>

      {/* --- MODAL: CREATE SECTION --- */}
      <Dialog open={isSectionModalOpen} onOpenChange={setIsSectionModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Section</DialogTitle></DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label>Section Title</Label>
              <Input value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} placeholder="e.g. Arrays & Hashing" autoFocus />
            </div>
          </div>
          <DialogFooter><Button onClick={handleCreateSection}>Create Section</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL: CREATE ITEM --- */}
      <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>Add Item</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={itemForm.title} onChange={(e) => setItemForm({...itemForm, title: e.target.value})} placeholder="e.g. Two Sum" />
            </div>
            
            <div className="space-y-2">
              <Label>Problem Link (Optional)</Label>
              <Input value={itemForm.externalLink} onChange={(e) => setItemForm({...itemForm, externalLink: e.target.value})} placeholder="https://leetcode.com/problems/..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>YouTube Solution (Opt)</Label>
                 <Input value={itemForm.youtubeLink} onChange={(e) => setItemForm({...itemForm, youtubeLink: e.target.value})} placeholder="https://youtu.be/..." />
               </div>
               <div className="space-y-2">
                 <Label>External Article (Opt)</Label>
                 <Input value={itemForm.articleLink} onChange={(e) => setItemForm({...itemForm, articleLink: e.target.value})} placeholder="https://..." />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={itemForm.difficulty} onValueChange={(v) => setItemForm({...itemForm, difficulty: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={itemForm.type} onValueChange={(v) => setItemForm({...itemForm, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="problem">Problem</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter><Button onClick={handleCreateItem}>Add Item</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}