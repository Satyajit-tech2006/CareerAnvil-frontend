import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Loader2, 
  MoreVertical, 
  Video, 
  FileCode,
  ExternalLink
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [itemForm, setItemForm] = useState({
    title: '',
    link: '',
    difficulty: 'Medium',
    type: 'problem' // 'problem' or 'video'
  });

  // --- DATA FETCHING ---
  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Fetch Sheet
      // Note: We might need a generic "Get Sheet by ID" endpoint if slug isn't handy, 
      // but usually Admin routes use IDs. Assuming GET /sheets/:id works or filtering.
      // For now, let's assume we can fetch by ID directly or handle this logic.
      // If your API only supports slug, we'd need to adjust. I'll assume ID support for Admin.
      // If not, we fetch all and find, or fetch by slug if 'id' param is actually a slug.
      
      // Temporary fix: If your API strictly uses slugs for public, Admin might need a specific route.
      // Let's assume we use the "Get All" and find it, or a specific endpoint.
      // Ideally: const sheetRes = await apiClient.get(`/sheets/${id}`);
      
      // Let's assume fetching details by ID is possible or use the slug if passed.
      // For this example, I'll simulate fetching the sheet details.
      const sheetRes = await apiClient.get(ENDPOINTS.SHEETS.GET_ALL); 
      const foundSheet = sheetRes.data.data.sheets.find(s => s._id === id);
      
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
        sheet: id,
        order: sections.length + 1 // Simple ordering
      });
      toast.success("Section added");
      setSectionTitle('');
      setIsSectionModalOpen(false);
      fetchData(); // Refresh to get the new ID
    } catch (error) {
      toast.error("Failed to add section");
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm("Delete this section and all its items?")) return;
    try {
      await apiClient.delete(ENDPOINTS.SECTIONS.DELETE(sectionId));
      toast.success("Section deleted");
      // Optimistic update
      setSections(prev => prev.filter(s => s._id !== sectionId));
    } catch (error) {
      toast.error("Failed to delete section");
    }
  };

  // --- ACTIONS: ITEMS ---
  const openAddItemModal = (sectionId) => {
    setActiveSectionId(sectionId);
    setItemForm({ title: '', link: '', difficulty: 'Medium', type: 'problem' });
    setIsItemModalOpen(true);
  };

  const handleCreateItem = async () => {
    if (!itemForm.title || !itemForm.link) return;
    try {
      await apiClient.post(ENDPOINTS.ITEMS.CREATE, {
        ...itemForm,
        section: activeSectionId,
        sheet: id
      });
      toast.success("Item added");
      setIsItemModalOpen(false);
      fetchData(); // Refresh
    } catch (error) {
      toast.error("Failed to add item");
    }
  };

  const handleDeleteItem = async (itemId, sectionId) => {
    if (!confirm("Remove this item?")) return;
    try {
      await apiClient.delete(ENDPOINTS.ITEMS.DELETE(itemId));
      toast.success("Item removed");
      // Optimistic update
      setItemsMap(prev => ({
        ...prev,
        [sectionId]: prev[sectionId].filter(i => i._id !== itemId)
      }));
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* --- HEADER --- */}
      <div className="border-b border-border bg-card">
        <div className="container max-w-5xl py-6">
          <Button variant="ghost" size="sm" className="mb-4 pl-0 hover:pl-2 transition-all" onClick={() => navigate('/admin/sheets')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sheets
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{sheet?.title}</h1>
              <p className="text-muted-foreground mt-1">{sheet?.description}</p>
            </div>
            <Badge variant="outline" className="text-sm px-3 py-1">
              {sections.length} Sections
            </Badge>
          </div>
        </div>
      </div>

      {/* --- BUILDER AREA --- */}
      <div className="container max-w-5xl py-8 space-y-8">
        
        {/* Sections List */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <Card key={section._id} className="border-border/60 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 py-3 px-4 flex flex-row items-center justify-between border-b border-border/50">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {index + 1}
                  </span>
                  <CardTitle className="text-lg font-semibold">{section.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => openAddItemModal(section._id)}
                    className="h-8 text-xs bg-background"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Item
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteSection(section._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {(itemsMap[section._id] || []).length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground border-dashed">
                    No items in this section yet.
                  </div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {(itemsMap[section._id] || []).map((item) => (
                      <div key={item._id} className="flex items-center justify-between p-3 px-4 hover:bg-muted/20 group transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                          {item.type === 'video' ? <Video className="w-4 h-4 text-blue-500" /> : <FileCode className="w-4 h-4 text-orange-500" />}
                          <div className="min-w-0">
                            <p className="font-medium truncate text-sm text-foreground">{item.title}</p>
                            <a href={item.link} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:underline flex items-center gap-1 truncate">
                              {item.link} <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                           <Badge variant="secondary" className="text-[10px] h-5">{item.difficulty}</Badge>
                           <Button 
                             size="icon" 
                             variant="ghost" 
                             className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                             onClick={() => handleDeleteItem(item._id, section._id)}
                           >
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

        {/* Global Add Section Button */}
        <Button 
          size="lg" 
          variant="outline" 
          className="w-full h-16 border-dashed border-2 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 gap-2"
          onClick={() => setIsSectionModalOpen(true)}
        >
          <Plus className="w-6 h-6" /> Add New Section
        </Button>
      </div>

      {/* --- MODAL: CREATE SECTION --- */}
      <Dialog open={isSectionModalOpen} onOpenChange={setIsSectionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Section Title</Label>
              <Input 
                value={sectionTitle} 
                onChange={(e) => setSectionTitle(e.target.value)} 
                placeholder="e.g. Arrays & Hashing" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateSection}>Create Section</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL: CREATE ITEM --- */}
      <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Item to Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Problem / Video Title</Label>
              <Input 
                value={itemForm.title} 
                onChange={(e) => setItemForm({...itemForm, title: e.target.value})} 
                placeholder="e.g. Two Sum" 
              />
            </div>
            <div className="space-y-2">
              <Label>External Link</Label>
              <Input 
                value={itemForm.link} 
                onChange={(e) => setItemForm({...itemForm, link: e.target.value})} 
                placeholder="https://leetcode.com/..." 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select 
                  value={itemForm.difficulty} 
                  onValueChange={(v) => setItemForm({...itemForm, difficulty: v})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select 
                  value={itemForm.type} 
                  onValueChange={(v) => setItemForm({...itemForm, type: v})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="problem">Problem</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}