import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SEO } from '../components/SEO';
import { PremiumHero } from '../components/home/PremiumHero';
import { PremiumToolGrid } from '../components/home/PremiumToolGrid';
import { PremiumStats } from '../components/home/PremiumStats';
import { PremiumWhyChoose } from '../components/home/PremiumWhyChoose';
import { PremiumArticles } from '../components/home/PremiumArticles';
import { PremiumCTA } from '../components/home/PremiumCTA';
import { DeferredSection } from '../components/DeferredSection';
import { PDF_TOOLS } from '../utils/toolsData';
import { ToolCategory } from '../types/toolTypes';
import { getFavoriteTools, toggleFavoriteTool } from '../utils/storageUtils';
import { getAllBlogPosts } from '../data/blogData';

export const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteIds(getFavoriteTools());
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    const updated = toggleFavoriteTool(id);
    setFavoriteIds(updated);
  }, []);

  const latestArticles = useMemo(() => {
    return getAllBlogPosts().slice(0, 6);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSelectCategory = useCallback((category: ToolCategory) => {
    setSelectedCategory(category);
  }, []);

  const filteredTools = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return PDF_TOOLS.filter((tool) => {
      const matchesSearch =
        !query ||
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === 'all' || tool.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#06070B] text-slate-100 font-sans selection:bg-red-500/30 selection:text-white">
      <SEO
        title="SmartPDF AI - Next-Gen Commercial Browser PDF Utility Suite"
        description="Merge, split, compress, protect, unlock, OCR, and convert PDF documents easily online with zero server uploads."
        path="/"
      />

      {/* Premium Hero Section */}
      <PremiumHero searchQuery={searchQuery} onSearchChange={handleSearchChange} />

      {/* Premium Key Statistics */}
      <DeferredSection fallbackHeight="min-h-[220px]">
        <PremiumStats />
      </DeferredSection>

      {/* Premium Tools Catalog & Spotlights */}
      <PremiumToolGrid
        tools={filteredTools}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        favoriteIds={favoriteIds}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Premium Why Choose SmartPDF AI Section */}
      <DeferredSection fallbackHeight="min-h-[550px]">
        <PremiumWhyChoose />
      </DeferredSection>

      {/* Premium Latest Articles & Guides Section */}
      <DeferredSection fallbackHeight="min-h-[500px]">
        <PremiumArticles articles={latestArticles} />
      </DeferredSection>

      {/* Premium CTA Bottom Banner */}
      <DeferredSection fallbackHeight="min-h-[350px]">
        <PremiumCTA />
      </DeferredSection>
    </div>
  );
};
