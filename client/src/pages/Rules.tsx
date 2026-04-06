import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { BookOpen, Zap, Trophy, Star, Shield, Users, Sparkles, Info } from "lucide-react";

export default function Rules() {
  const { data: actions } = trpc.admin.actions.list.useQuery();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-10">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Header */}
          <div className="text-center space-y-3">
            <Badge variant="outline" className="text-primary border-primary">
              <BookOpen className="h-3 w-3 mr-1" />
              Official Rules
            </Badge>
            <h1 className="text-4xl font-bold">Rules & Scoring</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to know about how Porn Star League works — from NFT ownership to tournament scoring.
            </p>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="scoring">Scoring</TabsTrigger>
              <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
              <TabsTrigger value="nfts">NFTs & Badges</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {[
                    { step: "1", title: "Acquire Performer NFTs", desc: "Browse the Marketplace and purchase NFT cards representing your favourite performers. Each card is unique and tied to a real performer's scene data." },
                    { step: "2", title: "Enter a Tournament", desc: "Select a tournament, build a roster of performer NFTs that meets the entry requirements, pay the entry fee in MATIC, and submit your lineup." },
                    { step: "3", title: "Earn Points Automatically", desc: "Our admin team logs real scene actions from new movie releases. Each action earns points for the performer who performed it. Your roster's total points determine your rank." },
                    { step: "4", title: "Win Prizes", desc: "At the end of the tournament period, the top players on the leaderboard share the prize pool in MATIC. Future seasons will also distribute PSL token rewards." },
                  ].map(({ step, title, desc }) => (
                    <div key={step} className="flex gap-4">
                      <div className="flex-shrink-0 w-9 h-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                        {step}
                      </div>
                      <div>
                        <p className="font-semibold">{title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Platform Rules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    {[
                      "You must be 18 years of age or older to participate.",
                      "One account per player. Multi-accounting is prohibited and will result in a permanent ban.",
                      "NFT ownership is verified on-chain via the Polygon network at the time of tournament entry.",
                      "Scene actions are logged by the PSL admin team and are final. Disputes may be submitted within 48 hours of logging.",
                      "Prize payouts are processed within 7 days of tournament end.",
                      "PSL reserves the right to disqualify players found to be manipulating scores or exploiting platform bugs.",
                    ].map((rule, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex-shrink-0 w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                        <span className="text-muted-foreground">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Scoring */}
            <TabsContent value="scoring" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Action Point Values
                  </CardTitle>
                  <CardDescription>
                    Points are awarded per scene based on the actions performed. Multiple actions can be logged per scene.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!actions || actions.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-6">Scoring data loading...</p>
                  ) : (
                    <div className="space-y-2">
                      {[...actions].sort((a: any, b: any) => b.pointValue - a.pointValue).map((action: any) => (
                        <div key={action.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <Zap className="h-4 w-4 text-primary" />
                            <span className="font-medium capitalize">{action.name}</span>
                            {action.description && (
                              <span className="text-xs text-muted-foreground hidden sm:block">— {action.description}</span>
                            )}
                          </div>
                          <Badge variant="outline" className="text-primary border-primary font-bold">
                            +{action.pointValue} pts
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Scoring Multipliers</CardTitle>
                  <CardDescription>Certain badges and conditions apply bonus multipliers to base point values.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { badge: "Legend", multiplier: "2.0×", desc: "All scene actions earn double points" },
                      { badge: "Hall of Fame", multiplier: "1.75×", desc: "Scene actions earn 75% bonus points" },
                      { badge: "Rising Star", multiplier: "1.5×", desc: "Scene actions earn 50% bonus points" },
                      { badge: "Anal Queen", multiplier: "1.25×", desc: "Anal actions earn 25% bonus points" },
                      { badge: "Super Slut", multiplier: "1.25×", desc: "All actions earn 25% bonus points" },
                    ].map(({ badge, multiplier, desc }) => (
                      <div key={badge} className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <div>
                            <span className="font-medium">{badge}</span>
                            <p className="text-xs text-muted-foreground">{desc}</p>
                          </div>
                        </div>
                        <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30 font-bold">
                          {multiplier}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tournaments */}
            <TabsContent value="tournaments" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Tournament Rules
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {[
                    { title: "Roster Requirements", desc: "Each tournament specifies a required roster composition — for example, '2 Legends, 1 Anal Queen, and 2 of any type'. Your selected NFTs must meet these requirements to enter." },
                    { title: "Entry Fees", desc: "Entry fees are paid in MATIC on the Polygon network. Fees are locked in the tournament smart contract until prizes are distributed." },
                    { title: "Scoring Period", desc: "Points are earned from scene actions logged during the tournament's active period (start date to end date). Actions from scenes outside this window do not count." },
                    { title: "Roster Lock", desc: "Rosters can be edited up until the tournament start date. Once the tournament begins, rosters are locked and cannot be changed." },
                    { title: "Prize Distribution", desc: "Default prize split: 1st place 50%, 2nd place 30%, 3rd place 20%. Some tournaments may have custom prize structures — check the tournament details page." },
                    { title: "Tiebreakers", desc: "In the event of a tie, the player who submitted their entry first will rank higher." },
                  ].map(({ title, desc }) => (
                    <div key={title} className="border-l-2 border-primary/40 pl-4">
                      <p className="font-semibold">{title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* NFTs & Badges */}
            <TabsContent value="nfts" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    NFT Rarity Tiers
                  </CardTitle>
                  <CardDescription>Each performer NFT is assigned a rarity tier that affects its scoring multiplier and market value.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { rarity: "Common", color: "text-slate-400 border-slate-400/30", desc: "Standard performer card. Base point values with no multiplier.", supply: "Unlimited" },
                      { rarity: "Rare", color: "text-blue-400 border-blue-400/30", desc: "Limited edition card. 1.5× scoring multiplier.", supply: "500 per performer" },
                      { rarity: "Epic", color: "text-purple-400 border-purple-400/30", desc: "Exclusive card with animated effects. 1.75× scoring multiplier.", supply: "100 per performer" },
                      { rarity: "Legendary", color: "text-yellow-400 border-yellow-400/30", desc: "Ultra-rare animated card. 2× scoring multiplier. Eligible for special tournaments.", supply: "10 per performer" },
                    ].map(({ rarity, color, desc, supply }) => (
                      <div key={rarity} className={`p-4 rounded-lg border ${color.split(" ")[1]} bg-muted/20`}>
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className={`${color}`}>{rarity}</Badge>
                          <span className="text-xs text-muted-foreground">Supply: {supply}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Performer Badge Types
                  </CardTitle>
                  <CardDescription>Badges are assigned by the PSL admin team based on a performer's career achievements and specialties.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { badge: "Legend", desc: "Top-tier performers with a long career and massive fanbase" },
                      { badge: "Hall of Fame", desc: "Industry icons who have received major awards" },
                      { badge: "Rising Star", desc: "New performers showing exceptional early performance" },
                      { badge: "Anal Queen", desc: "Specialists in anal scenes with high frequency" },
                      { badge: "Super Slut", desc: "Performers known for high-volume and diverse scenes" },
                      { badge: "Girl Next Door", desc: "Approachable, natural performers with broad appeal" },
                      { badge: "MILF", desc: "Mature performers with experience and dedicated fans" },
                      { badge: "Squirt Queen", desc: "Known for squirting scenes and fluid performances" },
                    ].map(({ badge, desc }) => (
                      <div key={badge} className="flex gap-3 p-3 rounded-lg border border-border">
                        <Star className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">{badge}</p>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
