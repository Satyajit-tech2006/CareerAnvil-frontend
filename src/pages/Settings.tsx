import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  User, Shield, Save, Loader2, Mail, AtSign, KeyRound, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import apiClient from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';

export default function Settings() {
  const queryClient = useQueryClient();

  // --- STATE ---
  const [profileForm, setProfileForm] = useState({ name: '', username: '' });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });
  
  // Forgot Password State
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');

  // 1. Fetch Current User Data
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.USERS.CURRENT_USER);
      return res.data.data;
    },
  });

  // Populate form when user data loads
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || user.fullName || '',
        username: user.username || ''
      });
    }
  }, [user]);

  // 2. Mutation: Update Profile
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: async (data: typeof profileForm) => {
      const res = await apiClient.patch(ENDPOINTS.USERS.UPDATE_PROFILE, data);
      return res.data.data;
    },
    onSuccess: (data) => {
      toast.success("Profile updated successfully");
      queryClient.setQueryData(['currentUser'], data);
      localStorage.setItem('user', JSON.stringify(data));
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  });

  // 3. Mutation: Change Password (Standard)
  const { mutate: changePassword, isPending: isChangingPassword } = useMutation({
    mutationFn: async (data: typeof passwordForm) => {
      await apiClient.post(ENDPOINTS.USERS.CHANGE_PASSWORD, data);
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
      setPasswordForm({ oldPassword: '', newPassword: '' });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to change password");
    }
  });

  // 4. Mutation: Send OTP (Start Reset Flow)
  const { mutate: sendOtp, isPending: isSendingOtp } = useMutation({
    mutationFn: async () => {
      if (!user?.email) throw new Error("User email not found");
      await apiClient.post(ENDPOINTS.USERS.FORGOT_PASSWORD, { email: user.email });
    },
    onSuccess: () => {
      toast.success(`OTP sent to ${user?.email}`);
      setIsResetDialogOpen(true); // Open Dialog
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    }
  });

  // 5. Mutation: Reset Password (Verify OTP)
  const { mutate: resetPasswordWithOtp, isPending: isResetting } = useMutation({
    mutationFn: async () => {
      await apiClient.post(ENDPOINTS.USERS.RESET_PASSWORD, { 
        email: user?.email, 
        otp: resetOtp, 
        newPassword: resetNewPassword 
      });
    },
    onSuccess: () => {
      toast.success("Password has been reset!");
      setIsResetDialogOpen(false);
      setResetOtp('');
      setResetNewPassword('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to reset password");
    }
  });

  // Handlers
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileForm);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
    }
    changePassword(passwordForm);
  };

  if (isLoading) {
    return <div className="flex justify-center pt-20"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8 pb-20">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-8">
        
        {/* --- SECTION 1: PROFILE DETAILS --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Profile Information
            </CardTitle>
            <CardDescription>Update your public display information.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              
              {/* Avatar & Email Display */}
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-primary/10">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-medium text-lg">{user?.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-3.5 h-3.5" /> {user?.email}
                        {user?.subscription === 'premium' && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">Premium</Badge>
                        )}
                    </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      className="pl-9"
                      placeholder="Your name" 
                      value={profileForm.name} 
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Username</Label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      className="pl-9"
                      placeholder="username" 
                      value={profileForm.username} 
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })} 
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* --- SECTION 2: SECURITY --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Security
            </CardTitle>
            <CardDescription>Manage your password and account security.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>Current Password</Label>
                        <button 
                            type="button"
                            onClick={() => sendOtp()}
                            disabled={isSendingOtp}
                            className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                        >
                            {isSendingOtp && <Loader2 className="w-3 h-3 animate-spin" />}
                            I forgot my password
                        </button>
                    </div>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            type="password" 
                            className="pl-9"
                            placeholder="••••••••" 
                            value={passwordForm.oldPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>New Password</Label>
                    <div className="relative">
                        <CheckCircle2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            type="password" 
                            className="pl-9"
                            placeholder="••••••••" 
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <Button type="submit" variant="secondary" disabled={isChangingPassword || !passwordForm.oldPassword || !passwordForm.newPassword}>
                        {isChangingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Update Password"}
                    </Button>
                </div>
            </form>
          </CardContent>
        </Card>

      </div>

      {/* --- DIALOG: RESET PASSWORD VIA OTP --- */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Reset Password</DialogTitle>
                <DialogDescription>
                    We sent a verification code to <strong>{user?.email}</strong>.
                    Enter it below to set a new password.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>OTP Code</Label>
                    <Input 
                        placeholder="123456" 
                        value={resetOtp}
                        onChange={(e) => setResetOtp(e.target.value)}
                        className="text-center tracking-widest font-mono text-lg"
                        maxLength={6}
                    />
                </div>
                <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input 
                        type="password"
                        placeholder="New secure password"
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                    />
                </div>

                <div className="pt-2">
                    <Button 
                        className="w-full" 
                        onClick={() => resetPasswordWithOtp()}
                        disabled={isResetting || resetOtp.length < 6 || resetNewPassword.length < 6}
                    >
                        {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Reset"}
                    </Button>
                </div>
            </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}