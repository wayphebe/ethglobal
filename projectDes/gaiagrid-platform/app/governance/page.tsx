"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Vote, Users, TrendingUp, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

const proposals = [
  {
    id: 1,
    title: "Increase Node Operator Rewards by 15%",
    description:
      "Proposal to increase the base rewards for node operators from 100 GAIA/day to 115 GAIA/day to incentivize more infrastructure providers to join the network.",
    proposer: "0x1234...5678",
    status: "Active",
    votesFor: 12450,
    votesAgainst: 3200,
    totalVotes: 15650,
    quorum: 20000,
    timeLeft: "2 days",
    category: "Economics",
  },
  {
    id: 2,
    title: "Add Support for Arbitrum L2",
    description:
      "Technical proposal to integrate Arbitrum as a supported Layer 2 solution, reducing transaction costs for users and enabling faster settlement times.",
    proposer: "0xabcd...efgh",
    status: "Active",
    votesFor: 18900,
    votesAgainst: 1100,
    totalVotes: 20000,
    quorum: 20000,
    timeLeft: "5 days",
    category: "Technical",
  },
  {
    id: 3,
    title: "Establish Community Grant Program",
    description:
      "Allocate 500,000 GAIA tokens from the treasury to fund community projects, developer tools, and educational initiatives over the next 6 months.",
    proposer: "0x9876...5432",
    status: "Passed",
    votesFor: 25600,
    votesAgainst: 4400,
    totalVotes: 30000,
    quorum: 20000,
    timeLeft: "Ended",
    category: "Treasury",
  },
  {
    id: 4,
    title: "Update Node Verification Standards",
    description:
      "Proposal to implement stricter verification requirements for new nodes, including mandatory IoT sensor integration and quarterly energy audits.",
    proposer: "0x5555...6666",
    status: "Failed",
    votesFor: 8200,
    votesAgainst: 14800,
    totalVotes: 23000,
    quorum: 20000,
    timeLeft: "Ended",
    category: "Governance",
  },
]

const treasuryStats = {
  totalBalance: "2,450,000 GAIA",
  ethBalance: "145.8 ETH",
  monthlyBurn: "50,000 GAIA",
  proposalsActive: 2,
}

export default function GovernancePage() {
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const filteredProposals = proposals.filter((p) => {
    if (filterStatus === "all") return true
    return p.status.toLowerCase() === filterStatus.toLowerCase()
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-blue-600"
      case "Passed":
        return "bg-emerald-600"
      case "Failed":
        return "bg-red-600"
      default:
        return "bg-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <Clock className="h-4 w-4" />
      case "Passed":
        return <CheckCircle2 className="h-4 w-4" />
      case "Failed":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">DAO Governance</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Participate in protocol decisions and shape the future of GaiaGrid
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">Create Proposal</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Proposal</DialogTitle>
                <DialogDescription>Submit a proposal for the community to vote on</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Proposal Title</Label>
                  <Input id="title" placeholder="Enter a clear, concise title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" placeholder="e.g., Technical, Economics, Governance" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about your proposal..."
                    rows={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Voting Duration (days)</Label>
                  <Input id="duration" type="number" placeholder="7" />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700">Submit Proposal</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Treasury Balance</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{treasuryStats.totalBalance}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{treasuryStats.ethBalance}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900">
                  <TrendingUp className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Proposals</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{treasuryStats.proposalsActive}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Vote now</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Vote className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Voters</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">3,421</p>
                  <p className="mt-1 text-xs text-emerald-600">+12% this month</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
                  <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Your Voting Power</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">1,250</p>
                  <p className="mt-1 text-xs text-muted-foreground">GAIA tokens</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                  <Vote className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Proposals Section */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setFilterStatus("all")}>
              All Proposals
            </TabsTrigger>
            <TabsTrigger value="active" onClick={() => setFilterStatus("active")}>
              Active
            </TabsTrigger>
            <TabsTrigger value="passed" onClick={() => setFilterStatus("passed")}>
              Passed
            </TabsTrigger>
            <TabsTrigger value="failed" onClick={() => setFilterStatus("failed")}>
              Failed
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filterStatus} className="mt-6 space-y-6">
            {filteredProposals.map((proposal) => {
              const votePercentage = (proposal.votesFor / proposal.totalVotes) * 100
              const quorumPercentage = (proposal.totalVotes / proposal.quorum) * 100

              return (
                <Card key={proposal.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-xl">{proposal.title}</CardTitle>
                          <Badge className={getStatusColor(proposal.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(proposal.status)}
                              {proposal.status}
                            </span>
                          </Badge>
                          <Badge variant="outline">{proposal.category}</Badge>
                        </div>
                        <CardDescription className="mt-2">{proposal.description}</CardDescription>
                        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Proposed by {proposal.proposer}</span>
                          <span>•</span>
                          <span>{proposal.timeLeft}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Voting Results */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">For</span>
                        <span className="font-medium text-emerald-600">
                          {proposal.votesFor.toLocaleString()} ({votePercentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={votePercentage} className="h-2" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Against</span>
                        <span className="font-medium text-red-600">
                          {proposal.votesAgainst.toLocaleString()} ({(100 - votePercentage).toFixed(1)}%)
                        </span>
                      </div>
                    </div>

                    {/* Quorum Progress */}
                    <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Quorum Progress</span>
                        <span className="font-medium">
                          {proposal.totalVotes.toLocaleString()} / {proposal.quorum.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={quorumPercentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {quorumPercentage >= 100
                          ? "Quorum reached"
                          : `${(100 - quorumPercentage).toFixed(1)}% more votes needed`}
                      </p>
                    </div>

                    {/* Voting Buttons */}
                    {proposal.status === "Active" && (
                      <div className="flex gap-3 pt-2">
                        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">Vote For</Button>
                        <Button variant="outline" className="flex-1 bg-transparent">
                          Vote Against
                        </Button>
                        <Button variant="ghost">View Details</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>
        </Tabs>

        {/* Governance Info */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How to Vote</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>1. Hold GAIA tokens in your connected wallet</p>
              <p>2. Review active proposals and their details</p>
              <p>3. Cast your vote for or against each proposal</p>
              <p>4. Your voting power equals your GAIA token balance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Proposal Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Minimum 10,000 GAIA tokens to create a proposal</p>
              <p>20,000 votes required to reach quorum</p>
              <p>Simple majority (50%+1) needed to pass</p>
              <p>Voting period: 7 days by default</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Treasury Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>All treasury spending requires DAO approval</p>
              <p>Monthly burn rate: {treasuryStats.monthlyBurn}</p>
              <p>Funds allocated through governance proposals</p>
              <p>Transparent on-chain accounting</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
