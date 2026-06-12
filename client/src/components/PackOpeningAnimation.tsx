import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Gift, Check } from "lucide-react";

const RARITY_COLORS: Record<string, string> = {
  Common: "border-slate-500/40 bg-slate-500/10 text-slate-300",
  Rare: "border-blue-500/40 bg-blue-500/10 text-blue-300",
  Epic: "border-purple-500/40 bg-purple-500/10 text-purple-300",
  Legendary: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
};

const RARITY_COUNTS = {
  Rare: 1,
  Epic: 2,
  Common: 5,
};

interface PackOpeningAnimationProps {
  cards: any[];
  packName: string;
  onClose: () => void;
}

export default function PackOpeningAnimation({
  cards,
  packName,
  onClose,
}: PackOpeningAnimationProps) {
  const [stage, setStage] = useState<"pack" | "revealing" | "complete">("pack");
  const [revealedCards, setRevealedCards] = useState<any[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Start the pack opening animation
    const timer = setTimeout(() => {
      setStage("revealing");
      
      // Reveal cards sequentially with a slight delay
      cards.forEach((card, index) => {
        setTimeout(() => {
          setRevealedCards((prev) => [...prev, card]);
        }, index * 400); // Each card reveals 400ms apart
      });

      // Show confetti when all cards are revealed
      setTimeout(() => {
        setShowConfetti(true);
        setStage("complete");
      }, cards.length * 400 + 500);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cards]);

  const getRarityLabel = (rarity: string) => {
    if (rarity === "Epic") return "Uncommon";
    return rarity;
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-4xl w-full">
        {/* Confetti effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-primary rounded-full"
                initial={{
                  x: Math.random() * 800 - 400,
                  y: -100,
                  opacity: 1,
                }}
                animate={{
                  y: 600,
                  opacity: 0,
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  ease: "easeOut",
                  delay: Math.random() * 0.5,
                }}
                style={{
                  backgroundColor: ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981"][i % 4],
                }}
              />
            ))}
          </div>
        )}

        {/* Pack Opening Animation */}
        {stage === "pack" && (
          <motion.div
            className="flex flex-col items-center justify-center py-20"
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", duration: 1 }}
          >
            <motion.div
              className="relative"
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 10, -10, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            >
              <div className="w-48 h-64 bg-gradient-to-br from-primary/20 to-primary/40 rounded-2xl border-2 border-primary flex items-center justify-center relative overflow-hidden">
                <Gift className="h-24 w-24 text-primary" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="text-white font-bold text-lg">{packName}</p>
                  <p className="text-primary text-sm">8 Cards Inside</p>
                </div>
              </div>
            </motion.div>
            <p className="text-muted-foreground mt-6 text-lg">Opening your pack...</p>
          </motion.div>
        )}

        {/* Card Reveal Stage */}
        {stage !== "pack" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold flex items-center justify-center gap-3">
                <Sparkles className="h-8 w-8 text-primary" />
                {packName} Opened!
              </h2>
              <p className="text-muted-foreground">
                You received {revealedCards.length} Performer NFT cards
              </p>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <AnimatePresence>
                {revealedCards.map((card: any, index: number) => (
                  <motion.div
                    key={card.id}
                    initial={{ 
                      rotateY: -180, 
                      scale: 0.5,
                      opacity: 0,
                    }}
                    animate={{ 
                      rotateY: 0, 
                      scale: 1,
                      opacity: 1,
                    }}
                    transition={{ 
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                      delay: index * 0.1,
                    }}
                  >
                    <Card className="overflow-hidden">
                      <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                        {card.cardImageUrl ? (
                          <img
                            src={card.cardImageUrl}
                            alt={card.performerName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/20">
                            <Sparkles className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        {/* Rarity badge */}
                        <div className="absolute top-2 right-2">
                          <Badge className={`text-xs ${RARITY_COLORS[card.rarity]}`}>
                            {getRarityLabel(card.rarity)}
                          </Badge>
                        </div>
                        {/* Serial number */}
                        <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs">
                          #{card.serialNumber}
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <p className="text-sm font-semibold truncate">
                          {card.performerName}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            {stage === "complete" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center space-y-4"
              >
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge className={RARITY_COLORS.Rare}>Rare</Badge>
                    <span className="text-muted-foreground">× {RARITY_COUNTS.Rare}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={RARITY_COLORS.Epic}>Uncommon</Badge>
                    <span className="text-muted-foreground">× {RARITY_COUNTS.Epic}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={RARITY_COLORS.Common}>Common</Badge>
                    <span className="text-muted-foreground">× {RARITY_COUNTS.Common}</span>
                  </div>
                </div>
                
                <Button onClick={onClose} className="gap-2">
                  <Check className="h-4 w-4" />
                  View in My Collection
                </Button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}