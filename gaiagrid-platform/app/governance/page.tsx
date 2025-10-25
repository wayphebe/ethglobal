"use client"

import { useState, useEffect } from "react"
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
import { Vote, Users, TrendingUp, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw, Info } from "lucide-react"
import { useWeb3 } from "@/lib/web3-context"
import { useGovernance, VoteType, ProposalState } from "@/lib/contracts/hooks/useGovernance"
import { TransactionManager, TransactionType } from "@/lib/contracts/transactions"
import { VotingPowerCard } from "@/components/voting-power-card"
import { ProposalCard } from "@/components/proposal-card"
import { ProposalCreationDialog } from "@/components/proposal-creation-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Mock data for demonstration (will be replaced by real data)
const mockTreasuryStats = {
  totalBalance: "50 GAIA",
  ethBalance: "0.003 ETH",
  monthlyBurn: "5 GAIA",
  proposalsActive: 2,
}

export default function GovernancePage() {
  const { account } = useWeb3()
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Governance hook
  const {
    proposals,
    activeProposals,
    userVotes,
    stats,
    isLoading,
    error,
    loadProposals,
    loadUserVotes,
    loadStats,
    createProposal,
    castVote,
    executeProposal,
    formatProposalState,
    VoteType,
    ProposalState
  } = useGovernance()

  // Transaction manager
  const [transactionManager] = useState(() => new TransactionManager())

  // Filter proposals based on status
  const filteredProposals = proposals.filter((proposal) => {
    if (filterStatus === "all") return true
    
    const state = formatProposalState(proposal.state)
    return state.toLowerCase() === filterStatus.toLowerCase()
  })

  // Load data on mount
  useEffect(() => {
    loadProposals()
    loadStats()
  }, [loadProposals, loadStats])

  // Load user votes when proposals are loaded
  useEffect(() => {
    if (proposals.length > 0 && account) {
      loadUserVotes()
    }
  }, [proposals, account, loadUserVotes])

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        loadProposals(),
        loadStats(),
        account ? loadUserVotes() : Promise.resolve()
      ])
    } finally {
      setIsRefreshing(false)
    }
  }

  // Handle vote
  const handleVote = async (proposalId: string, support: VoteType) => {
    if (!account) return

    try {
      await castVote(proposalId, support, transactionManager)
      // Refresh data after voting
      await loadProposals()
      await loadUserVotes()
    } catch (error) {
      console.error('Vote failed:', error)
    }
  }

  // Handle execute
  const handleExecute = async (proposalId: string) => {
    if (!account) return

    try {
      await executeProposal(proposalId, transactionManager)
      // Refresh data after execution
      await loadProposals()
    } catch (error) {
      console.error('Execution failed:', error)
    }
  }

  // Handle proposal creation
  const handleProposalCreated = async (proposalId: string) => {
    console.log('Proposal created:', proposalId)
    // Refresh data after creation
    await loadProposals()
    await loadStats()
  }

  // Get status color for display
  const getStatusColor = (state: ProposalState) => {
    switch (state) {
      case ProposalState.ACTIVE:
        return "bg-blue-600"
      case ProposalState.SUCCEEDED:
        return "bg-emerald-600"
      case ProposalState.DEFEATED:
        return "bg-red-600"
      case ProposalState.EXECUTED:
        return "bg-green-600"
      case ProposalState.CANCELLED:
        return "bg-gray-600"
      default:
        return "bg-gray-600"
    }
  }

  // Get status icon for display
  const getStatusIcon = (state: ProposalState) => {
    switch (state) {
      case ProposalState.ACTIVE:
        return <Clock className="h-4 w-4" />
      case ProposalState.SUCCEEDED:
        return <CheckCircle2 className="h-4 w-4" />
      case ProposalState.DEFEATED:
        return <XCircle className="h-4 w-4" />
      case ProposalState.EXECUTED:
        return <CheckCircle2 className="h-4 w-4" />
      case ProposalState.CANCELLED:
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Demo Mode Alert */}
        <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Demo Mode:</strong> Smart contracts are not deployed on this network. 
            You can create proposals, vote, and explore the governance interface with simulated data. 
            All transactions are simulated for demonstration purposes.
          </AlertDescription>
        </Alert>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">DAO Governance</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Participate in protocol decisions and shape the future of GaiaGrid
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <ProposalCreationDialog onProposalCreated={handleProposalCreated}>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Create Proposal
              </Button>
            </ProposalCreationDialog>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Treasury Balance</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {mockTreasuryStats.totalBalance}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{mockTreasuryStats.ethBalance}</p>
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
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {stats ? stats.activeProposals : mockTreasuryStats.proposalsActive}
                  </p>
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
                  <p className="text-sm text-muted-foreground">Total Proposals</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {stats ? stats.totalProposals : 0}
                  </p>
                  <p className="mt-1 text-xs text-emerald-600">
                    {stats ? `${stats.executedProposals} executed` : '+12% this month'}
                  </p>
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
                  <p className="text-sm text-muted-foreground">Total Voting Power</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    50 GAIA
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">in circulation</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                  <Vote className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Voting Power Card */}
        <div className="mb-8">
          <VotingPowerCard />
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
            <TabsTrigger value="succeeded" onClick={() => setFilterStatus("succeeded")}>
              Succeeded
            </TabsTrigger>
            <TabsTrigger value="defeated" onClick={() => setFilterStatus("defeated")}>
              Defeated
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filterStatus} className="mt-6 space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                <span>Loading proposals...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error Loading Proposals</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={handleRefresh} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : filteredProposals.length === 0 ? (
              <div className="text-center py-12">
                <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Proposals Found</h3>
                <p className="text-muted-foreground mb-4">
                  {filterStatus === "all" 
                    ? "No proposals have been created yet." 
                    : `No ${filterStatus} proposals found.`}
                </p>
                {account && (
                  <ProposalCreationDialog onProposalCreated={handleProposalCreated}>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      Create First Proposal
                    </Button>
                  </ProposalCreationDialog>
                )}
              </div>
            ) : (
              filteredProposals.map((proposal) => {
                const userVote = userVotes.get(proposal.id)
                return (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    userVote={userVote}
                    onVote={handleVote}
                    onExecute={handleExecute}
                  />
                )
              })
            )}
          </TabsContent>
        </Tabs>

        {/* Governance Info */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How to Vote</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>1. Hold energy NFTs in your connected wallet</p>
              <p>2. Review active proposals and their details</p>
              <p>3. Cast your vote for or against each proposal</p>
              <p>4. Your voting power is based on NFT holdings and type</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Proposal Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Minimum 10,000 voting power to create a proposal</p>
              <p>20,000 votes required to reach quorum</p>
              <p>Simple majority (50%+1) needed to pass</p>
              <p>Voting period: 7 days by default</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Voting Power Sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Energy NFT holdings (weighted by type)</p>
              <p>DAO points from carbon offset achievements</p>
              <p>Bonus for high environmental contributions</p>
              <p>Real-time updates on NFT transfers</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
