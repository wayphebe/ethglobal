"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  FileText, 
  Settings, 
  DollarSign, 
  Users, 
  Leaf, 
  CheckCircle2, 
  ArrowRight,
  AlertCircle,
  Info
} from "lucide-react"
import { useWeb3 } from "@/lib/web3-context"
import { useGovernance } from "@/lib/contracts/hooks/useGovernance"
import { TransactionManager, TransactionType } from "@/lib/contracts/transactions"
import { votingPowerCalculator } from "@/lib/voting-power-calculator"

interface ProposalCreationDialogProps {
  children: React.ReactNode
  onProposalCreated?: (proposalId: string) => void
}

type ProposalCategory = 'infrastructure' | 'pricing' | 'governance' | 'sustainability'

interface ProposalTemplate {
  id: string
  name: string
  category: ProposalCategory
  title: string
  description: string
  targets: string[]
  values: string[]
  signatures: string[]
  calldatas: string[]
}

const PROPOSAL_TEMPLATES: ProposalTemplate[] = [
  {
    id: 'infra-storage-upgrade',
    name: 'Storage System Upgrade',
    category: 'infrastructure',
    title: 'Upgrade Community Storage System',
    description: 'Proposal to upgrade the community energy storage system with new battery technology, increasing capacity by 50% and improving efficiency.',
    targets: ['0x0000000000000000000000000000000000000000'], // Placeholder
    values: ['0'],
    signatures: ['upgradeStorage()'],
    calldatas: ['0x']
  },
  {
    id: 'pricing-fee-reduction',
    name: 'Trading Fee Reduction',
    category: 'pricing',
    title: 'Reduce Energy Trading Fees',
    description: 'Proposal to reduce energy trading fees from 2% to 1.5% to encourage more trading activity and community participation.',
    targets: ['0x0000000000000000000000000000000000000000'], // Placeholder
    values: ['0'],
    signatures: ['setTradingFee(uint256)'],
    calldatas: ['0x000000000000000000000000000000000000000000000000000000000000000f'] // 15 = 1.5%
  },
  {
    id: 'gov-quorum-increase',
    name: 'Quorum Increase',
    category: 'governance',
    title: 'Increase Proposal Quorum Requirement',
    description: 'Proposal to increase the quorum requirement from 20,000 to 25,000 votes to ensure more community participation in governance decisions.',
    targets: ['0x0000000000000000000000000000000000000000'], // Placeholder
    values: ['0'],
    signatures: ['setQuorum(uint256)'],
    calldatas: ['0x00000000000000000000000000000000000000000000000000000000000061a8'] // 25000
  },
  {
    id: 'sustainability-carbon-bonus',
    name: 'Carbon Offset Bonus',
    category: 'sustainability',
    title: 'Increase Carbon Offset Voting Power Bonus',
    description: 'Proposal to increase the voting power bonus for carbon offset achievements from 5% to 10% per 10 tons to incentivize environmental contributions.',
    targets: ['0x0000000000000000000000000000000000000000'], // Placeholder
    values: ['0'],
    signatures: ['setCarbonBonusMultiplier(uint256)'],
    calldatas: ['0x000000000000000000000000000000000000000000000000000000000000000a'] // 10 = 10%
  }
]

const CATEGORY_ICONS = {
  infrastructure: Settings,
  pricing: DollarSign,
  governance: Users,
  sustainability: Leaf
}

const CATEGORY_COLORS = {
  infrastructure: 'bg-blue-600',
  pricing: 'bg-green-600',
  governance: 'bg-purple-600',
  sustainability: 'bg-emerald-600'
}

export function ProposalCreationDialog({ children, onProposalCreated }: ProposalCreationDialogProps) {
  const { account } = useWeb3()
  const { createProposal, isLoading } = useGovernance()
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [votingPower, setVotingPower] = useState(0)
  const [canCreate, setCanCreate] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as ProposalCategory | '',
    template: '',
    duration: 7
  })

  // Check voting power on mount
  useEffect(() => {
    if (account) {
      // TODO: Get actual voting power from voting power calculator
      // For now, use mock data
      const mockVotingPower = 15000
      setVotingPower(mockVotingPower)
      setCanCreate(mockVotingPower >= 10000)
    }
  }, [account])

  const totalSteps = 4

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = PROPOSAL_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setFormData(prev => ({
        ...prev,
        template: templateId,
        title: template.title,
        description: template.description,
        category: template.category
      }))
    }
  }

  const handleSubmit = async () => {
    if (!account || !createProposal) return

    setIsCreating(true)
    try {
      const template = PROPOSAL_TEMPLATES.find(t => t.id === formData.template)
      if (!template) throw new Error('Template not found')

      // Create transaction manager
      const transactionManager = new TransactionManager()

      // Create the proposal
      const transaction = await createProposal(
        formData.title,
        formData.description,
        template.targets,
        template.values,
        template.signatures,
        template.calldatas,
        transactionManager
      )

      // Wait for transaction confirmation
      await transaction.waitForConfirmation()

      // Call success callback
      onProposalCreated?.(transaction.hash)

      // Reset form and close dialog
      setFormData({
        title: '',
        description: '',
        category: '',
        template: '',
        duration: 7
      })
      setCurrentStep(1)
      setIsOpen(false)
      setShowConfirm(false)

    } catch (error) {
      console.error('Failed to create proposal:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const selectedTemplate = PROPOSAL_TEMPLATES.find(t => t.id === formData.template)
  const CategoryIcon = formData.category ? CATEGORY_ICONS[formData.category] : FileText

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Create New Proposal
            </DialogTitle>
            <DialogDescription>
              Submit a proposal for the community to vote on
            </DialogDescription>
          </DialogHeader>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          </div>

          {/* Step 1: Category Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Choose Proposal Category</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select the category that best describes your proposal
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {Object.entries(CATEGORY_ICONS).map(([category, Icon]) => (
                  <Card
                    key={category}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.category === category ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, category: category as ProposalCategory }))}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base capitalize">{category}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-sm">
                        {category === 'infrastructure' && 'Hardware upgrades, system improvements, technical changes'}
                        {category === 'pricing' && 'Fee adjustments, pricing models, economic parameters'}
                        {category === 'governance' && 'Governance rules, voting parameters, DAO structure'}
                        {category === 'sustainability' && 'Environmental initiatives, carbon programs, green policies'}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Template Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Choose Template</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select a template to get started, or create a custom proposal
                </p>
              </div>

              <div className="space-y-3">
                {PROPOSAL_TEMPLATES
                  .filter(t => !formData.category || t.category === formData.category)
                  .map((template) => {
                    const Icon = CATEGORY_ICONS[template.category]
                    return (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          formData.template === template.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handleTemplateSelect(template.id)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${CATEGORY_COLORS[template.category]}`}>
                                <Icon className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <CardTitle className="text-base">{template.name}</CardTitle>
                                <CardDescription className="text-sm mt-1">
                                  {template.description}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {template.category}
                            </Badge>
                          </div>
                        </CardHeader>
                      </Card>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Step 3: Proposal Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Proposal Details</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Review and customize your proposal details
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Proposal Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter a clear, concise title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide detailed information about your proposal..."
                    rows={6}
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Voting Duration (days)</Label>
                  <Select
                    value={formData.duration.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, duration: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="5">5 days</SelectItem>
                      <SelectItem value="7">7 days (recommended)</SelectItem>
                      <SelectItem value="10">10 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Review Proposal</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Review your proposal before submitting
                </p>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${formData.category ? CATEGORY_COLORS[formData.category] : 'bg-gray-600'}`}>
                      <CategoryIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{formData.title}</CardTitle>
                      <CardDescription className="capitalize">
                        {formData.category} • {formData.duration} days
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {formData.description}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Template Details</h4>
                      {selectedTemplate && (
                        <div className="text-sm text-muted-foreground">
                          <div>Targets: {selectedTemplate.targets.length}</div>
                          <div>Values: {selectedTemplate.values.length}</div>
                          <div>Signatures: {selectedTemplate.signatures.length}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Voting Power Check */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4" />
                  <span className="font-medium">Voting Power Check</span>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Your Voting Power:</span>
                    <span className={canCreate ? 'text-emerald-600' : 'text-red-600'}>
                      {votingPower.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Required:</span>
                    <span>10,000</span>
                  </div>
                  {!canCreate && (
                    <div className="text-red-600 text-xs mt-2">
                      You need at least 10,000 voting power to create a proposal
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              
              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !formData.category) ||
                    (currentStep === 2 && !formData.template) ||
                    (currentStep === 3 && (!formData.title || !formData.description))
                  }
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={() => setShowConfirm(true)}
                  disabled={!canCreate || !formData.title || !formData.description}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Create Proposal
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create Proposal?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new governance proposal that the community can vote on. 
              You cannot edit the proposal after creation. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={isCreating}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isCreating ? 'Creating...' : 'Create Proposal'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
