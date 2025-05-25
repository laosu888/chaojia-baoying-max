import { HeroSection } from '@/components/sections/hero-section';
import { ComebackGenerator } from '@/components/sections/comeback-generator';
import { Testimonials } from '@/components/sections/testimonials';
import { MemeEditorSection } from '@/components/sections/meme-editor';
import { RankingSection } from '@/components/sections/ranking-section';
import { KnowledgeBase } from '@/components/sections/knowledge-base';
import { Footer } from '@/components/sections/footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HeroSection />
        <ComebackGenerator />
        <RankingSection />
        <MemeEditorSection />
        <Testimonials />
        <KnowledgeBase />
      </div>
      <Footer />
    </div>
  );
}