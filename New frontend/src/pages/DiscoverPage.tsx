import { Bell, User, Search, Filter, Globe, Menu } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { UniversityCard } from "@/components/university/UniversityCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo, useEffect } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const DiscoverPage = () => {
  const { universities, shortlistUniversity, userProfile, loadUniversities } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All Universities");
  const [countryFilter, setCountryFilter] = useState("All Countries");
  const [budgetFilter, setBudgetFilter] = useState("All Budgets");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [isSearching, setIsSearching] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Trigger backend search when query changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 3) {
        setIsSearching(true);
        await loadUniversities(searchQuery);
        setIsSearching(false);
      } else if (searchQuery.length === 0) {
        // Reset to default list
        loadUniversities();
      }
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const filteredUniversities = useMemo(() => {
    return universities.filter(uni => {
      const matchesSearch = uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uni.country.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === "All Universities" ||
        uni.tag.toLowerCase() === activeTab.toLowerCase() ||
        (activeTab === "Global" && uni.id.toString().startsWith("ext:"));

      const matchesCountry = countryFilter === "All Countries" || uni.country === countryFilter;
      const matchesBudget = budgetFilter === "All Budgets" || uni.costLevel === budgetFilter;
      const matchesCategory = categoryFilter === "All Categories" || uni.tag === categoryFilter;

      return matchesSearch && matchesTab && matchesCountry && matchesBudget && matchesCategory;
    });
  }, [universities, searchQuery, activeTab, countryFilter, budgetFilter, categoryFilter]);

  const countries = useMemo(() => {
    const uniqueCountries = Array.from(new Set(universities.map(u => u.country))).sort();
    return ["All Countries", ...uniqueCountries];
  }, [universities]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar isOpen={isSidebarOpen} setOpen={setIsSidebarOpen} />

      <main className="lg:pl-64 min-h-screen">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-semibold text-foreground"
              >
                Discover Universities
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-muted-foreground"
              >
                Find your ideal university match
              </motion.p>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/profile"
                className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center cursor-pointer"
              >
                <User className="h-5 w-5 text-primary" />
              </Link>
            </motion.div>
          </motion.div>
        </motion.header>

        {/* Content */}
        <div className="p-4 lg:p-8">
          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-4 shadow-soft border border-border/50 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search universities..."
                  className="pl-11"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-3 flex-wrap">
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Country" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={budgetFilter} onValueChange={setBudgetFilter}>
                  <SelectTrigger className="w-[150px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Budget" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {["All Budgets", "Low", "Medium", "High"].map(b => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[150px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Category" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {["All Categories", "Dream", "Target", "Safe"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-2 mb-6 overflow-x-auto pb-2 lg:pb-0 no-scrollbar"
          >
            {["All Universities", "Dream", "Target", "Safe", "Global"].map((tab) => (
              <motion.div
                key={tab}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-shrink-0"
              >
                <Button
                  variant={activeTab === tab ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(tab)}
                  className="gap-2"
                >
                  {tab === "Global" && <Globe className="h-3 w-3" />}
                  {tab}
                </Button>
              </motion.div>
            ))}
          </motion.div>

          {/* Results count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between mb-6"
          >
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredUniversities.length}</span> universities
              {isSearching && <span className="ml-2 animate-pulse text-primary">(Searching globally...)</span>}
            </p>
          </motion.div>

          {/* Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredUniversities.map((uni, index) => (
              <UniversityCard
                key={uni.id}
                name={uni.name}
                country={uni.country}
                image={uni.image || ""}
                category={uni.tag.toLowerCase() as any}
                costLevel={uni.costLevel}
                acceptanceChance={uni.acceptanceChance as any}
                description={uni.whyFits}
                isShortlisted={uni.isShortlisted}
                onShortlist={() => shortlistUniversity(uni.id)}
                index={index}
              />
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default DiscoverPage;
