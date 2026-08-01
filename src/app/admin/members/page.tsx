// src/app/admin/members/page.tsx
"use client"

import * as React from "react"
import { 
  Plus, 
  Search, 
  Edit2, 
  UserCheck, 
  UserX, 
  Loader2, 
  Filter, 
  FileSpreadsheet, 
  Phone,
  User,
  ShieldCheck,
  Percent,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/toast"

interface Member {
  id: string
  name: string
  phone: string
  email: string | null
  membershipId: string | null
  referralCode: string
  membershipStatus: string
  createdAt: string
  _count?: {
    referrals: number
  }
}

export default function AdminMembersPage() {
  const { toast } = useToast()
  
  // Data State
  const [members, setMembers] = React.useState<Member[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [selectedMember, setSelectedMember] = React.useState<Member | null>(null)
  
  // Form Fields
  const [name, setName] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [membershipId, setMembershipId] = React.useState("")
  const [actionLoading, setActionLoading] = React.useState(false)

  // Fetch Members List
  const fetchMembers = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/members') // We will create this helper list API next
      if (response.ok) {
        const data = await response.json()
        setMembers(data.members || [])
      } else {
        toast({
          type: "error",
          message: "Failed to load members list.",
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        type: "error",
        message: "An error occurred fetching members.",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  // Create member submit handler
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) {
      toast({
        type: "error",
        message: "Name and Phone Number are required.",
      })
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch('/api/member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, membershipId }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          type: "success",
          message: `Member created! Code: ${data.member.referralCode}`,
        })
        setIsCreateOpen(false)
        resetForm()
        fetchMembers()
      } else {
        toast({
          type: "error",
          message: data.error || "Failed to create member.",
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        type: "error",
        message: "Network error occurred.",
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Edit member submit handler
  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMember) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/members/${selectedMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, membershipId }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          type: "success",
          message: "Member details updated successfully.",
        })
        setIsEditOpen(false)
        resetForm()
        fetchMembers()
      } else {
        toast({
          type: "error",
          message: data.error || "Failed to update member.",
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        type: "error",
        message: "Network error occurred.",
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Toggle member active/inactive status
  const handleToggleStatus = async (member: Member) => {
    const newStatus = member.membershipStatus === 'active' ? 'inactive' : 'active'
    try {
      const response = await fetch(`/api/admin/members/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membershipStatus: newStatus }),
      })

      if (response.ok) {
        toast({
          type: "success",
          message: `Member status updated to ${newStatus}.`,
        })
        fetchMembers()
      } else {
        toast({
          type: "error",
          message: "Failed to toggle membership status.",
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        type: "error",
        message: "Network error occurred.",
      })
    }
  }

  // Export to CSV
  const handleExportCSV = () => {
    if (members.length === 0) return
    
    const headers = ["Name", "Phone", "Email", "Membership ID", "Referral Code", "Status", "Created At"]
    const rows = filteredMembers.map(m => [
      m.name,
      m.phone,
      m.email || "",
      m.membershipId || "",
      m.referralCode,
      m.membershipStatus,
      new Date(m.createdAt).toLocaleDateString()
    ])

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `ZoroGym_Members_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      type: "success",
      message: "Exported members list successfully.",
    })
  }

  const openEditModal = (member: Member) => {
    setSelectedMember(member)
    setName(member.name)
    setPhone(member.phone)
    setEmail(member.email || "")
    setMembershipId(member.membershipId || "")
    setIsEditOpen(true)
  }

  const resetForm = () => {
    setSelectedMember(null)
    setName("")
    setPhone("")
    setEmail("")
    setMembershipId("")
    setValidationError("")
  }

  const [validationError, setValidationError] = React.useState("")

  // Filtering Logic
  const filteredMembers = members.filter((member) => {
    const matchesSearch = 
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.phone.includes(search) ||
      member.referralCode.toLowerCase().includes(search.toLowerCase()) ||
      (member.membershipId && member.membershipId.toLowerCase().includes(search.toLowerCase()))
    
    const matchesStatus = 
      statusFilter === "all" || member.membershipStatus === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Top Header Grid */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Members Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Register and manage active Zoro Gym members and track code usage.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={handleExportCSV} variant="outline" className="rounded-xl shrink-0 w-full sm:w-auto">
            <FileSpreadsheet className="h-4.5 w-4.5 mr-2" />
            CSV Export
          </Button>
          <Button onClick={() => { resetForm(); setIsCreateOpen(true) }} className="rounded-xl shrink-0 w-full sm:w-auto">
            <Plus className="h-4.5 w-4.5 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Total Members</p>
            <p className="text-2xl font-extrabold mt-1">{members.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Active Members</p>
            <p className="text-2xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">
              {members.filter(m => m.membershipStatus === 'active').length}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Inactive Members</p>
            <p className="text-2xl font-extrabold mt-1 text-rose-600 dark:text-rose-400">
              {members.filter(m => m.membershipStatus === 'inactive').length}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="pt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Average Codes Generated</p>
            <p className="text-2xl font-extrabold mt-1">1 per member</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="rounded-2xl">
        <CardContent className="pt-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 opacity-50" />
            <Input
              placeholder="Search by name, phone, code or member ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          <div className="flex gap-2 min-w-[200px]">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl"
            >
              <option value="all">All Members</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Members Main List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading members directory...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <Card className="rounded-2xl p-12 text-center text-muted-foreground">
          <User className="h-12 w-12 mx-auto opacity-35 mb-3" />
          <p className="font-bold text-lg text-foreground">No members found</p>
          <p className="text-sm mt-1">Try refining your search terms or create a new member above.</p>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Phone / Email</TableHead>
                  <TableHead>Membership ID</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <p className="font-bold text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Registered {new Date(member.createdAt).toLocaleDateString()}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{member.phone}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {member.email || "-"}
                      </p>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold">
                      {member.membershipId || "N/A"}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/55 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/30">
                        {member.referralCode}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        member.membershipStatus === 'active' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {member.membershipStatus === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button 
                          onClick={() => openEditModal(member)} 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Edit Member"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleToggleStatus(member)}
                          variant="ghost" 
                          size="icon" 
                          className={`h-8 w-8 ${member.membershipStatus === 'active' ? 'text-rose-600 hover:text-rose-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                          title={member.membershipStatus === 'active' ? 'Deactivate Member' : 'Activate Member'}
                        >
                          {member.membershipStatus === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card List View */}
          <div className="grid gap-4 md:hidden">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="rounded-2xl p-5 border border-border">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-bold text-base leading-none text-foreground">{member.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase">
                      ID: {member.membershipId || "N/A"}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    member.membershipStatus === 'active' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {member.membershipStatus === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="mt-4 space-y-2 border-t border-b border-border/50 py-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Phone:</span>
                    <span className="font-semibold text-foreground">{member.phone}</span>
                  </div>
                  {member.email && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">Email:</span>
                      <span className="font-semibold text-foreground truncate max-w-[180px]">{member.email}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Referral Code:</span>
                    <span className="inline-flex px-2 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/30">
                      {member.referralCode}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 w-full">
                  <Button 
                    onClick={() => openEditModal(member)} 
                    variant="outline" 
                    className="flex-1 rounded-xl h-10 text-xs"
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                    Edit Details
                  </Button>
                  <Button 
                    onClick={() => handleToggleStatus(member)}
                    variant="outline"
                    className={`flex-1 rounded-xl h-10 text-xs border-none ${
                      member.membershipStatus === 'active' 
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-300' 
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300'
                    }`}
                  >
                    {member.membershipStatus === 'active' ? (
                      <>
                        <UserX className="h-3.5 w-3.5 mr-1.5" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                        Activate
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Modal: Create Member */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Zoro Member</DialogTitle>
            <DialogDescription>
              Submit member details. The system will automatically generate a permanent, unique referral code.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateMember} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label htmlFor="create-name" className="text-xs font-bold block">
                Member Full Name *
              </label>
              <Input
                id="create-name"
                type="text"
                placeholder="e.g. Rahul Patil"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={actionLoading}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="create-phone" className="text-xs font-bold block">
                Phone Number *
              </label>
              <Input
                id="create-phone"
                type="tel"
                placeholder="e.g. 9823456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={actionLoading}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="create-email" className="text-xs font-bold block">
                Email Address (Optional)
              </label>
              <Input
                id="create-email"
                type="email"
                placeholder="e.g. rahul.p@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={actionLoading}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="create-memid" className="text-xs font-bold block">
                Membership ID / Card Number (Optional)
              </label>
              <Input
                id="create-memid"
                type="text"
                placeholder="e.g. MEM2026-99"
                value={membershipId}
                onChange={(e) => setMembershipId(e.target.value)}
                disabled={actionLoading}
              />
            </div>
            <DialogFooter className="mt-6 flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateOpen(false)}
                disabled={actionLoading}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 rounded-xl" disabled={actionLoading}>
                {actionLoading ? "Saving..." : "Create Member"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Edit Member */}
      <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if(!open) resetForm(); }}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Member Details</DialogTitle>
            <DialogDescription>
              Modify name, phone, email, or membership ID. The referral code is permanent.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditMember} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold block">Referral Code (ReadOnly)</label>
              <Input
                type="text"
                value={selectedMember?.referralCode || ""}
                disabled
                className="bg-muted opacity-80"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="edit-name" className="text-xs font-bold block">
                Member Full Name *
              </label>
              <Input
                id="edit-name"
                type="text"
                placeholder="e.g. Rahul Patil"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={actionLoading}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="edit-phone" className="text-xs font-bold block">
                Phone Number *
              </label>
              <Input
                id="edit-phone"
                type="tel"
                placeholder="e.g. 9823456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={actionLoading}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="edit-email" className="text-xs font-bold block">
                Email Address
              </label>
              <Input
                id="edit-email"
                type="email"
                placeholder="e.g. rahul.p@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={actionLoading}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="edit-memid" className="text-xs font-bold block">
                Membership ID
              </label>
              <Input
                id="edit-memid"
                type="text"
                placeholder="e.g. MEM2026-99"
                value={membershipId}
                onChange={(e) => setMembershipId(e.target.value)}
                disabled={actionLoading}
              />
            </div>
            <DialogFooter className="mt-6 flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditOpen(false)}
                disabled={actionLoading}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 rounded-xl" disabled={actionLoading}>
                {actionLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
