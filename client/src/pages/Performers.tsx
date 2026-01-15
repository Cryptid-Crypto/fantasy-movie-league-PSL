import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, ArrowLeft, Search } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function Performers() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: performers, isLoading } = trpc.performers.list.useQuery();

  const filteredPerformers = performers?.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-6">
          <Link href="/">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Performers</h1>
          <p className="text-muted-foreground">Browse all registered performers</p>
        </div>
      </div>

      <div className="container py-8">
        {/* Search */}
        <div className="mb-8 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search performers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading performers...</p>
          </div>
        ) : filteredPerformers && filteredPerformers.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredPerformers.map((performer) => (
              <Link key={performer.id} href={`/performers/${performer.id}`}>
                <Card className="overflow-hidden hover:glow transition-all cursor-pointer group">
                  <div className="aspect-[3/4] relative bg-muted">
                    {performer.imageUrl ? (
                      <img
                        src={performer.imageUrl}
                        alt={performer.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground truncate">
                      {performer.name}
                    </h3>
                    {performer.nftContractAddress && (
                      <p className="text-xs text-accent font-mono mt-1 truncate">
                        NFT: {performer.nftContractAddress.slice(0, 6)}...
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl mb-2">No performers found</p>
            {searchQuery && (
              <p className="text-sm">Try adjusting your search</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
