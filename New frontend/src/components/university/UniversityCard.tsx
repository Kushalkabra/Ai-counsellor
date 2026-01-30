import { cn } from "@/lib/utils";
import { MapPin, DollarSign, TrendingUp, Star, ArrowRight } from "lucide-react";
import { countryImages } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface UniversityCardProps {
  name: string;
  country: string;
  image: string;
  category: "dream" | "target" | "safe" | "external";
  costLevel: string;
  acceptanceChance: string | number;
  description: string;
  onShortlist?: () => void;
  index?: number;
  isShortlisted?: boolean;
}

const categoryStyles = {
  dream: { bg: "bg-primary/10", text: "text-primary", label: "Dream" },
  target: { bg: "bg-warning-muted", text: "text-warning", label: "Target" },
  safe: { bg: "bg-success-muted", text: "text-success", label: "Safe" },
  external: { bg: "bg-blue-500/10", text: "text-blue-500", label: "Global" },
};

export const UniversityCard = ({
  name,
  country,
  image,
  category,
  costLevel,
  acceptanceChance,
  description,
  onShortlist,
  index = 0,
  isShortlisted = false,
}: UniversityCardProps) => {
  const categoryStyle = categoryStyles[category] || categoryStyles.target;
  // ... imports and rest of component
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut",
      }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="bg-card rounded-2xl overflow-hidden border border-border/50 card-elevated group"
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <motion.img
          src={image || "/univ_usa.png"}
          alt={name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Category badge */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + index * 0.1 }}
          className="absolute top-3 left-3"
        >
          <motion.span
            whileHover={{ scale: 1.05 }}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm",
              categoryStyle.bg,
              categoryStyle.text
            )}
          >
            {categoryStyle.label}
          </motion.span>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-5">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 + index * 0.1 }}
          className="text-lg font-semibold text-foreground mb-1"
        >
          {name}
        </motion.h3>
        <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
          <MapPin className="h-3.5 w-3.5" />
          <span className="text-sm">{country}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1 px-2.5 py-1 bg-secondary rounded-lg text-xs"
          >
            <DollarSign className="h-3 w-3 text-muted-foreground" />
            <span className="text-foreground">{costLevel === '0' || costLevel === '' ? 'Varies' : costLevel}</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1 px-2.5 py-1 bg-secondary rounded-lg text-xs"
          >
            <TrendingUp className="h-3 w-3 text-muted-foreground" />
            <span className="text-foreground">
              {acceptanceChance === 0 || acceptanceChance === '0' ? 'Selective' : `${acceptanceChance}${typeof acceptanceChance === 'number' ? '%' : ''} chance`}
            </span>
          </motion.div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              View Details
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
            <Button
              size="sm"
              variant={isShortlisted ? "secondary" : "default"}
              className="w-full"
              onClick={onShortlist}
            >
              <Star className={cn("h-3.5 w-3.5 mr-1", isShortlisted && "fill-current")} />
              {isShortlisted ? "Shortlisted" : "Shortlist"}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
