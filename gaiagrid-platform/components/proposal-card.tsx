"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Vote, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Users,
  TrendingUp,
  Calendar,
  User,
  MessageSquare
} from "lucide-react"
import { useWeb3 } from "@/lib/web3-context"
import { useGovernance, VoteType, ProposalState } from "@/lib/contracts/hooks/useGovernance"
import { TransactionManager, TransactionType } from "@/lib/contracts/transactions"

interface ProposalCardProps {
  proposal: {
    id: string
    proposer: string
    title: string
    description: string
    targets: string[]
    values: string[]
    signatures: string[]
    calldatas: string[]
    startBlock: number
    endBlock: number
    forVotes: string
    againstVotes: string
    abstainVotes: string
    executed: boolean
    cancelled: boolean
    createdAt: number
    state: ProposalState
  }
  userVote?: {
    hasVoted: boolean
    support: VoteType
    votes: string
  }
  onVote?: (proposalId: string, support: VoteType) => void
  onExecute?: (proposalId: string) => void
  className?: string
}

export function ProposalCard({ 
  proposal, 
  userVote, 
  onVote, 
  onExecute, 
  className 
}: ProposalCardProps) {
  const { account } = useWeb3()
  const [isVoting, setIsVoting] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // Calculate vote totals and percentages (convert from wei to GAIA)
  const forVotes = parseFloat(proposal.forVotes) / 1000000000000000000 // Convert wei to GAIA
  const againstVotes = parseFloat(proposal.againstVotes) / 1000000000000000000 // Convert wei to GAIA
  const abstainVotes = parseFloat(proposal.abstainVotes) / 1000000000000000000 // Convert wei to GAIA
  const totalVotes = forVotes + againstVotes + abstainVotes

  const forPercentage = totalVotes > 0 ? (forVotes / totalVotes) * 100 : 0
  const againstPercentage = totalVotes > 0 ? (againstVotes / totalVotes) * 100 : 0

  // Calculate time remaining
  const now = Date.now()
  const endTime = proposal.endBlock * 1000 // Convert block to timestamp (approximate)
  const timeRemaining = endTime - now
  const isActive = proposal.state === ProposalState.ACTIVE
  const isEnded = timeRemaining <= 0

  // Format time remaining
  const formatTimeRemaining = (ms: number) => {
    if (ms <= 0) return "Ended"
    
    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  // Get status info
  const getStatusInfo = () => {
    switch (proposal.state) {
      case ProposalState.PENDING:
        return { 
          label: "Pending", 
          color: "bg-yellow-600", 
          icon: Clock 
        }
      case ProposalState.ACTIVE:
        return { 
          label: "Active", 
          color: "bg-blue-600", 
          icon: Vote 
        }
      case ProposalState.SUCCEEDED:
        return { 
          label: "Succeeded", 
          color: "bg-emerald-600", 
          icon: CheckCircle2 
        }
      case ProposalState.DEFEATED:
        return { 
          label: "Defeated", 
          color: "bg-red-600", 
          icon: XCircle 
        }
      case ProposalState.EXECUTED:
        return { 
          label: "Executed", 
          color: "bg-green-600", 
          icon: CheckCircle2 
        }
      case ProposalState.CANCELLED:
        return { 
          label: "Cancelled", 
          color: "bg-gray-600", 
          icon: XCircle 
        }
      default:
        return { 
          label: "Unknown", 
          color: "bg-gray-600", 
          icon: AlertCircle 
        }
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  // Handle vote
  const handleVote = async (support: VoteType) => {
    if (!onVote || !account) return

    setIsVoting(true)
    try {
      await onVote(proposal.id, support)
    } catch (error) {
      console.error('Vote failed:', error)
    } finally {
      setIsVoting(false)
    }
  }

  // Handle execute
  const handleExecute = async () => {
    if (!onExecute || !account) return

    setIsExecuting(true)
    try {
      await onExecute(proposal.id)
    } catch (error) {
      console.error('Execution failed:', error)
    } finally {
      setIsExecuting(false)
    }
  }

  // Check if user can vote
  const canVote = account && isActive && !userVote?.hasVoted && !isEnded

  // Check if user can execute
  const canExecute = account && proposal.state === ProposalState.SUCCEEDED && !proposal.executed

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-lg">{proposal.title}</CardTitle>
              <Badge className={statusInfo.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusInfo.label}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2">
              {proposal.description}
            </CardDescription>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(proposal.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatTimeRemaining(timeRemaining)}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Voting Results */}
        {totalVotes > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-emerald-600 font-medium">For</span>
              <span className="font-medium">
                {forVotes.toFixed(0)} GAIA ({forPercentage.toFixed(1)}%)
              </span>
            </div>
            <Progress value={forPercentage} className="h-2" />
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-red-600 font-medium">Against</span>
              <span className="font-medium">
                {againstVotes.toFixed(0)} GAIA ({againstPercentage.toFixed(1)}%)
              </span>
            </div>
            <Progress value={againstPercentage} className="h-2" />
            
            {abstainVotes > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">Abstain</span>
                <span className="font-medium">
                  {abstainVotes.toFixed(0)} GAIA ({((abstainVotes / totalVotes) * 100).toFixed(1)}%)
                </span>
              </div>
            )}
          </div>
        )}

        {/* User Vote Status */}
        {userVote?.hasVoted && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>You voted: </span>
              <Badge variant="outline">
                {userVote.support === VoteType.FOR ? 'For' : 
                 userVote.support === VoteType.AGAINST ? 'Against' : 'Abstain'}
              </Badge>
              <span className="text-muted-foreground">
                ({userVote.votes} votes)
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {canVote && (
            <>
              <Button
                onClick={() => handleVote(VoteType.FOR)}
                disabled={isVoting}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {isVoting ? 'Voting...' : 'Vote For'}
              </Button>
              <Button
                onClick={() => handleVote(VoteType.AGAINST)}
                disabled={isVoting}
                variant="outline"
                className="flex-1"
              >
                Vote Against
              </Button>
              <Button
                onClick={() => handleVote(VoteType.ABSTAIN)}
                disabled={isVoting}
                variant="ghost"
                className="flex-1"
              >
                Abstain
              </Button>
            </>
          )}

          {canExecute && (
            <Button
              onClick={handleExecute}
              disabled={isExecuting}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isExecuting ? 'Executing...' : 'Execute Proposal'}
            </Button>
          )}

          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-1" />
                Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{proposal.title}</DialogTitle>
                <DialogDescription>
                  Proposal #{proposal.id} • Created by {proposal.proposer}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {proposal.description}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Voting Results</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>For: {forVotes.toFixed(0)} GAIA</span>
                      <span>Against: {againstVotes.toFixed(0)} GAIA</span>
                      <span>Abstain: {abstainVotes.toFixed(0)} GAIA</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total: {totalVotes.toFixed(0)} GAIA</span>
                      <span>Status: {statusInfo.label}</span>
                    </div>
                  </div>
                </div>

                {proposal.targets.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Execution Details</h4>
                    <div className="space-y-1 text-sm">
                      <div>Targets: {proposal.targets.length}</div>
                      <div>Values: {proposal.values.length}</div>
                      <div>Signatures: {proposal.signatures.length}</div>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
