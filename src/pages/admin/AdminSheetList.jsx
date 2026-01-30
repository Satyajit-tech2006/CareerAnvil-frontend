import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, MoreHorizontal, Pencil, Trash2, Layers, Loader2, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

import apiClient from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';

export default function AdminSheetList() {
  const navigate = useNavigate();
  
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  // FIX 1: Added 'type' default value
  const [newSheet, setNewSheet] = useState({
    title: '',
    description: '',
    slug: '',
    type: 'free' 
  });

  const fetchSheets = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(ENDPOINTS.SHEETS.GET_ALL);
      const data = response.data.data.sheets || response.data.data || [];
      setSheets(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load sheets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheets();
  }, []);

  const handleCreate = async () => {
    // FIX 2: Validate type
    if (!newSheet.title || !newSheet.slug || !newSheet.type) {
      toast.error("Title, Slug, and Type are required");
      return;
    }

    try {
      await apiClient.post(ENDPOINTS.SHEETS.CREATE, newSheet);
      toast.success("Sheet created successfully");
      setIsCreateOpen(false);
      setNewSheet({ title: '', description: '', slug: '', type: 'free' });
      fetchSheets();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create sheet");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure? This will delete all sections and items within this sheet.")) return;
    try {
      await apiClient.delete(ENDPOINTS.SHEETS.DELETE(id));
      toast.success("Sheet deleted");
      setSheets(prev => prev.filter(s => s._id !== id));
    } catch (error) {
      toast.error("Failed to delete sheet");
    }
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''); 
    setNewSheet({ ...newSheet, title, slug });
  };

  const filteredSheets = sheets.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Sheets</h1>
          <p className="text-muted-foreground">Create and organize learning roadmaps.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Create New Sheet
        </Button>
      </div>

      <div className="flex items-center py-4 bg-card rounded-lg border px-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search sheets..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Total Items</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="animate-spin w-4 h-4 inline" /> Loading...</TableCell></TableRow>
            ) : filteredSheets.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No sheets found.</TableCell></TableRow>
            ) : (
              filteredSheets.map((sheet) => (
                <TableRow key={sheet._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-primary" /> {sheet.title}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{sheet.slug}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={sheet.type === 'premium' ? 'default' : 'secondary'}>{sheet.type}</Badge>
                  </TableCell>
                  <TableCell><Badge variant="outline">{sheet.totalItems || 0}</Badge></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate(`/admin/sheets/${sheet._id}/builder`)}>
                          <Pencil className="mr-2 h-4 w-4" /> Open Builder
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/sheets/${sheet.slug}`, '_blank')}>
                          <ExternalLink className="mr-2 h-4 w-4" /> View as User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(sheet._id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Sheet</DialogTitle>
            <DialogDescription>Start a new learning path.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Sheet Title</Label>
              <Input id="title" value={newSheet.title} onChange={handleTitleChange} placeholder="e.g. DSA A2Z" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={newSheet.slug} onChange={(e) => setNewSheet({...newSheet, slug: e.target.value})} placeholder="e.g. dsa-a2z" />
            </div>
            {/* FIX 3: Added Type Selector */}
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={newSheet.type} onValueChange={(v) => setNewSheet({...newSheet, type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={newSheet.description} onChange={(e) => setNewSheet({...newSheet, description: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate}>Create Sheet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}